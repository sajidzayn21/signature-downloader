// Initialize variables
let history = [];
let isDrawing = false;
let lastX = 0;
let lastY = 0;

const colorPicker = document.getElementById('colorPicker');
const canvasColor = document.getElementById('canvasColor');
const canvas = document.getElementById('myCanvas');
const clearButton = document.getElementById('clearButton');
const saveButton = document.getElementById('saveButton');
const retrieveButton = document.getElementById('retrieveButton');
const undoButton = document.getElementById('undoButton');
const lineWidthPicker = document.getElementById('lineWidthPicker');

const ctx = canvas.getContext('2d');

// Set initial canvas background
ctx.fillStyle = canvasColor.value;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Set initial drawing settings
ctx.strokeStyle = colorPicker.value;
ctx.lineWidth = lineWidthPicker.value;
ctx.lineCap = 'round'; // Smooth lines
ctx.lineJoin = 'round'; // Smooth corners

// Function to save the current state to history
function saveState() {
    if (history.length >= 50) { // Limit history to last 50 states
        history.shift();
    }
    history.push(canvas.toDataURL());
}

// Function to restore a state from history
function restoreState() {
    if (history.length > 0) {
        let previousState = history.pop();
        let img = new Image();
        img.src = previousState;
        img.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = canvasColor.value;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        }
    }
}

// Update stroke color
colorPicker.addEventListener('change', (event) => {
    ctx.strokeStyle = event.target.value;
});

// Update canvas background color
canvasColor.addEventListener('change', (event) => {
    ctx.fillStyle = event.target.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
});

// Update line width
lineWidthPicker.addEventListener('change', (event) => {
    ctx.lineWidth = event.target.value;
});

// Mouse Events
canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    lastX = event.offsetX;
    lastY = event.offsetY;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
});

canvas.addEventListener('mousemove', (event) => {
    if (!isDrawing) return;
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
    lastX = event.offsetX;
    lastY = event.offsetY;
});

canvas.addEventListener('mouseup', () => {
    if (isDrawing) {
        isDrawing = false;
        saveState();
    }
});

canvas.addEventListener('mouseleave', () => {
    if (isDrawing) {
        isDrawing = false;
        saveState();
    }
});

// Touch Events
function getTouchPos(canvas, touchEvent) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
    };
}

canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    const pos = getTouchPos(canvas, event);
    isDrawing = true;
    lastX = pos.x;
    lastY = pos.y;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
}, { passive: false });

canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    if (!isDrawing) return;
    const pos = getTouchPos(canvas, event);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
}, { passive: false });

canvas.addEventListener('touchend', () => {
    if (isDrawing) {
        isDrawing = false;
        saveState();
    }
});

// Prevent scrolling when touching the canvas
document.body.addEventListener('touchstart', function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });

document.body.addEventListener('touchend', function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });

document.body.addEventListener('touchmove', function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });

// Clear Canvas
clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = canvasColor.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    history = []; // Clear history
});

// Save and Download Canvas
saveButton.addEventListener('click', () => {
    // Save current state before downloading
    saveState();
    localStorage.setItem('canvasContents', canvas.toDataURL());
    let link = document.createElement('a');
    link.download = 'my-canvas.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Retrieve Saved Signature
retrieveButton.addEventListener('click', () => {
    let savedCanvas = localStorage.getItem('canvasContents');
    if (savedCanvas) {
        let img = new Image();
        img.src = savedCanvas;
        img.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = canvasColor.value;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            saveState();
        };
    }
});

// Undo Functionality
undoButton.addEventListener('click', () => {
    restoreState();
});

// Initialize history with the blank canvas
window.onload = () => {
    saveState();
};
