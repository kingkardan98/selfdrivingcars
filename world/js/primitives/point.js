class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx, { size=18, color='black', outline=null } = {}) {
        const rad = size / 2;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.x, this.y, rad, 0, Math.PI * 2);
        ctx.fill()
        if (outline) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = outline;
            ctx.arc(this.x, this.y, rad * 0.8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    equals(point) {
        return (this.x == point.x && this.y == point.y);
    }
}