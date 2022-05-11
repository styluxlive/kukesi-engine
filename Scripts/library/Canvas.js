export let Canvas = (width = 256, height = 256, border = "1px dashed black", backgroundColor = "white") => {
    //Make Canvas Element And Add It To DOM
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.style.border = border;
    canvas.style.backgroundColor = backgroundColor;
    document.body.appendChild(canvas);
    //Create the context as a property of the canvas
    canvas.ctx = canvas.getContext("2d");
    //Return Canvas
    return canvas;
}