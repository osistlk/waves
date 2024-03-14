const { createCanvas } = require('canvas');
const fs = require('fs');
const exec = require('child_process').exec;

// Create a canvas
const width = 2560;
const height = 1440;
const fps = 60;
const duration = 10; // 10 seconds

// Generate a sequence of JPEG images
for (let frame = 0; frame < fps * duration; frame++) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Draw colorful splotches
    for (let i = 0; i < 100; i++) {
        context.beginPath();
        context.arc(Math.random() * width, Math.random() * height, Math.random() * 100, 0, 2 * Math.PI, false);
        context.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
        context.fill();
    }

    // Save the canvas to a JPEG file in the 'temp' subdirectory
    const out = fs.createWriteStream(__dirname + `/temp/frame${frame.toString().padStart(5, '0')}.jpeg`);
    const stream = canvas.createJPEGStream({
        quality: 1, // 100% quality
        chromaSubsampling: false // disable chroma subsampling for better color accuracy
    });
    stream.pipe(out);
}

// Use FFmpeg to convert the JPEG images in the 'temp' subdirectory into a video in the 'output' subdirectory
exec('ffmpeg -framerate 60 -i temp/frame%05d.jpeg -c:v mpeg4 -r 60 -pix_fmt yuv420p output/output.mp4', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});
