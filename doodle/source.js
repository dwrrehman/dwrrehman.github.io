// The Doodle Compiler.
// Doodle uses Call Signature Resolution to draw on an HTML canvas.

// ----------------- DOM setup stuff ------------------------

const center_x = window.innerWidth / 2;
const center_y = window.innerHeight / 2;
var canvas = document.getElementById("canvas");
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

var editor = CodeMirror(document.body, {
  value: "",
  mode:  "javascript",
  lineNumbers: true,
  tabSize: 4,
  autofocus: true  
});

// ----------------- compiler: ---------------------

function csr(context, tokens, count) {
	var t = tokens.join("");
	if (t == "repeat") {

	}
}

function compile(text) {
	
	var tokens = new Array(text.length);	
	var loc = new Array(2 * text.length);
	var count = 0, l = 1, c = 1;

	for (var i = 0; i < text.length; i++) {
		if (text[i].charCodeAt(0) > 32) {
			loc[2 * count] = l;
            loc[2 * count + 1] = c;
            tokens[count++] = text[i];            
		} if (text[i] == '\n') { l++; c = 1; } else c++;
	}

	var context = {};
	csr(context, tokens, count);
}


editor.on("change", function() {
	compile(editor.getValue());
});


// console.log(Math.sin(4));

var draw = canvas.getContext("2d"); 
draw.moveTo(center_x,center_y);
draw.lineTo(50,5);
draw.stroke();
draw.moveTo(50,5);
draw.lineTo(30,40);
draw.stroke();




function info() {
	alert("User clicked info!!!");
	console.log("User clicked info!!!");
}











