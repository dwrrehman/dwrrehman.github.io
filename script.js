// web terminal emulator, that i'm made to be my website. 
// cuz why not.
// written on 202401011.202029, by dwrr.

let registers = [];

let memory = [];

let nvmemory = [];

let text = [];

let startup = `
   <img style="height: 130px; width: 130px; vertical-align: middle; border-radius: 35px;" src="https://avatars.githubusercontent.com/u/19484282?v=4" alt="Hello world!" />   <b>Hi! I'm Daniel Rehman!</b>

     GitHub:   <a href="https://github.com/dwrrehman">github.com/dwrrehman</a>
     GitLab:   <a href="https://gitlab.com/dwrrehman">gitlab.com/dwrrehman</a>
     LinkedIn: <a href="https://linkedin.com/in/dwrr">linkedin.com/in/dwrr</a>
     Resume:   <a href="./resume.pdf">./resume.pdf</a>

     Feel free to explore my various 
   programming projects here! Try using  
    the unix commands for navigation,
   or type "<i>help</i>" for more information.

`;

let screen = "";

function update_screen() {
	document.body.innerHTML = 
	screen + 
	"<span></span><textarea id='in' style='width:100px; opacity:0; filter:alpha(opacity=0);' autofocus></textarea>"
	document.getElementById('in').focus();
}

function putstring(s) {	
	screen += s;
	update_screen();
	document.getElementById('in').focus();
}

function write_syscall(at, n) {	
	let s = "";
	for (let i = 0; i < n; i++) s += String.fromCharCode(memory[at + i]);
	putstring(s);
	document.getElementById('in').focus();
	return n;
}

function backspace() {
	screen = screen.slice(0, -1); 
	update_screen();
	document.getElementById('in').focus();
}

function getc() {
	document.getElementById('in').focus();
	return new Promise(
		function(resolve) { return document.body.addEventListener('keydown', resolve, { once: true }); }
	);
}

async function read_syscall(at, n) {

	document.getElementById('in').focus();

	let count = 0;	
	let s = "";
	while (count < n) {
		let x = await getc();
		document.getElementById('in').focus();
		let c = x.key;
		     if (c === "Enter") 	{ putstring("\n"); count++; s += "\n"; break; }
		else if (c === "Tab") 		{ x.preventDefault(); putstring("\t"); count++; s += "\t"; }
		else if (c === "Shift") 	{ }
		else if (c === "Meta") 		{ }
		else if (c === "Backspace") 	{ if (count) { backspace(); count--; s = s.slice(0, -1); }  }
		else 				{ putstring(`${x.key}`); count++; s += `${x.key}`; }
	}
	
	for (let i = 0; i < count; i++) {
		memory[at + i] = s[i].charCodeAt(0);
	}
	document.getElementById('in').focus();

	return count;
}

