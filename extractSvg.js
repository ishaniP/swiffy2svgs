var extractedSvgs = new Array();
var curSvg = 0;
var countSvg = 0;
var countGetSvg = 0;
var curStrSvg = "";
var serializer = new XMLSerializer();

// later change to input frame rate
frameRate = 1000/10;
var runExtractor = window.setInterval(getSVG, frameRate);
console.log("runExtractor " + runExtractor);

function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}

function getSVG() {
	countGetSvg++;
	
	var svgList = document.getElementsByTagName("svg");
	
	if (svgList.length > 0){
		var newSvg = svgList[0];
		newSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
		newSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

		var newSvgStr = serializer.serializeToString(newSvg);

		extractedSvgs[countSvg] = newSvgStr;
		countSvg++;
		
		//console.log('Svg'+countSvg+' : ' +extractedSvgs[countSvg]);
		//console.log('svgslist: ' + svgList.length);
		//console.log('extractedSvgs: ' + extractedSvgs.length);
	}
}

function stopExtraction() {
	clearInterval(runExtractor);
	console.log('countSvg ' + countSvg);
	
	var allSvgsStr = extractedSvgs.join('|');
	
	$.post("getsvgs.php", allSvgsStr, function( data ) {
		$("<div style='margin-bottom: 30px;'><a  href=" + data + ">Download SVGs</a></div>").insertAfter("h1");
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
        write("Hum, couldn't find the swiffyFile element.");
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
		
		document.body.appendChild(swiffyDiv);
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
