const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');

const width = 400;
const height = 400;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

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
const outputPath = path.join(__dirname, 'temp', 'wave.jpg');
fs.writeFileSync(outputPath, buffer);
