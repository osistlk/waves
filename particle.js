class Particle {
    constructor(x, y, mass) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.vx = 0;
        this.vy = 0;
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
}

// Usage
let sim = new Simulation();
sim.addParticle(new Particle(100, 0, 1));
setInterval(() => {
    sim.update();
    console.log(sim.particles[0]); // log the first particle's position
}, 1000);
