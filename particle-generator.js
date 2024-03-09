const { createCanvas } = require('canvas');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const ProgressBar = require('progress');

const width = 2560;
const height = 1440;
const numFrames = 600; // 10 seconds at 60 fps
const tempDir = path.join(__dirname, 'temp');
const outputDir = path.join(__dirname, 'output');

// Ensure temp and output directories exist
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Simple hash function
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

// Convert hash to RGB color
function hashToColor(hash) {
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;
    return `rgb(${r}, ${g}, ${b})`;
}

// Get files from current working directory to determine particle settings
const files = fs.readdirSync(process.cwd()).filter(file => fs.statSync(file).isFile());
const numParticles = files.length;
const particles = [];

// Set up particles based on files
files.sort(); // Sort files alphabetically
for (let i = 0; i < numParticles; i++) {
    // Adjusted for larger sizes
    const baseSize = 10; // Starting size
    const maxSize = 50; // Maximum size for the largest particle
    const size = baseSize + ((maxSize - baseSize) * i) / numParticles; // Scale size based on file position
    const hash = hashString(files[i] + i); // Hash file name and position
    const color = hashToColor(hash); // Map hash to color
    particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        size, // Updated size calculation for much larger particles
        color // Color determined by hash
    });
}

// Initialize a progress bar
const bar = new ProgressBar(':bar :percent :etas :elapseds', { total: numFrames, width: 40 });

// Function to update and draw particles
function drawFrame(frameIndex) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Dark mode background
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    // Draw particles with varying sizes and colors
    particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Reflect particles off walls
        if (particle.x <= 0 || particle.x >= width) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= height) particle.vy *= -1;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
        context.fillStyle = particle.color;
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
