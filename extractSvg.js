var svgs = new Array();
var curSvg = 0;
var countSvg = 0;
var curStrSvg = "";
var serializer = new XMLSerializer();

// later change to input frame rate
var runScript = window.setInterval(getSVG, 1000/20);

function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}

function getSVG() {
	var svgList = document.querySelectorAll("svg");
	
	if (svgList.length > 0){
		var newSvg = svgList[0];



		var newStrSvg = serializer.serializeToString(newSvg);

		svgs[countSvg] = newStrSvg;
		//console.log('Svg'+countSvg+' : ' +svgs[countSvg]);
		//console.log('svgslist: ' + svgList.length);
		//console.log('svgs: ' + svgs.length);
		
		countSvg++;
	}
	
	/*
	// Comparison doesnt work because every svg is different, so better to work on a fps basis.
	if (svgList.length > 0) {
		
		var newSvg = svgList[0];
		
		if (countSvg === 0) {
			curSvg = newSvg;				
			curStrSvg = serializer.serializeToString(curSvg);
			countSvg++;
		}
		else {	
			var newStrSvg = serializer.serializeToString(newSvg);
		
			//console.log(curStrSvg);
			//console.log('vs');
			//console.log(newStrSvg);
			
			var test = curStrSvg.localeCompare(newStrSvg);
			console.log('test :' + test);
			if (test) {
				console.log('New SVG found');
				curSvg = newSvg;
				countSvg++;
			}	
		}		
	}
	
	// debugger
	
	if (svgList.length > 1) {
		console.log('test2');
	}
	*/
}

function stopExtraction() {
	clearInterval(runScript);
	console.log('countSvg ' + countSvg);
	
	var svgsStr = svgs.join('|');
	$.post("getsvgs.php", svgsStr, function( data ) {
		$( "body" ).append( "<a href=" + data + ">Download</a>" );
	});
}

// Swiffy Object Loading

var swiffyobject= {};
var stage;

function loadFile() {
    var input, file, fr, swiffyDiv;

    if (typeof window.FileReader !== 'function') {
        write("The file API isn't supported on this browser yet.");
        return;
    }

    input = document.getElementById('swiffyFile');
    if (!input) {
        write("Um, couldn't find the swiffyFile element.");
    }
    else if (!input.files) {
        write("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
        write("Please select a file before clicking 'Load'");
    }
    else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = createSwiffy;
        fr.readAsText(file);
    }

    function createSwiffy() {
        swiffyDiv = document.createElement('div');
		swiffyDiv.id = 'swiffycontainer';
        //swiffy.onload = startAnimation;
        swiffyDiv.style.width = "468px"; // get from file
		swiffyDiv.style.height = "60px"; // get from file
		var re = /swiffyobject = .*?;/;
		var inputObjStr = re.exec(fr.result);
		//console.log('REGEX : ' + testRe[0].substring(15));
		
		// var outStr = JSON.stringify(testRe[0].substring(15));
		// console.log('STRINGIFY : ' + outStr);
		
		try {
		swiffyobject = eval("(function(){return " + inputObjStr + ";})()");
		//JSON.parse(outStr);
		
		console.log(swiffyobject.internedStrings);
		
		console.log('JSON : ' + swiffyobject);
		} catch (e) {
			console.error("Parsing error:", e); 
		}
		
		document.body.insertBefore(swiffyDiv, document.body.firstChild)			
        //document.body.appendChild(swiffyDiv);
		setTimeout(startAnimation, 1000);	
    }

    function startAnimation() {	
		console.log('Before animation'); 
		
		stage = new swiffy.Stage(document.getElementById('swiffycontainer'),swiffyobject);		
		console.log('After');
		stage.start();
		
		
		
		console.log('animation started');
		
		setTimeout(stopExtraction, 3000);
    }

    function write(msg) {
        var p = document.createElement('p');
        p.innerHTML = msg;
        document.body.appendChild(p);
    }
}
