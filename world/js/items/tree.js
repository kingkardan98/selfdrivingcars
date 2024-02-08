class Tree {
    constructor(center, size, heightCoefficient = 0.2) {
        this.center = center;
        this.size = size;
        this.heightCoefficient = heightCoefficient;
        this.base = this.#generateLevel(center, size);
    }

    #generateLevel(point, size) {
        const points = [];
        const rad = size / 2;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
            const seed = Math.cos(((a + this.center.x) * size) % 23) ** 2; // Pseudo random number;
            const noisyRadius = rad * lerp(0.5, 1, seed);
            points.push(translate(point, a, noisyRadius));
        }

        return new Polygon(points);
    }

    draw(ctx, viewPoint) {
        const difference = subtract(this.center, viewPoint);

        const top = add(this.center, scale(difference, this.heightCoefficient));
        
        const levelCount = 7;
        for (let level = 0; level < levelCount; level++) {
            const t = level / (levelCount - 1);
            const point = lerp2D(this.center, top, t);
            const color = "rgb(30," + lerp(50, 200, t) + ",70)";
            const size = lerp(this.size, 50, t);
            const poly = this.#generateLevel(point, size);
            poly.draw(ctx, { stroke: "rgba(0,0,0,0)", fill: color });
        }
    }
}