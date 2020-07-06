// The Doodle Compiler.
// Doodle is a language which uses Call Signature Resolution (CSR) 
// to draw on an HTML canvas, and draw pretty pictures.
// for the purposes of teaching people how program in a fun way!







// ----------------- DOM setup stuff ------------------------

var canvas = document.getElementById("canvas");
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
var draw = canvas.getContext("2d"); 

var editor = CodeMirror(document.body, {
    value: "",
    mode:  "",
    lineNumbers: true,
    tabSize: 4,
    autofocus: true  
});

function random_in(m) {
    return Math.floor(Math.random() * m) + 1  
}

/* --------------------- useful code: --------------------


    Math.sin(4);
    Math.cos(4);

    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");

    ctx.beginPath();

    ctx.moveTo(20, 20);
    ctx.lineTo(20, 100);
    ctx.lineTo(70, 100);

    ctx.closePath();    
    ctx.stroke();

    ctx.fillStyle = "red";
    ctx.fill();

*/

// ----------------- compiler: ---------------------

/*

struct resolved {
    size_t index;
    size_t count;
    size_t begin;
    size_t done;
    struct resolved* args;
};

struct name {
    size_t type;
    size_t length;
    size_t* signature;
    uint32_t codegen_as;
    uint32_t precedence;
};

struct context {
    size_t best;
    size_t frame_count;
    size_t index_count;
    size_t name_count;
    size_t* frames;
    size_t* indicies;
    struct name* names;
    struct name* owners;
};



*/

function csr(context, tokens, count) {

    for (var i = 0; i < count; i++) {

        if (tokens[i] == 101) {            // just for testing

            var x = random_in(canvas.width);
            var y = random_in(canvas.height);
            draw.lineTo(x,y);            
            draw.stroke();
        }
    }	
}

function compile(text) {
	
	var tokens = new Array(text.length);	
	var loc = new Array(2 * text.length);
	var count = 0, l = 1, c = 1;

	for (var i = 0; i < text.length; i++) {
		var k = text[i].charCodeAt(0);
		if (k > 32) {
			loc[2 * count] = l;
            loc[2 * count + 1] = c;
            tokens[count++] = k;
		} if (text[i] == '\n') { l++; c = 1; } else c++;
	}

	var context = {};
	csr(context, tokens, count);
}

function reset_canvas() {        
    draw.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.width;
    draw.moveTo(canvas.width / 2, canvas.height / 2);
}

editor.on("change", function() {
    reset_canvas();
	compile(editor.getValue());
});

function info() {
	alert("unimplemented. currently just clears the canvas.");
	reset_canvas();
}
