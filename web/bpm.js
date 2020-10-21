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
      analyserNode.smoothingTimeConstant = .5;
      analyserNode.fftSize = 256;

      cStream.connect(analyserNode);
      

      var FFTCvs = document.getElementById("canvasFFT");
      var FFTCtx = FFTCvs.getContext('2d');
      FFTCtx.fillStyle = "rgba(255,255,255,1)";
      FFTCtx.fillRect(0,0,512,128);
      FFTCtx.lineWidth = .5;






      var array = [new Uint8Array(256), new Uint8Array(256), new Uint8Array(256), new Uint8Array(256), new Uint8Array(256)];

      var autoGain = 1;

      setInterval(function() {
        array[4] = array[3];
        array[3] = array[2];
        array[2] = array[1];
        array[1] = array[0];
        array[0] = new Uint8Array(256);
        analyserNode.getByteFrequencyData(array[0]);
        
        var skip= 1;
        var sum = 0;

        for (var z=0; z<112/skip; z++){
          var v0=array[0][z*skip],
              v1=array[1][z*skip],
              v2=array[2][z*skip];
              v3=array[3][z*skip];
              v4=array[4][z*skip];

          if (!( (v1>v0) &&(v2>v1) && (v2>v3) && (v3>v4) ))
            continue;

          var isBeat = v2-v4;

          autoGain = autoGain>isBeat ?autoGain :isBeat;
          sum += isBeat/autoGain;

          isBeat = Math.pow(isBeat/autoGain,1)*255;

        }

        sum = sum/8;

        FFTCtx.strokeStyle = "rgb(0,0,0,"+sum+")";

        FFTCtx.beginPath();

        FFTCtx.moveTo(510, 128);
        FFTCtx.lineTo(510, 128-sum*32);
        FFTCtx.stroke(); 

        FFTCtx.drawImage(FFTCvs, -1, 0);


        autoGain *= 0.998;

      }, 5);
    }

  })();
