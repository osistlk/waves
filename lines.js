const fs = require('fs');
const { createCanvas } = require('canvas');

const width = 800;
const height = 600;
const canvas = createCanvas(width, height);
const context = canvas.getContext('2d');

// Background color (optional)
context.fillStyle = '#FFFFFF'; // White background
context.fillRect(0, 0, width, height);

// Set properties for the lines
context.strokeStyle = '#000000'; // Black color for the lines
context.lineWidth = 5;

// Calculate the number of lines and spacing
const lineSpacing = 20;
const diagonalLength = Math.sqrt(width * width + height * height);
const numberOfLines = diagonalLength / lineSpacing;

// Draw lines at 45 degrees
for (let i = 0; i < numberOfLines; i++) {
    // Starting point for lines
    let startX = i * lineSpacing;
    let startY = 0;

    // Adjust start position for lines starting on the bottom and right edges
    if (startX > width) {
        startY = startX - width;
        startX = width;
    }

    // Calculate end points based on 45 degrees angle
    let endX = startX - (diagonalLength * Math.sin(Math.PI / 4));
    let endY = startY + (diagonalLength * Math.cos(Math.PI / 4));

    // Draw the line
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
}

// Save the canvas as a JPEG image
const out = fs.createWriteStream(__dirname + '/linesAt45Degrees.jpg');
const stream = canvas.createJPEGStream();
stream.pipe(out);
out.on('finish', () => console.log('The JPEG file was created.'));
