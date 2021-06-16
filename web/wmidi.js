function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r,g,b];
}

////////



var OUT = false;

var initWebmidi = function(_err){
	if (_err){
		document.getElementById('midiLabel').innerHTML = 'WebMidi off';
		return;
	}
	
	if (!WebMidi.outputs.length){
		document.getElementById('midiLabel').innerHTML = 'WebMidi missing outputs';
		return;
	}


	OUT = WebMidi.outputs[0];

	document.getElementById('midiLabel').innerHTML = 'WebMidi ok with '
	 + WebMidi.outputs.length
	 + ' outputs, using: '
	 + OUT.name
	;


	document.getElementById('midiCtrl').style.display = '';
}





function midiCC(_chan, _ctrl, _val){
	OUT.sendControlChange(_ctrl, _val, _chan);
}

function midi3CC(_chan, _ctrl, _v3A){
	OUT.sendControlChange(_ctrl, _v3A[0]*127, _chan);
	OUT.sendControlChange(_ctrl+1, _v3A[1]*127, _chan);
	OUT.sendControlChange(_ctrl+2, _v3A[2]*127, _chan);
}



var midiEvt = false;

function midiRun(_state){
	if (_state){
		if (midiEvt)
			return;
	
		var cCtrl = 0;
		var cVal = 0;
		midiEvt = setInterval(function(){
			OUT.sendControlChange(cCtrl,cVal,1);
			OUT.sendControlChange(cCtrl,cVal,3);
			if (cVal++ > 126)
				cVal=0;
		}, 20);

		return;
	}

	clearInterval(midiEvt);
	midiEvt = false;
}


function midiGo(){
	OUT.playNote("C3", 2);
	OUT.playNote("C3", 1);
}





function setBG(_el, _rgbA){
	var rH = Math.round(_rgbA[0]*255).toString(16);
	var gH = Math.round(_rgbA[1]*255).toString(16);
	var bH = Math.round(_rgbA[2]*255).toString(16);

	var hex = "#"
	 + (rH.length==1 ? "0":'') + rH
	 + (gH.length==1 ? "0":'') + gH
	 + (bH.length==1 ? "0":'') + bH;

	_el.style.background = hex;
}


function initPad(){
	var cPad = document.getElementById('pad');

	var padLock = false;
	var padHSL = [0,0,0];

	cPad.addEventListener('mousemove', function(e) {
		if (!padLock)
			return;

		padHSL[0] = (e.offsetX / e.target.offsetWidth);
		padHSL[2] = (1- (e.offsetY / e.target.offsetHeight) );

		var rgb = hslToRgb(padHSL[0], padHSL[1], padHSL[2]);
		setBG(cPad, rgb);
		midi3CC(1,0,rgb);
	});
	
	cPad.addEventListener('mousewheel', function(e) {
		e.preventDefault();

		padHSL[1] += 0.02 * (e.deltaY>0?1:-1);
		padHSL[1] = Math.max(padHSL[1], 0);
		padHSL[1] = Math.min(padHSL[1], 1);

		var rgb = hslToRgb(padHSL[0], padHSL[1], padHSL[2]);
		setBG(cPad, rgb);
		midi3CC(1,0,rgb);
	});

	cPad.addEventListener('click', function(e) {
		padLock = !padLock;
	});
}


////////////////////////
window.onload = function(){
	initPad();


	WebMidi.enable(initWebmidi);
};
