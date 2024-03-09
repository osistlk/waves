const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');

const width = 400;
const height = 400;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Set the background color
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, width, height);

// Set the foreground color
ctx.strokeStyle = 'white';

// Variables for the wave
let time = 0;
const waveAmplitude = 100;
const waveFrequency = 0.01;

// Draw the wave
ctx.beginPath();
for (let x = 0; x < width; x++) {
    let y = waveAmplitude * Math.sin((x * waveFrequency) + time) + (height / 2);
    ctx.lineTo(x, y);
}
ctx.stroke();

// Save the image
const buffer = canvas.toBuffer('image/jpeg', { quality: 1 }); // 1 is the highest quality
const dirPath = path.join(__dirname, 'temp');
const outputPath = path.join(dirPath, 'wave.jpg');

// Ensure the directory exists
fs.mkdirSync(dirPath, { recursive: true });

fs.writeFileSync(outputPath, buffer);
