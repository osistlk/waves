const { createCanvas } = require('canvas');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const ProgressBar = require('progress');

const width = 1280;
const height = 720;
const numFrames = 600; // 10 seconds at 60 fps
const tempDir = path.join(__dirname, 'temp');
const outputDir = path.join(__dirname, 'output');

// Ensure temp and output directories exist
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Get files from current working directory to determine particle settings
const files = fs.readdirSync(process.cwd()).filter(file => fs.statSync(file).isFile());
const numParticles = files.length;
const particles = [];

// Set up particles based on files
files.sort(); // Sort files alphabetically
for (let i = 0; i < numParticles; i++) {
    const size = 2 + (5 * i) / numParticles; // Scale size based on file position
    particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        size // Size varies based on the file's order
    });
}

// Initialize a progress bar
const bar = new ProgressBar(':bar :percent :etas', { total: numFrames, width: 40 });

// Function to update and draw particles
function drawFrame(frameIndex) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Dark mode background
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    // Draw particles with varying sizes
    particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Reflect particles off walls
        if (particle.x <= 0 || particle.x >= width) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= height) particle.vy *= -1;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
        context.fillStyle = '#fff';
        context.fill();
    });

    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(`${tempDir}/frame-${frameIndex.toString().padStart(4, '0')}.jpg`, buffer);

    // Update the progress bar
    bar.tick();
}

// Generate frames
for (let i = 0; i < numFrames; i++) {
    drawFrame(i);
}

// Use ffmpeg to create a video from the frames
exec(`ffmpeg -framerate 60 -i ${tempDir}/frame-%04d.jpg -c:v libx264 -pix_fmt yuv420p ${outputDir}/out.mp4`, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log('Video created: out.mp4');
});
