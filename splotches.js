const { createCanvas } = require('canvas');
const fs = require('fs');

// Create a canvas
const width = 2560;
const height = 1440;
const canvas = createCanvas(width, height);
const context = canvas.getContext('2d');

// Draw colorful splotches
for (let i = 0; i < 100; i++) {
    context.beginPath();
    context.arc(Math.random() * width, Math.random() * height, Math.random() * 100, 0, 2 * Math.PI, false);
    context.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
    context.fill();
}

// Save the canvas to a JPEG file
const out = fs.createWriteStream(__dirname + '/test.jpeg');
const stream = canvas.createJPEGStream({
    quality: 1, // 100% quality
    chromaSubsampling: false // disable chroma subsampling for better color accuracy
});
stream.pipe(out);
out.on('finish', () => console.log('The JPEG file was created.'));
