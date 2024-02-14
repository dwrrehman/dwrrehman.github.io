// web terminal emulator running a rv32-like vm, that i'm made to be my personal website!
// ....cuz why not.
// written on 1202401011.202029, by dwrr.

import { executable } from "./program.js";

let registers = [];
let nvmemory = [];
let memory = [];

let startup = `
   <img style="height: 130px; width: 130px; vertical-align: middle; border-radius: 35px;" src="https://avatars.githubusercontent.com/u/19484282?v=4" alt="Hello world!" />   <b>Hi! I'm Daniel Rehman!</b>

     GitHub:   <a href="https://github.com/dwrrehman">github.com/dwrrehman</a>
     GitLab:   <a href="https://gitlab.com/dwrrehman">gitlab.com/dwrrehman</a>
     LinkedIn: <a href="https://linkedin.com/in/dwrr">linkedin.com/in/dwrr</a>
     Resume:   <a href="./resume.pdf">./resume.pdf</a>

     Feel free to explore my programming 
      projects here! Try using the unix 
     commands to explore, or type "<i>help</i>".

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

function save() {
	let newstate = { _nvmemory: nvmemory, }
	let z = JSON.stringify(newstate);
	let y = btoa(z);
	let x = encodeURIComponent(y);
	save_cookie("state", x, 12);
	let raw = get_cookie("state");
	decodeURIComponent(raw)
	let braw = atob(raw);
}

async function ecall(x) {
	if (false) {}
	else if (x == 0) return 0;
	else if (x == 1) return 1;
	else if (x == 2) registers[0] = await read_syscall(registers[1], registers[2]);
	else if (x == 3) registers[0] = write_syscall(registers[1], registers[2]);
	return 0;
}

async function virtual_machine(instruction_count) {
	let pc = 0; 
	while (pc < instruction_count) {

		let op = memory[pc + 0] | (memory[pc + 1] << 8);
		let r0 = memory[pc + 2] | (memory[pc + 3] << 8);
		let r1 = memory[pc + 4] | (memory[pc + 5] << 8);
		let r2 = memory[pc + 6] | (memory[pc + 7] << 8);

		r0 = r0 < 32768 ? r0 : r0 - 65536;
		r1 = r1 < 32768 ? r1 : r1 - 65536;
		r2 = r2 < 32768 ? r2 : r2 - 65536;

		console.log("executing: " + op + " : " + r0 + " : " + r1 + " : " + r2 + "..."); 

		if (op == 0) { if (await ecall(r0)) return; } // ecall

		else if (op == 2)  registers[r0] = registers[r1] + registers[r2]; // add
		else if (op == 3)  registers[r0] = registers[r1] - registers[r2]; // sub
		else if (op == 4)  registers[r0] = registers[r1] * registers[r2]; // mul
		else if (op == 5)  registers[r0] = registers[r1] / registers[r2]; // div
		else if (op == 6)  registers[r0] = registers[r1] % registers[r2]; // rem
		else if (op == 7)  registers[r0] = registers[r1] & registers[r2]; // and
		else if (op == 8)  registers[r0] = registers[r1] | registers[r2]; // or
		else if (op == 9)  registers[r0] = registers[r1] ^ registers[r2]; // xor
		else if (op == 10) registers[r0] = registers[r1] < registers[r2]; // slt
		else if (op == 11) registers[r0] = registers[r1] << registers[r2];// sll
		else if (op == 12) registers[r0] = registers[r1] >> registers[r2];// srl

		else if (op == 13)  registers[r0] = registers[r1] + r2; // addi
		else if (op == 14)  registers[r0] = registers[r1] - r2; // subi
		else if (op == 15)  registers[r0] = registers[r1] * r2; // muli
		else if (op == 16)  registers[r0] = registers[r1] / r2; // divi
		else if (op == 17)  registers[r0] = registers[r1] % r2; // remi
		else if (op == 18)  registers[r0] = registers[r1] & r2; // andi
		else if (op == 19)  registers[r0] = registers[r1] | r2; // ori
		else if (op == 20)  registers[r0] = registers[r1] ^ r2; // xori
		else if (op == 21) registers[r0] = registers[r1] < r2; // slti
		else if (op == 22) registers[r0] = registers[r1] << r2;// slli
		else if (op == 23) registers[r0] = registers[r1] >> r2;// srli

		else if (op == 24) { // lb
			registers[r0] = memory[registers[r1] + r2];
		} else if (op == 25) { // lh
			let m0 = memory[registers[r1] + r2 + 0];
			let m1 = memory[registers[r1] + r2 + 1];
			registers[r0] = (m1 << 8) + (m0);
		} else if (op == 26) { // lw
			let m0 = memory[registers[r1] + r2 + 0];
			let m1 = memory[registers[r1] + r2 + 1];
			let m2 = memory[registers[r1] + r2 + 2];
			let m3 = memory[registers[r1] + r2 + 3];
			registers[r0] = (m3 << 24) +  (m2 << 16) +  (m1 << 8) + (m0);

		} else if (op == 27) { // sb
			memory[registers[r1] + r2] = 0xFF & registers[r0];
		} else if (op == 28) { // sh
			memory[registers[r1] + r2 + 0] = 0xFF & registers[r0];
			memory[registers[r1] + r2 + 1] = 0xFF & (registers[r0] >> 8);
		} else if (op == 29) { // sw
			memory[registers[r1] + r2 + 0] = 0xFF & registers[r0];
			memory[registers[r1] + r2 + 1] = 0xFF & (registers[r0] >> 8);
			memory[registers[r1] + r2 + 2] = 0xFF & (registers[r0] >> 16);
			memory[registers[r1] + r2 + 3] = 0xFF & (registers[r0] >> 24);
		} 

		else if (op == 30) { if (registers[r1] == registers[r2]) pc += r0 * 8; } // beq
		else if (op == 31) { if (registers[r1] != registers[r2]) pc += r0 * 8; } // bne
		else if (op == 32) { if (registers[r1] <  registers[r2]) pc += r0 * 8; } // blt
		else if (op == 33) { if (registers[r1] >= registers[r2]) pc += r0 * 8; } // bge
		else if (op == 34) { registers[r1] = pc; pc += r0; } // jal
		else if (op == 35) { registers[r1] = pc; pc = registers[r0]; } // jalr

		else if (op == 40) { // debug instruction

			console.log("-------- registers --------");
			for (let i = 0; i < registers.length; i++) {
				if (registers[i] != 0) {
					console.log("registers[" + i + "] = " + registers[i] + "    ");
				}
			}

			console.log("-------- memory --------");
			for (let i = 0; i < memory.length; i++) {
				if (memory[i] != 0) {
					console.log("memory[" + i + "] = " + memory[i] + "    ");
				}
			}
		}

		else { putstring("\nfatal error: unknown instruction opcode: " + op + "\nhow did you get here?..."); }

		pc += 8;
	}
	
	// screen = startup;
	// save();	

	putstring("[process exited]");
}

async function execute_program() {

	nvmemory = new Uint8Array(180);
	nvmemory.fill(0);

	registers = new Int32Array(4096);
	registers.fill(0);
	
	memory = new Uint8Array(65536 * 2);
	memory.fill(0);

	for (let i = 0; i < executable.length; i++) 
		memory[i] = executable[i]

	document.getElementById('in').focus();
	await virtual_machine(executable.length);
}



const main = async () => {

	let raw = get_cookie("state");
	decodeURIComponent(raw)
	let braw = atob(raw);
	//console.log(raw);
	//console.log(braw);

	let state = {}
	try { state = JSON.parse(braw); } 
	catch(e) { console.error(e); }

	//console.log(state);
	if (state._nvmemory) nvmemory = state._nvmemory;

	document.getElementById('in').focus();
	putstring(startup);
	document.getElementById('in').focus();
	execute_program();
};

main();
