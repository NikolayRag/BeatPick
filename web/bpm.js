//  todo 2 (feature) +0: Detect beat from mic
//  todo 3 (feature) +0: Show instant beat pulse, BpM value
//  todo 4 (feature) +0: Show mean BpM, predicted pulse, delta error in % and time
//  todo 5 (feature) +0: Show relatively constant BpM blocks over time
//  todo 6 (feature) +0: Explicit or implicit metronome, light/audio
//  todo 7 (feature) +0: Detect major and minor beats

//  todo 8 (feature) +0: Make sociable!
//  todo 9 (feature) +0: Score of stability
//  todo 10 (feature) +0: Score of artistism
//  todo 11 (feature) +0: Progress over sessions
//  todo 12 (feature) +0: Store best scored beat images


/*
- compress source
- fft
- catch energy peaks over mean level by band
  - compress
  - take compress ratio in moment
    - diff compared to uncompressed
      - valuable at high levels
- detect continuous pattern
  - lol how
*/

  (function () {

//init

    var audioContext = new AudioContext();
    console.log(audioContext.baseLatency);
    var BUFF_SIZE = 256;

    var audioInput = null,
        gain_node = null,
        script_processor_node = null,
        script_processor_fft_node = null,
        analyserNode = null;

    if (!navigator.mediaDevices) {
      alert('getUserMedia not supported in this browser.');
      return;
    }

    navigator.mediaDevices.getUserMedia({audio:true})
    .then(mainStreamCB)
    .catch(
      function(e) {alert('Error capturing audio.');}
    );

    

    function mainStreamCB(_stream){
      var cStream = audioContext.createMediaStreamSource(_stream);

      analyserNode = audioContext.createAnalyser();
      analyserNode.smoothingTimeConstant = .95;
      analyserNode.fftSize = 256;

      cStream.connect(analyserNode);
      

      var FFTCvs = document.getElementById("canvasFFT");
      var FFTCtx = FFTCvs.getContext('2d');
      FFTCtx.fillStyle = "rgba(255,255,255,1)";
      FFTCtx.fillRect(0,0,512,112);
      FFTCtx.lineWidth = 1;


      var array = new Uint8Array(256);
      setInterval(function() {
        analyserNode.getByteFrequencyData(array);

        FFTCtx.drawImage(FFTCvs, -1, 0);
        
        for (var z=1; z<=14; z++){
          FFTCtx.strokeStyle = "rgba(128,82,256,"+ array[z*8]/256. +")";

          FFTCtx.beginPath();
          FFTCtx.moveTo(510, z*8-8);
          FFTCtx.lineTo(510, z*8);
          FFTCtx.stroke(); 
        }
      }, 5);

    }

  })();
