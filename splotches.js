const { createCanvas } = require('canvas');
const fs = require('fs');
const exec = require('child_process').exec;
const ProgressBar = require('progress');

// Create a canvas
const width = 2560;
const height = 1440;
const fps = 60;
const duration = 10; // 10 seconds
const totalFrames = fps * duration;

// Create a progress bar for the image generation
const bar1 = new ProgressBar('Generating images :bar :percent :etas', { total: totalFrames });

// Generate a sequence of JPEG images
for (let frame = 0; frame < totalFrames; frame++) {
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

    // Update the progress bar
    bar1.tick();
}

// Create a progress bar for the video generation
const bar2 = new ProgressBar('Generating video  :bar :percent :etas', { total: totalFrames });

// Use FFmpeg to convert the JPEG images in the 'temp' subdirectory into a video in the 'output' subdirectory
const ffmpeg = exec('ffmpeg -framerate 60 -i temp/frame%05d.jpeg -c:v mpeg4 -r 60 -pix_fmt yuv420p output/output.mp4');
ffmpeg.stdout.on('data', (data) => {
    // Extract the current frame number from the FFmpeg output
    const match = data.match(/frame=\s*([0-9]+)/);
    if (match) {
        const frame = parseInt(match[1]);
        bar2.update(frame / totalFrames);
    }
});
ffmpeg.on('exit', () => bar2.update(1)); // Ensure the progress bar is full when FFmpeg exits
