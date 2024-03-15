const { createCanvas } = require('canvas');

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

    draw() {
        const canvas = createCanvas(800, 600);
        const context = canvas.getContext('2d');

        // Clear the canvas
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the particles
        context.fillStyle = 'black';
        for (let particle of this.particles) {
            context.beginPath();
            context.arc(particle.x, particle.y, 2, 0, 2 * Math.PI);
            context.fill();
        }

        // Save the canvas to a file
        const fs = require('fs');
        const out = fs.createWriteStream(__dirname + '/particle_positions.png');
        const stream = canvas.createPNGStream();
        stream.pipe(out);
    }
}

// Usage
let sim = new Simulation();
sim.addParticle(new Particle(100, 0, 1));
setInterval(() => {
    sim.update();
    console.log('Total kinetic energy:', sim.totalKineticEnergy());
}, 1000);
