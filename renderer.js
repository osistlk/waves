const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');

let time = 0;
let waveAmplitude = 0.000001;
const waveFrequency = 0.01;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set the drawing color based on theme preference
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    ctx.strokeStyle = prefersDarkMode ? 'white' : 'black';

    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
        // Calculate the y position of the wave
        let y = waveAmplitude * Math.sin((x * waveFrequency) + time) + (canvas.height / 2);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    time += 0.01;
    requestAnimationFrame(draw);
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM content loaded')
    const cpuUsage = await window.systemStats.getUsage() + '';
    console.log(cpuUsage);
    waveAmplitude *= cpuUsage;
});


draw();
