const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');

let frameCount = 0;
let time = 0;
let waveAmplitude = 0;
let waveFrequency = 0;

function drawStandingWave() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get a buffer for the current frame
    let buffer = canvas.toBuffer('image/jpeg');
    // Write the buffer to a file
    fs.writeFile(`./temp/frame${frameCount}.jpeg`, buffer, err => {
        if (err) throw err;
        console.log(`Frame ${frameCount} saved!`);
    });

    // Set the drawing color based on theme preference
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    ctx.strokeStyle = prefersDarkMode ? 'white' : 'black';

    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
        // Calculate the y position of the standing wave
        let y = waveAmplitude * (Math.sin((x * waveFrequency) + time) + Math.sin((x * waveFrequency) - time)) + (canvas.height / 2);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    frameCount++;
    time += 0.01;
    requestAnimationFrame(drawStandingWave);
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM content loaded')
});


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

    time += 0.001;
    waveAmplitude = 200 * Math.sin(time);
    waveFrequency = 0.01 * Math.sin(time);
    requestAnimationFrame(draw);
}

draw();
