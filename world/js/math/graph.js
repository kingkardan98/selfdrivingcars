class Graph {
    constructor(points = [], segments = []) {
        this.points = points;
        this.segments = segments;
    }

    static load(info) {
        const points = info.points.map((i) => new Point(i.x, i.y));
        const segments = info.segments.map((i) => new Segment(
            points.find((p) => p.equals(i.p1)),
            points.find((p) => p.equals(i.p2))
        ));

        return new Graph(points, segments);
    }

    tryAddPoint(point) {
        if (!this.containsPoint(point)) {
            this.points.push(point);
        }
    }

    containsPoint(point) {
        return this.points.find((p) => p.equals(point));
    }

    removePoint(point) {
        this.segments = this.segments.filter((segment) => !segment.includes(point)); // This just filters out every segment that contains the point.
        this.points.splice(this.points.indexOf(point), 1);
    }

    tryAddSegment(segment) {
        if (!this.containsSegment(segment) && !segment.p1.equals(segment.p2)) {
            this.segments.push(segment);
        } else {
            console.log(false);
        }
    }

    containsSegment(segment) {
        return (this.segments.find((s) => s.equals(segment)) || this.points.length < 2);
    }

    removeSegment(segment) {
        this.segments.splice(this.segments.indexOf(segment), 1);
    }

    draw(ctx) {
        for (const seg of this.segments) {
            seg.draw(ctx);
        }

        for (const point of this.points) {
            point.draw(ctx);
        }
    }

    dispose() {
        this.points.length = 0;
        this.segments.length = 0;
    }

    hash() {
        return JSON.stringify(this);
    }
}