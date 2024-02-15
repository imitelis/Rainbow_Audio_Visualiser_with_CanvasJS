const audioCtx = new AudioContext();
let stream;
let isMicActive = false;

const container = document.getElementById('container');
const canvas = document.getElementById('canvas');
const audioButton = document.getElementById('audio');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext('2d');

let audioSource;
let analyser;

container.addEventListener('click', function(){
    if (!isMicActive) {
        startMicrophone();
    } else {
        stopMicrophone();
    }
});

function startMicrophone() {
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(streamObj) {
        stream = streamObj;
        audioSource = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        
        audioSource.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 512;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const barWidth = 10;
        let x = 0;

        function animate(){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            analyser.getByteFrequencyData(dataArray);
            drawVisualiser(bufferLength, x, barWidth, dataArray);
            x += barWidth;
            requestAnimationFrame(animate);
        }

        animate();
        isMicActive = true;
        audioButton.style.backgroundColor = 'tomato';
    })
    .catch(function(err) {
        console.error('Error accessing microphone:', err);
    });
}

function stopMicrophone() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        isMicActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        audioButton.style.backgroundColor = 'dodgerblue';
    }
}

function drawVisualiser(bufferLength, x, barWidth, dataArray){
    for (let i = 0; i < bufferLength; i++){
        const barHeight = dataArray[i] * 1.5; 
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(i * Math.PI * 6 / bufferLength);
        const hue = i *  5;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(0, 0, barWidth, barHeight);
        ctx.restore();
    }
}
