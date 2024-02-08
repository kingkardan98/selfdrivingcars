class GraphEditor {
    constructor(viewport, graph) {
        this.viewport = viewport;
        this.canvas = viewport.canvas;
        this.graph = graph;
        this.ctx = this.canvas.getContext("2d");

        this.selected = null;
        this.hovered = null;
        this.dragging = false;
        this.mouse = null;

        this.canvas.setAttribute("tabindex", 0);
        this.canvas.style.outline = "none";
        this.canvas.focus();
    }

    enable() {
        this.#addEventListeners();
    }

    disable() {
        this.#removeEventListeners();
        this.selected = false;
        this.hovered = false;
    }

    #addEventListeners() {
        this.boundMouseDown = this.#handleMouseDown.bind(this);
        this.boundMouseMove = this.#handleMouseMove.bind(this);
        this.boundMouseUp = () => {this.dragging = false}
        this.boundKeyDown = this.#handleKeyDown.bind(this);
        this.boundContextMenu = (evt) => {evt.preventDefault();}
        this.canvas.addEventListener("mousedown", this.boundMouseDown);
        this.canvas.addEventListener("mousemove", this.boundMouseMove);
        this.canvas.addEventListener("mouseup", this.boundMouseUp);
        this.canvas.addEventListener("keydown", this.boundKeyDown);
        this.canvas.addEventListener("contextmenu", this.boundContextMenu);
    }

    #removeEventListeners() {
        this.canvas.removeEventListener("mousedown", this.boundMouseDown);
        this.canvas.removeEventListener("mousemove", this.boundMouseMove);
        this.canvas.removeEventListener("mouseup", this.boundMouseUp);
        this.canvas.removeEventListener("keydown", this.boundKeyDown);
        this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
    }

    #handleMouseDown(evt) {
        if (evt.button == 2) { // 2 = Right click
            if (this.hovered) {
                this.#removePoint(this.hovered);
            }
        }

        if (evt.button == 0) { // 0 = Left click
            if (this.hovered) { // This simply ensures that, since the mouse is hovering a point, it can make a segment between those two.
                this.#select(this.hovered)
                this.dragging = true;
                return;
            }
            this.graph.tryAddPoint(this.mouse);

            this.#select(this.mouse)
            this.hovered = this.mouse;
        }
    }

    #handleMouseMove(evt) {
        this.mouse = this.viewport.getMouse(evt, true);
        this.hovered = getNearestPoint(this.mouse, this.graph.points, 10 * this.viewport.zoom);
        if (this.dragging) {
            this.selected.x = this.mouse.x;
            this.selected.y = this.mouse.y;
        }
    }

    #handleKeyDown(evt) {
        if (evt.key === "Escape") {
            this.selected = null;
            this.canvas.focus();
        }
    }

    #removePoint(point) {
        this.graph.removePoint(point);
        this.hovered = null;
        if (this.selected == point) {
            this.selected = null;
        }
    }

    #select(point) {
        if (this.selected) {
            let segment = new Segment(this.selected, point);
            this.graph.tryAddSegment(segment);
        }
        this.selected = point;
    }

    display() {
        this.graph.draw(this.ctx);
        if (this.hovered) {
            this.hovered.draw(this.ctx, {outline: "orange"});
        }
        
        if (this.selected) {
            const intent = this.hovered ? this.hovered : this.mouse;
            new Segment(this.selected, intent).draw(ctx, { style: "dotted" });
            this.selected.draw(this.ctx, { outline: "yellow" })
        }
    }

    dispose() {
        this.graph.dispose();
        this.selected = null;
        this.hovered = null;
    }

}