let drawingEnabled = true;
let drawing = false;
let canvas, ctx;
let drawingHistory = [];
let redoHistory = [];
let textAreaVisible = false;
let savedText = "";
let textArea;
let resizingTextArea = false;
let copyButton;
let textAreaActive = false;

function createCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.zIndex = '10000';
    canvas.style.pointerEvents = 'auto';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
}

function createTextAreaButton() {
    const button = document.createElement('button');
    button.innerText = 'Add Text Area';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.left = '10px';
    button.style.zIndex = '10001';
    button.style.padding = '10px';
    button.style.width = '120px';
    button.style.background = 'white';
    button.style.border = '1px solid black';
    button.onclick = toggleTextArea;
    document.body.appendChild(button);

    copyButton = document.createElement('button');
    copyButton.innerText = 'Copy Text';
    copyButton.style.position = 'fixed';
    copyButton.style.top = '10px';
    copyButton.style.left = '145px';
    copyButton.style.zIndex = '10001';
    copyButton.style.padding = '10px';
    copyButton.style.width = '120px';
    copyButton.style.background = 'white';
    copyButton.style.border = '1px solid black';
    copyButton.onclick = copyTextAreaContent;
    copyButton.style.display = 'none';
    document.body.appendChild(copyButton);
}

function copyTextAreaContent() {
    if (textAreaVisible && textArea) {
        navigator.clipboard.writeText(textArea.value);
    }
}

function toggleTextArea() {
    if (textAreaVisible) {
        savedText = textArea.value;
        textArea.remove();
        textAreaVisible = false;
        copyButton.style.display = 'none';
        textAreaActive = false;
    } else {
        createTextArea();
        textArea.focus();
        copyButton.style.display = 'block';
        textAreaActive = true;
    }
}

function createTextArea() {
    textArea = document.createElement('textarea');
    textArea.value = savedText;
    textArea.style.position = 'fixed';
    textArea.style.top = '50px';
    textArea.style.left = '10px';
    textArea.style.width = '250px';
    textArea.style.height = '250px';
    textArea.style.zIndex = '10001';
    textArea.style.border = '1px solid black';
    textArea.style.resize = 'both';
    textArea.style.overflow = 'auto';
    textArea.style.fontSize = '15px';
    textArea.addEventListener('mousedown', () => {
        resizingTextArea = true;
        textAreaActive = true;
    });
    textArea.addEventListener('mouseup', () => resizingTextArea = false);
    textArea.addEventListener('focusout', () => textAreaActive = false);
    document.body.appendChild(textArea);
    textAreaVisible = true;
    textArea.focus();
    textAreaActive = true;
}

createCanvas();
createTextAreaButton();

document.addEventListener('pointerdown', (e) => {
    if (!drawingEnabled || resizingTextArea) return;
    if (textArea && e.target !== textArea) {
        textAreaActive = false;
    }
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
    drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoHistory = [];
});

document.addEventListener('pointermove', (e) => {
    if (!drawingEnabled || !drawing || resizingTextArea) return;
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
});

document.addEventListener('pointerup', () => {
    drawing = false;
});

document.addEventListener('keydown', (e) => {
    if (textAreaActive) {
        return; // Let the text area handle undo/redo
    }
    if (!drawingEnabled) return;
    if (e.ctrlKey && e.key === 'z') {
        if (drawingHistory.length > 0) {
            redoHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            ctx.putImageData(drawingHistory.pop(), 0, 0);
        }
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        if (redoHistory.length > 0) {
            drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            ctx.putImageData(redoHistory.pop(), 0, 0);
        }
    }
});