function save_cookie(name,value,exp_days) {
    var d = new Date();
    d.setTime(d.getTime() + (exp_days * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function get_cookie(name) {
    var cname = name + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cname) == 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return "";
}

//function hexify(arr) {
//	return Array.from(arr, function(byte) { return ('0' + (byte & 0xFF).toString(16)).slice(-2); }).join('')
//}

function save() {
	let newstate = {
		_nvmemory: nvmemory,
	}
	let z = JSON.stringify(newstate);
	let y = btoa(z);
	let x = encodeURIComponent(y);
	console.log(x);
	console.log(y);
	console.log(z);
	save_cookie("state", x, 12);

	let raw = get_cookie("state");
	decodeURIComponent(raw)
	let braw = atob(raw);
	console.log(raw);
	console.log(braw);
}

async function svc() {
	document.getElementById('in').focus();
	if (registers[16] == 1) return 1;
	if (registers[16] == 2) registers[0] = BigInt(await read_syscall(Number(registers[1]), Number(registers[2])));
	if (registers[16] == 3) registers[0] = BigInt(     write_syscall(Number(registers[1]), Number(registers[2])));
	save();
	return 0;
}

async function my_program() {

	putstring("/:: ");
	registers[16] = 2n;
	registers[1]  = 0n;
	registers[2]  = 100n;
	if (await svc()) return;

	putstring("Pressed: ");
	registers[16] = 3n;
	registers[1]  = 0n;
	registers[2]  = registers[0];
	if (await svc()) return;

	putstring("Press a key: ");
	registers[16] = 2n;
	registers[1]  = 0n;
	registers[2]  = 50n;
	if (await svc()) return;

	putstring("Pressed: ");
	registers[16] = 3n;
	registers[1]  = 0n;
	registers[2]  = registers[0];
	if (await svc()) return;

	putstring("Press a key: ");
	registers[16] = 2n;
	registers[1]  = 0n;
	registers[2]  = 50n;
	if (await svc()) return;

	putstring("Pressed: ");
	registers[16] = 3n;
	registers[1]  = 0n;
	registers[2]  = registers[0];
	if (await svc()) return;

	screen = startup;
	save();
}

async function execute_program() {

	registers = new BigUint64Array(32);
	registers.fill(0n);

	memory = new Uint8Array(65000);
	memory.fill(0);

	text = new Uint8Array(65000);
	text.fill(0);

	nvmemory = new Uint8Array(180);
	nvmemory.fill(0);

	document.getElementById('in').focus();
	await my_program();
}

const main = async () => {

	let raw = get_cookie("state");
	decodeURIComponent(raw)
	let braw = atob(raw);
	console.log(raw);
	console.log(braw);

	let state = {}
	try { state = JSON.parse(braw); } 
	catch(e) { console.error(e); }

	console.log(state);
	if (state._nvmemory) nvmemory = state._nvmemory;

	document.getElementById('in').focus();
	document.getElementById('in').focus();
	putstring(startup);
	document.getElementById('in').focus();
	execute_program();
};

main();














/*
next todos:                use          http://[::]:8000/           to see webpage.     do ./start first    or    python3 -m http.server 




	- implement a filesystem:   add a simple shell system, using execve, and fork, 
	- generate the jvascript machine code statements for assembly in our assembler! to emulate arm 64. yay. 

	- make a simple os too?

	- implment a simple editor too!     allow editing any sort of file.      make this thing self programmable. plz. yay. 

	- implement a feature to save the staete of the file system, in order to 

*/









//document.cookie = "state={screen: 't', registers: [0], memory: [0]}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";















// document.addEventListener('keydown', inputted, false);



/*



function inputted(event) {

	var name = event.key
	var code = event.code

	if (name === 'Control') {
		//console.log("control!!");
		return false;
	} else if (event.ctrlKey) {
		//alert(`Combination of ctrlKey + ${name} \n Key code Value: ${code}`);
		return false;
	} else if (name !== "Meta") {
		//alert(`Key pressed ${name} \n Key code Value: ${code}`);
		return false;
	}

	if (name === "Enter") screen += "\n"
	else if (name === "Tab") screen += "\t"
	else if (name === "Shift") return false;
	else if (name === "Meta") return false;
	else if (name === "Alt") return false;
	else if (name === "Backspace") {
		screen = screen.slice(0, -1)
	} else screen += name

	document.body.innerHTML = screen + "<span>" + "</span>"

	event.preventDefault()

	return true;
}




for (const e of s) {
		string += e;
		if (e == "\n") column = 0; else column++;
		//if (column == 30) { string += "\n"; column = 0; }
	}
*/














/* 


<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Daniels placeholder website title</title>
    <link rel="stylesheet" href="style.css">
    <script type="module" src="script.js"></script>
  </head>
  <body><span></span></body>
</html>




// if you want to add the control key up event...


  document.addEventListener('keyup', (event) => {
    var name = event.key;
    if (name === 'Control') {
      alert('Control key released');
    }
  }, false);
*/











/*
document.addEventListener("keyup", detectTabKey);

function detectTabKey(e) {
    if (e.keyCode == 9) {
        activeElem = document.activeElement;
        alert(activeElem.href);
    }
}

document.onkeypress = function(evt) {
	evt = evt || window.event;
	var code = evt.keyCode || evt.which;
	var c = String.fromCharCode(code);
	document.body.textContent += code + " ";
};





export const wasmBrowserInstantiate = async (module, imports) => {

	let response = undefined
	if (WebAssembly.instantiateStreaming) {
		response = await WebAssembly.instantiateStreaming(fetch(module), imports)
	} else {
		const task = async () => {
			const wasmArrayBuffer = await fetch(module).then(response => response.arrayBuffer())
			return WebAssembly.instantiate(wasmArrayBuffer, imports)
		};
		response = await task()
	}
	return response;

};

const imports = { env: { abort: () => console.log("Abort!") } };
const m = await wasmBrowserInstantiate("program.wasm", imports);
const r = m.instance.exports.add(1,2);





*/