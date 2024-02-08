function animateCanvas() {
    viewport.reset();
    if (graph.hash() != oldGraphHash) {
        world.generate();
        oldGraphHash = graph.hash();    
    }
    const viewPoint = scale(viewport.getOffset(), -1);
    world.draw(ctx, viewPoint);
    ctx.globalAlpha = 0.3;
    for (const tool of Object.values(tools)) {
        tool.editor.display();
    }
    requestAnimationFrame(animateCanvas);
}

function dispose() {
    tools["graph"].editor.dispose();
    world.markings.length = 0;
}

function save() {
    world.zoom = viewport.zoom;
    world.offset = viewport.offset;
    
    const element = document.createElement("a");
    element.setAttribute(
        "href",
        "data:application/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(world))
    );

    const fileName = "name.world";
    element.setAttribute("download", fileName);

    element.click();

    localStorage.setItem("world", JSON.stringify(world));
}

function load(event) {
    const file = event.target.files[0];

    if (!file) {
        alert("No file selected.");
        return;
    }

    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = (evt) => {
        const fileContent = evt.target.result;
        const jsonData = JSON.parse(fileContent);
        world = World.load(jsonData);
        localStorage.setItem("world", JSON.stringify(world));
        location.reload();
    }
}

function getRandomColor() {
    const hue = 290 + Math.random() * 260;
    return "hsl(" + hue + ", 100%, 60%)";
}

function setMode(mode) {
    disableEditors();
    tools[mode].button.style.backgroundColor = "white";
    tools[mode].button.style.filter = "";
    tools[mode].editor.enable();
}

function disableEditors() {
    for (const tool of Object.values(tools)) {
        tool.button.style.backgroundColor = "gray";
        tool.button.style.filter = "grayscale(100%)";
        tool.editor.disable();
    }
}