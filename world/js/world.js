class World {
    constructor(graph, 
                roadWidth = 100, 
                roadRoundness = 20,
                buildingWidth = 150,
                buildingMinimumLength = 150,
                spacing = 50,
                treeSize = 160
                ) {
        this.graph = graph;
        this.roadWidth = roadWidth;
        this.roadRoundness = roadRoundness;

        this.buildingWidth = buildingWidth;
        this.buildingMinimumLength = buildingMinimumLength;
        this.spacing = spacing;
        this.treeSize = treeSize;

        this.envelopes = [];
        this.roadBorders = [];
        this.buildings = [];
        this.trees = []
        this.laneGuides = [];

        this.markings = [];

        this.generate();
    }

    static load(info) {
        const world = new World(new Graph());

        world.graph = Graph.load(info.graph);

        world.roadWidth = info.roadWidth;
        world.roadRoundness = info.roadRoundness;
        world.buildingWidth = info.buildingWidth;
        world.buildingMinimumLength = info.buildingMinimumLength;
        world.spacing = info.spacing;
        world.treeSize = info.treeSize;

        world.envelopes = info.envelopes.map((e) => Envelope.load(e));
        world.roadBorders = info.roadBorders.map((b) => new Segment(b.p1, b.p2));
        world.buildings = info.buildings.map((e) => Building.load(e));
        world.trees = info.trees.map((t) => new Tree(t.center, info.treeSize));
        world.laneGuides = info.laneGuides.map((g) => new Segment(g.p1, g.p2));

        world.markings = info.markings.map((m) => Marking.load(m));

        world.zoom = info.zoom;
        world.offset = info.offset;
        
        return world;
    }

    generate() {
        this.envelopes.length = 0;
        for (const seg of this.graph.segments) {
            this.envelopes.push(
                new Envelope(seg, this.roadWidth, this.roadRoundness)
            );
        }

        this.roadBorders = Polygon.union(this.envelopes.map((e) => e.poly));

        this.buildings = this.#generateBuildings();
        this.trees = this.#generateTrees();

        this.laneGuides.length = 0
        this.laneGuides.push(...this.#generateLaneGuides());
    }

    #generateLaneGuides() {
        const tempEnvelopes = [];
        for (const seg of this.graph.segments) {
            tempEnvelopes.push(
                new Envelope(
                    seg,
                    this.roadWidth / 2,
                    this.roadRoundness
                )
            )
        }

        const segments = Polygon.union(tempEnvelopes.map((e) => e.poly));
        return segments;
    }

    #generateTrees() {
        const points = [
            ...this.roadBorders.map((s) => [s.p1, s.p2]).flat(),
            ...this.buildings.map((b) => b.base.points).flat()
        ];

        const left = Math.min(...points.map((p) => p.x));
        const right = Math.max(...points.map((p) => p.x));
        const top = Math.min(...points.map((p) => p.y));
        const bottom = Math.max(...points.map((p) => p.y));

        const illegalPolys = [
            ...this.buildings.map((b) => b.base),
            ...this.envelopes.map((e) => e.poly)
        ];

        const trees = [];
        let tryCount = 0;
        while (tryCount < 100) {
            const p = new Point(
                lerp(left, right, Math.random()),
                lerp(top, bottom, Math.random())
            );

            let keep = true;

            // Check if tree is inside or too near to road or building
            for (const poly of illegalPolys) {
                if (poly.containsPoint(p) || poly.distanceToPoint(p) < this.treeSize / 2) {
                    keep = false;
                    break;
                }
            }

            // Check if tree intersects another tree
            if (keep) {
                for (const tree of trees) {
                    if (distance(p, tree.center) < this.treeSize) {
                        keep = false;
                        break;
                    }
                }
            }

            // Check if tree is way too far to something.
            if (keep) {
                let closeToSomething = false;
                for (const poly of illegalPolys) {
                    if (poly.distanceToPoint(p) < this.treeSize * 2) {
                        closeToSomething = true;
                        break;
                    }
                }

                keep = closeToSomething;
            }

            // If no condition fails, keep the tree.
            if (keep) {
                trees.push(new Tree(p, this.treeSize));
                tryCount = 0
            }
            tryCount++;
        }

        return trees;
    }

    #generateBuildings() {
        const tempEnvelopes = [];
        for (const seg of this.graph.segments) {
            tempEnvelopes.push(
                new Envelope(
                    seg,
                    this.roadWidth + this.buildingWidth + this.spacing * 2,
                    this.roadRoundness
                )
            )
        }

        const guides = Polygon.union(tempEnvelopes.map((e) => e.poly));

        for (let i = 0; i < guides.length; i++) {
            const seg = guides[i];
            if (seg.length() < this.buildingMinimumLength) {
                guides.splice(i, 1);
                i--;
            }
        }

        let supports = [];

        for (let seg of guides) {
            const len = seg.length() + this.spacing;
            const buildingCount = Math.floor(
                len / (this.buildingMinimumLength + this.spacing)
            );
            const buildingLength = len / buildingCount - this.spacing;
            const dir = seg.directionVector();

            let q1 = seg.p1;
            let q2 = add(q1, scale(dir, buildingLength));
            supports.push(new Segment(q1, q2));

            for (let i = 2; i <= buildingCount; i++) {
                q1 = add(q2, scale(dir, this.spacing));
                q2 = add(q1, scale(dir, buildingLength));
                supports.push(new Segment(q1, q2));
            }
        }

        const bases = [];
        for (const seg of supports) {
            bases.push(new Envelope(seg, this.buildingWidth).poly)
        }

        const eps = 0.001;
        for (let i = 0; i < bases.length; i++) {
            for (let j = i + 1; j < bases.length; j++) {
                if(
                    bases[i].intersectsPoly(bases[j] ||
                    bases[i].distanceToPoly(bases[j]) < spacing - eps
                )) {
                    bases.splice(j, 1);
                    j--;
                }
            }
        }

        return bases.map((b) => new Building(b));
    }

    draw(ctx, viewpoint) {
        for (const env of this.envelopes) {
            env.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 });
        }
        
        for (const marking of this.markings) {
            marking.draw(ctx);
        }

        for (const seg of this.roadBorders) {
            seg.draw(ctx, {color: "white", width: 4});
        }

        for (const seg of this.graph.segments) {
            seg.draw(ctx, { color: "white", width: 4, dash: [10, 10] })
        }

        const items = [...this.buildings, ...this.trees];
        items.sort(
            (a,b) => 
                b.base.distanceToPoint(viewpoint) - 
                a.base.distanceToPoint(viewpoint)
        );

        for (const item of items) {
            item.draw(ctx, viewpoint);
        }
    }
}