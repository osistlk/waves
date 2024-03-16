const { createCanvas } = require('canvas');
const fs = require('fs');
const ProgressBar = require('progress');
const path = require('path');

class Particle {
    constructor(x, y, mass) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.vx = 0;
        this.vy = 0;
    }

    kineticEnergy() {
        let v = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        return 0.5 * this.mass * v * v;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
}


class Simulation {
    constructor() {
        this.particles = [];
        this.centralMass = 10000;
        this.G = 6.674 * Math.pow(10, -11); // gravitational constant
    }

    addParticle(particle) {
        this.particles.push(particle);
    }

    update() {
        for (let particle of this.particles) {
            let dx = 0 - particle.x;
            let dy = 0 - particle.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let force = this.G * this.centralMass * particle.mass / (distance * distance);
            let forceX = force * dx / distance;
            let forceY = force * dy / distance;
            particle.vx += forceX / particle.mass;
            particle.vy += forceY / particle.mass;
            particle.update();
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
sim.addParticle(new Particle(100, 0, 1));
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
