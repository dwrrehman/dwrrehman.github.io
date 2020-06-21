// a program for doodling on html canvases, using code that uses csr.

var canvas = document.getElementById("canvas");

var editor = CodeMirror(document.body, {
  value: "code here...",
  mode:  "javascript",
  lineNumbers: true,
  tabSize: 4,
  autofocus: true  
});

editor.on("change", function() {
	console.log(editor.getValue());
});

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
var center_x = window.innerWidth / 2;
var center_y = window.innerHeight / 2;

// console.log(Math.sin(4));

var draw = canvas.getContext("2d"); 
draw.moveTo(center_x,center_y);
draw.lineTo(50,5);
draw.stroke();
draw.moveTo(50,5);
draw.lineTo(30,40);
draw.stroke();












