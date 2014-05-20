var extractedSvgs = new Array();
var curSvg = 0;
var countSvg = 0;
var countGetSvg = 0;
var curStrSvg = "";
var serializer = new XMLSerializer();

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

// Swiffy Object Loading
var swiffyobject= {};
var stage;
var runExtractor = 0;

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

    var parser = new DOMParser();
		var doc = parser.parseFromString(fr.result, "text/html");
		var width = doc.getElementById("swiffycontainer").style.width;
		var height = doc.getElementById("swiffycontainer").style.height;

    swiffyDiv.style.width = width;
		swiffyDiv.style.height = height;
		
		var re = /swiffyobject = .*?;/;
		var inputObjStr = re.exec(fr.result);
		
		try {
			swiffyobject = eval("(function(){return " + inputObjStr + ";})()");
			
			console.log('swiffyobject: ');
			console.log(swiffyobject);
		} catch (e) {
			console.error("Parsing error:", e); 
		}

		document.body.appendChild(swiffyDiv);
		setTimeout(startAnimation, 1000);	
	}

  function startAnimation() {	
		console.log('Before animation'); 
		// later change to input frame rate
		var frameRate = document.getElementById("framerate").value;
		runExtractor = window.setInterval(getSVG, 1000 / frameRate);
		console.log("runExtractor " + runExtractor);


		stage = new swiffy.Stage(document.getElementById('swiffycontainer'),swiffyobject);		
		stage.start();
		console.log('Animation started');
  }

  function write(msg) {
    var p = document.createElement('p');
    p.innerHTML = msg;
    document.getElementById("controls").appendChild(p);
  }
}

function stopExtraction() {
	clearInterval(runExtractor);
	
	var allSvgsStr = extractedSvgs.join('|');
	
	getZipFile(allSvgsStr);
}

function getZipFile(svgsStr) {
	$.post("getsvgs.php", svgsStr, function( data ) {
		$("<div id='download'><a href=" 
			+ data + ">Download SVGs</a></div>").insertAfter("#controls");
	});
}
