const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let darkMode = true;

function toggleDarkMode(particles) {
    darkMode = !darkMode;
    canvas.classList.toggle('dark-mode', darkMode);
    // Redraw particles to match the new mode
    drawParticles(particles);
}

document.getElementById('toggleDarkMode').addEventListener('click', toggleDarkMode);

// Resize the canvas to fill browser window dynamically
window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawParticles(); // Redraw particles after resize
}
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.velX = (Math.random() - 0.5) * 2;
        this.velY = (Math.random() - 0.5) * 2;
        this.color = darkMode ? 'rgb(255,255,255)' : 'rgb(0,0,0)';
        this.size = Math.random() * 5 + 1;
    }

    update() {
        this.x += this.velX;
        this.y += this.velY;

        if (this.x < 0 || this.x > canvas.width) this.velX = -this.velX;
        if (this.y < 0 || this.y > canvas.height) this.velY = -this.velY;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function resetParticles(particles) {
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }
}

function drawParticles(particles) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = darkMode ? '#333333' : '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let particle of particles) {
        particle.update();
        particle.draw();
    }

    requestAnimationFrame(drawParticles);
}

let particles = [];
resetParticles(particles);
drawParticles(particles);
