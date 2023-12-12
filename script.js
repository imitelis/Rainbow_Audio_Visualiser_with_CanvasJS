const audioCtx = new AudioContext();

const container = document.getElementById('container');
const canvas = document.getElementById('canvas');
const file = document.getElementById('fileupload');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext('2d');

let audioSource;
let analyser;

container.addEventListener('click', function(){
    const audio1 = document.getElementById('audio');
    audio1.src = 'blessing.ogg';
    audio1.play();

    audioSource = audioCtx.createMediaElementSource(audio1);
    analyser = audioCtx.createAnalyser();
    
    audioSource.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 512;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = 10; // (canvas.width/2)/bufferLength;
    let barHeight;
    let x;

    function animate(){
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray);
        requestAnimationFrame(animate);
    }

    animate();
});

const microphone = new Microphone();

function drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray){
    if (microphone.initialized) {
        const samples = microphone.getSamples();
        for (let i = 0; i < bufferLength; i++){
            barHeight = samples[i] * 1.5; // dataArray[i] * 1.5;
            ctx.save();
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.rotate(i * Math.PI * 6 / bufferLength);
            const hue = i *  5;
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.fillRect(0, 0, barWidth, barHeight);
            x += barWidth;
            ctx.restore();
        }
    }
}