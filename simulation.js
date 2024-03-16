const { createCanvas } = require('canvas');
const fs = require('fs');
const ProgressBar = require('progress');
const path = require('path');

class Particle {
    constructor(x, y, speed, direction) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.direction = direction;
    }

    update(elapsedTime) {
        // Change the position based on the speed, direction and elapsed time
        this.x += this.speed * Math.cos(this.direction) * elapsedTime;
        this.y += this.speed * Math.sin(this.direction) * elapsedTime;
    }

    kineticEnergy() {
        let v = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        return 0.5 * this.mass * v * v;
    }
}


class Simulation {

    constructor() {
        this.particles = [];
    }

    addParticle(particle) {
        this.particles.push(particle);
    }

    update(elapsedTime) {
        // Update each particle
        for (let particle of this.particles) {
            particle.update(elapsedTime);
        }
    }

    draw(frameNumber, callback) {
        const canvas = createCanvas(800, 600);
        const context = canvas.getContext('2d');

        // Clear the canvas with a dark background
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the particles in a light color
        context.fillStyle = 'white';
        for (let particle of this.particles) {
            context.beginPath();
            context.arc(particle.x, particle.y, 2, 0, 2 * Math.PI);
            context.fill();
        }

        // Save the canvas to a file asynchronously with 100% quality
        const out = fs.createWriteStream(__dirname + `/temp/frame_${frameNumber}.jpeg`);
        const stream = canvas.createJPEGStream({ quality: 1 }); // 1 = 100% quality
        stream.pipe(out);
        out.on('finish', callback);
    }
}

// Check if the temp directory exists
if (!fs.existsSync(path.join(__dirname, 'temp'))) {
    // If not, create it
    fs.mkdirSync(path.join(__dirname, 'temp'));
} else {
    // If it does, clear it
    const files = fs.readdirSync(path.join(__dirname, 'temp'));
    for (const file of files) {
        fs.unlinkSync(path.join(__dirname, 'temp', file));
    }
}

// Usage
let sim = new Simulation();
sim.addParticle(new Particle(0, 0, 50));
let frameNumber = 0;
let totalFrames = 60 * 60; // 60 seconds * 60 frames per second

// Create a progress bar
let bar = new ProgressBar(':elapseds :etas :bar', { total: totalFrames, width: 20 });

function drawNextFrame() {
    if (frameNumber < totalFrames) {
        sim.update();
        sim.draw(frameNumber++, () => {
            bar.tick();
            drawNextFrame();
        });
    }
}

drawNextFrame();
