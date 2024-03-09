const count = 0;
const information = document.getElementById('info')
const wave = document.getElementById('wave')

information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`
wave.innerText = `🌊: ${++count}`

const updateWaveRender = async () => {
    const response = await window.versions.ping()
    console.log(response) // prints out 'pong'

}

// setInterval(() => {
//     updateWaveRender()
// }, 1000);
