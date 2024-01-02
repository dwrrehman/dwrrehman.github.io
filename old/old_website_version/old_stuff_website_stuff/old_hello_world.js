











/*
// Set up a console element in the dom
const consoleElement = document.createElement("pre");
consoleElement.style = `border: 1px solid black`;
consoleElement.textContent = `
  DOM Console:
`;
document.body.appendChild(consoleElement);

export function domConsoleLog(string) {
  console.log(string);

  if (string === undefined) {
    string = "undefined";
  }

  consoleElement.textContent = `${consoleElement.textContent} 
  ${string}
  `;
}
*/













/*

const __exports = {};
let wasm;

function init(module, imports) {
  let result;
 
  if (
    module instanceof URL || typeof module === "string" || module instanceof Request
  ) {
    const response = fetch(module);
    if (typeof WebAssembly.instantiateStreaming === "function") {
      result = WebAssembly.instantiateStreaming(response, imports).catch(e => {
        console.warn(
          "`WebAssembly.instantiateStreaming` failed. Assuming this is because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
          e
        );
        return response
          .then(r => r.arrayBuffer())
          .then(bytes => WebAssembly.instantiate(bytes, imports));
      });
    } else {
      result = response
        .then(r => r.arrayBuffer())
        .then(bytes => WebAssembly.instantiate(bytes, imports));
    }
  } else {
    result = WebAssembly.instantiate(module, imports).then(result => {
      if (result instanceof WebAssembly.Instance) return { instance: result, module }; else return result;
    });
  }
  return result.then(({ instance, module }) => {wasm = instance.exports; init.__wbindgen_wasm_module = module; return wasm; });
}

const run = async () => {
	const imports = { math : { callback : x => console.log("result is", x) } } ; 
	const m = await init("program.wasm", imports);
	const r = m.add(5, 10);
	document.body.textContent = `This is the final result: ${r}. its cool.`;
};

run();
*/





/*
let imports = {
	math : {
		callback : x => console.log("result is", x)
	}
}


const __exports = {};

let wasm;

const run_all = async () => {
	let m = await Webassembly.instantiateStreaming(fetch("program.wasm"), imports)
	let x = m.instance.exports.add(5, 10)
	document.body.textContent = `Hello world from space!  ...sum is: ${x}`
}
run_all();
*/