// web-assembly terminal emulator.

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

let string = "";

const run = async () => {
	const imports = { env: { abort: () => console.log("Abort!") } };
	const m = await wasmBrowserInstantiate("program.wasm", imports);
	const r = m.instance.exports.add(1,2);

	string = `Hello World! addResult: ${r} `
	document.body.innerHTML = string + "<span>" + "</span>";
};

document.addEventListener('keydown', (event) => {

	var name = event.key;
	var code = event.code;
	if (name === 'Control') {
		//console.log("control!!");
	return;
	}
	if (event.ctrlKey) {
		//alert(`Combination of ctrlKey + ${name} \n Key code Value: ${code}`);
	} else if (name !== "Meta") {
		//alert(`Key pressed ${name} \n Key code Value: ${code}`);
	}

	if (name === "Enter") string += "\n"
	else if (name === "Tab") string += "\t"
	else if (name === "Shift") {}
	else if (name === "Meta") {}
	else if (name === "Alt") {}
	else if (name === "Backspace") {
		string = string.slice(0, -1)
	}
	else string += name; // = `Hello World! addResult: ${r}`;

	document.body.innerHTML = string + "<span>" + "</span>";

	event.preventDefault();
  }, false);


run();





































/*  // if you want to add the control key up event...


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

*/