const { createCanvas } = require('canvas');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const ProgressBar = require('progress');

const width = 2560;
const height = 1440;
const numFrames = 600 * 6; // 10 seconds at 60 fps
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

// Function to adjust color based on temperature
function adjustColorForTemperature(baseColor, temperature) {
    const match = baseColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
    if (!match) return baseColor;

    let [_, r, g, b] = match.map(Number);
    const brightnessAdjustment = 1 + ((temperature - 50) / 50) * 0.2;
    r = Math.min(255, r * brightnessAdjustment);
    g = Math.min(255, g * brightnessAdjustment);
    b = Math.min(255, b * brightnessAdjustment);

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// Get files from current working directory to determine particle settings
const files = fs.readdirSync(process.cwd()).filter(file => fs.statSync(file).isFile());
const numParticles = files.length;
const particles = [];

// Set up particles based on files
files.sort(); // Sort files alphabetically
for (let i = 0; i < numParticles; i++) {
    const hash = hashString(files[i] + i);
    const baseColor = hashToColor(hash);
    particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        size: 10 + (100 * i) / numParticles,
        baseColor,
        color: baseColor, // Initial color based on hash
        temperature: 50 // Starting temperature
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

    particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Reflect particles off walls and adjust temperature
        if (particle.x <= 0 || particle.x >= width) {
            particle.vx *= -1;
            particle.temperature = Math.min(particle.temperature + 5, 100);
        }
        if (particle.y <= 0 || particle.y >= height) {
            particle.vy *= -1;
            particle.temperature = Math.max(particle.temperature - 5, 0);
        }

        // Update color based on new temperature
        particle.color = adjustColorForTemperature(particle.baseColor, particle.temperature);

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
