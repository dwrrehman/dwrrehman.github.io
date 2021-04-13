// a program for doodling on html canvases, using code that uses csr.

var textarea = document.getElementById("text");
var canvas = document.getElementById("canvas");

var myCodeMirror = CodeMirror.fromTextArea(textarea);

var draw = canvas.getContext("2d"); 

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

var center_x = window.innerWidth / 2;
var center_y = window.innerHeight / 2;


function inch() {

}











function start() {
	
	console.log(Math.sin(4));

	draw.moveTo(center_x,center_y);

	draw.lineTo(50,5);
	draw.stroke();
	draw.moveTo(50,5);
	draw.lineTo(30,40);
	draw.stroke();
}

start()


