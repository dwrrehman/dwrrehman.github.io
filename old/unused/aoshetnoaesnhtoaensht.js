// web terminal emulator.

let string = "";




function inputted(event, resolve) {

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

	if (name === "Enter") string += "\n"
	else if (name === "Tab") string += "\t"
	else if (name === "Shift") return false;
	else if (name === "Meta") return false;
	else if (name === "Alt") return false;
	else if (name === "Backspace") {
		string = string.slice(0, -1)
	} else string += name

	document.body.innerHTML = string + "<span>" + "</span>"

	event.preventDefault()

	return true;
}

function get_raw_character() {
	return new Promise(
		function(resolve) { 
			function doit(e) {
				inputted(e);
				resolve(e);
			}
			return document.addEventListener('keypress', doit, { once: true }); 
		}
	);
}

function my_getchar() {
	return (await get_raw_character()).which;
}

function getstring() {

	my_getchar()

	if (x == 13) {
		

	}
}

function putstring(s) {
	string += s;
	document.body.innerHTML = string + "<span>" + "</span>"
}

async function execute_program() {
	while (1) {

		putstring("\nPress a key: ");
		let s = getstring();

		putstring("gave: ");
		putstring(`string{${s}}\n`);

		putstring("\nPress a key: ");
		let s = getstring();

		putstring("gave:");
		putstring(`string{${s}}\n`);
	}
}

const run = async () => {
	string = "hello world! This is daniel's website.\n"
	document.body.innerHTML = string + "<span>" + "</span>";
	execute_program();
};



// document.addEventListener('keydown', inputted, false);

run();





































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