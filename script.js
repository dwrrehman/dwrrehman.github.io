// web terminal emulator running a rv32 vm, that i've made to be my personal website!
// ....cuz why not.
// written on 1202401011.202029, by dwrr.
// updated on 1202504034.001706

import { executable } from "./program.js";

//if (window.location.protocol !== "https:") {
//	window.location.replace("https://" + window.location.host + window.location.pathname + window.location.search);
//}

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
	document.body.innerHTML = screen + 
	"<textarea id='in' style='height:12px; width:100px; opacity:0; filter:alpha(opacity=0);' autofocus></textarea>"
	document.getElementById('in').focus();
}

function putstring(s) {	
	screen += s;
	update_screen();
	document.getElementById('in').focus();
}

function write_syscall(at, n) {
	let s = "";
	for (let i = 0; i < n; i++) {

		let n = memory[at + i];

		if (n == 27) {

			console.log("FOUND AN ANSI ESCAPE CODE!!");

		} else {
			s += String.fromCharCode(n);
		}
	}
	putstring(s);
	document.getElementById('in').focus();
	return n;
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
		     if (c === "Shift") 	{ }
		else if (c === "Meta") 		{ }
		else if (c === "Enter") 	{ x.preventDefault(); count++; s += "\n"; }
		else if (c === "Tab") 		{ x.preventDefault(); count++; s += "\t"; }
		else if (c === "Backspace") 	{ x.preventDefault(); count++; s += "\b"; }		
		else 				{ count++; s += `${x.key}`; }
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

async function ecall() {

	let n = registers[17];
	let a0 = registers[10];
	let a1 = registers[11];
	let a2 = registers[12];

	console.log("performing system call: " + n + ", " + a0 + ", " + a1 + ", " + a2 + ". ");

	     if (n == 0) return 0; // (unknown system call)
	else if (n == 1) return 1; // system_exit
	else if (n == 2) registers[10] = await read_syscall(a1, a2);   // count = read(address length)
	else if (n == 3) registers[10] = write_syscall(a1, a2);        // count = write(address length)

	console.log("returning result: " + registers[10]);

	return 0;
}

async function riscv_virtual_machine(instruction_count) {
	
	registers[2] = instruction_count * 4; // stack pointer, x2/sp.

	let pc = 0; 
	while (pc >= 0 && pc < instruction_count) {

		let word = memory[pc + 0] | (memory[pc + 1] << 8) | (memory[pc + 2] << 16) | (memory[pc + 3] << 24);

		console.log("[pc = " + pc + "]: executing: " + word.toString(16));

		let op = word & 0x7F;
		let bit30 = (word >> 30) & 1;
		let Rd = (word >> 7) & 0x1F;
		let fn = (word >> 12) & 0x7;
		let Rs1 = (word >> 15) & 0x1F;
		let Rs2 = (word >> 20) & 0x1F;
		let imm12 = (word >> 20) & 0xFFF;

		let f7 = (word >> 25) & 0x3F;

		if (((imm12 >> 11) & 0x1) == 1) imm12 |= 0xFFFFF000;
		let U_imm20 = word & 0xFFFFF000;

		registers[0] = 0;

		//let save_pc = pc;

		if (op == 0x37) { // LUI
			console.log("LUI x" + Rd + " #" + U_imm20.toString(16));
			registers[Rd] = U_imm20;
			pc += 4;
			
		} else if (op == 0x17) { // AUIPC
			console.log("AUIPC x" + Rd + " #" + U_imm20.toString(16));
			registers[Rd] = U_imm20 + pc;
			pc += 4;
			
		} else if (op == 0x6F) { // JAL
			let imm10_1 = (word >> 21) & 0x3FF;
			let imm20 = (word >> 31) & 0x1;
			let imm11 = (word >> 20) & 0x1;
			let imm19_12 = (word >> 12) & 0xFF;
			let imm = (imm20 << 20) | (imm19_12 << 12) | (imm11 << 11) | (imm10_1 << 1);
			if (imm20 == 1) imm |= 0xFFE00000;

			console.log("JAL x" + Rd + " #" + imm.toString(16));

			registers[Rd] = pc + 4;
			pc += imm;
			
		} else if (op == 0x67) { // JALR

			console.log("JALR x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));

			let target = registers[Rs1] + imm12;
			target &= 0xFFFFFFFE;
			registers[Rd] = pc + 4;
			pc = target;
			
		} else if (op == 0x63) { // BEQ / BNE / BLT / BGE / BLTU / BGEU 
			let limm12 = (word >> 31) & 0x1;
			let imm10_5 = (word >> 25) & 0x3F;
			let imm11 = (word >> 7) & 0x1;
			let imm4_1 = (word >> 8) & 0xF;
			let imm = (limm12 << 12) | (imm11 << 11) | (imm10_5 << 5) | (imm4_1 << 1);
			if (limm12 == 1) imm |= 0xFFFFE000;
			
			if (fn == 0) { // BEQ
				console.log("BEQ x" + Rs1 + " x" + Rs2 + " #" + imm.toString(16));
				if (registers[Rs1] == registers[Rs2]) pc += imm; else pc += 4;

			} else if (fn == 1) { // BNE
				console.log("BNE x" + Rs1 + " x" + Rs2 + " #" + imm.toString(16));
				if (registers[Rs1] != registers[Rs2]) pc += imm; else pc += 4;

			} else if (fn == 4) { // BLT
				console.log("BLT x" + Rs1 + " x" + Rs2 + " #" + imm.toString(16));   // bug: make these signed checks. 
				if (registers[Rs1] < registers[Rs2]) pc += imm; else pc += 4;

			} else if (fn == 5) { // BGE
				console.log("BGE x" + Rs1 + " x" + Rs2 + " #" + imm.toString(16));   // bug: make these signed checks. 
				if (registers[Rs1] >= registers[Rs2]) pc += imm; else pc += 4;

			} else if (fn == 6) { // BLTU				
				console.log("BLTU x" + Rs1 + " x" + Rs2 + " #" + imm.toString(16));
				if (registers[Rs1] < registers[Rs2]) pc += imm; else pc += 4;				

			} else if (fn == 7) { // BGEU
				console.log("BGEU x" + Rs1 + " x" + Rs2 + " #" + imm.toString(16));
				if (registers[Rs1] >= registers[Rs2]) pc += imm; else pc += 4;

			} else putstring("error: unknown instruction executed"); 
			
		} else if (op == 0x03) { // LB / LH / LW / LBU / LHU

			if (fn == 0) { // LB
				console.log("LB x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));
				let x = (memory[registers[Rs1] + imm12 + 0] << 0);      // make this sign extend the destination.
				registers[Rd] = x;

			} else if (fn == 1) { // LH
				console.log("LH x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));
				let x = (memory[registers[Rs1] + imm12 + 0] << 0);     // make this sign extend the destination.
				x |= (memory[registers[Rs1] + imm12 + 1] << 8);
				registers[Rd] = x;
	
			} else if (fn == 2 || fn == 6) { // LW / LWU
				console.log("LW x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));
				let x = (memory[registers[Rs1] + imm12 + 0] << 0);
				x |= (memory[registers[Rs1] + imm12 + 1] << 8);
				x |= (memory[registers[Rs1] + imm12 + 2] << 16);
				x |= (memory[registers[Rs1] + imm12 + 3] << 24);
				registers[Rd] = x;

			} else if (fn == 4) { // LBU 
				console.log("LB x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));
				let x = (memory[registers[Rs1] + imm12 + 0] << 0);
				registers[Rd] = x;

			} else if (fn == 5) { // LHU
				console.log("LH x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));
				let x = (memory[registers[Rs1] + imm12 + 0] << 0);
				x |= (memory[registers[Rs1] + imm12 + 1] << 8);
				registers[Rd] = x;

			} else putstring("error: unknown instruction executed"); 

			pc += 4;


		} else if (op == 0x23) { // SB / SH / SW

			let imm = Rd | (f7 << 5);

			if (fn == 0) {
				console.log("SB x" + Rs1 + " #" + imm.toString(16) + " x" + Rs2);
				memory[registers[Rs1] + imm + 0] = (registers[Rs2] >> 0) & 0xFF;

			} else if (fn == 1) {
				console.log("SH x" + Rs1 + " #" + imm.toString(16) + " x" + Rs2);
				memory[registers[Rs1] + imm + 0] = (registers[Rs2] >> 0) & 0xFF;
				memory[registers[Rs1] + imm + 1] = (registers[Rs2] >> 8) & 0xFF;

			} else if (fn == 2) {
				console.log("SW x" + Rs1 + " #" + imm.toString(16) + " x" + Rs2);
				memory[registers[Rs1] + imm + 0] = (registers[Rs2] >> 0) & 0xFF;
				memory[registers[Rs1] + imm + 1] = (registers[Rs2] >> 8) & 0xFF;
				memory[registers[Rs1] + imm + 2] = (registers[Rs2] >> 16) & 0xFF;
				memory[registers[Rs1] + imm + 3] = (registers[Rs2] >> 24) & 0xFF;

			} else putstring("error: unknown instruction executed"); 

			pc += 4;



		} else if (op == 0x13) { // ADDI / SLTI / SLTIU / XORI / ORI / ANDI / SLLI / SRLI / SRAI

			if (fn == 0) { // ADDI
				console.log("ADDI x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));
				registers[Rd] = registers[Rs1] + imm12;

			} else if (fn == 1) { // SLLI
				console.log("SLLI x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));
				registers[Rd] = registers[Rs1] << imm12;

			} else if (fn == 2) { // SLTI
				console.log("SLTI x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));
				registers[Rd] = registers[Rs1] < imm12;        // bug: make this check a signed-less-than. 

			} else if (fn == 3) { // SLTIU
				console.log("SLTIU x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));
				registers[Rd] = registers[Rs1] < imm12;

			} else if (fn == 4) { // XORI
				console.log("XORI x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));
				registers[Rd] = registers[Rs1] ^ imm12;

			} else if (fn == 5 && bit30 == 0) { // SRLI
				console.log("SRLI x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));
				registers[Rd] = registers[Rs1] >> (imm12 & 0x1F);

			} else if (fn == 5 && bit30 == 1) { // SRAI
				console.log("SRAI x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));
				registers[Rd] = registers[Rs1] >> (imm12 & 0x1F);    // bug: make this do an actual arithmetic shift right. 

			} else if (fn == 6) { // ORI
				console.log("ORI x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));
				registers[Rd] = registers[Rs1] | imm12;

			} else if (fn == 7) { // ANDI
				console.log("ANDI x" + Rd + " x" + Rs1 + " #" + imm12.toString(16));
				registers[Rd] = registers[Rs1] & imm12;
			} else putstring("error: unknown instruction executed"); 
			pc += 4;



		} else if (op == 0x33) { // ADD / SUB / SLL / SLT / SLTU / XOR / SRL / SRA / OR / AND

			if (f7 == 0 || bit30) { 

			if (fn == 0 && bit30 == 0) { // ADD
				console.log("ADD x" + Rd + " x" + Rs1 + " x" + Rs2);
				registers[Rd] = registers[Rs1] + registers[Rs2];

			} else if (fn == 0 && bit30 == 1) { // SUB
				console.log("SUB x" + Rd + " x" + Rs1 + " x" + Rs2);
				registers[Rd] = registers[Rs1] - registers[Rs2];

			} else if (fn == 1) { // SLL
				console.log("SLL x" + Rd + " x" + Rs1 + " x" + Rs2);
				registers[Rd] = registers[Rs1] << registers[Rs2];

			} else if (fn == 2) { // SLT
				console.log("SLT x" + Rd + " x" + Rs1 + " x" + Rs2);
				registers[Rd] = registers[Rs1] < registers[Rs2];        // bug: make this check a signed-less-than. 

			} else if (fn == 3) { // SLTU
				console.log("SLTU x" + Rd + " x" + Rs1 + " x" + Rs2);
				registers[Rd] = registers[Rs1] < registers[Rs2];

			} else if (fn == 4) { // XOR
				console.log("XOR x" + Rd + " x" + Rs1 + " x" + Rs2);
				registers[Rd] = registers[Rs1] ^ registers[Rs2];

			} else if (fn == 5 && bit30 == 0) { // SRL / SRA
				console.log("SRL x" + Rd + " x" + Rs1 + " x" + Rs2);
				registers[Rd] = registers[Rs1] >> registers[Rs2];

			} else if (fn == 5 && bit30 == 1) { // SRL / SRA
				console.log("SRA x" + Rd + " x" + Rs1 + " x" + Rs2);
				registers[Rd] = registers[Rs1] >> registers[Rs2];       // bug: make this an actual arithmetic shift right. 

			} else if (fn == 6) { // OR
				console.log("OR x" + Rd + " x" + Rs1 + " x" + Rs2);
				registers[Rd] = registers[Rs1] | registers[Rs2];

			} else if (fn == 7) { // AND
				console.log("AND x" + Rd + " x" + Rs1 + " x" + Rs2);
				registers[Rd] = registers[Rs1] & registers[Rs2];
			} else putstring("error: unknown instruction executed"); 

			} else {

				if (fn == 0) { // MUL
					console.log("MUL x" + Rd + " x" + Rs1 + " x" + Rs2);
					registers[Rd] = registers[Rs1] * registers[Rs2];

				} else if (fn == 1) { // MULH
					console.log("MULH x" + Rd + " x" + Rs1 + " x" + Rs2);
					registers[Rd] = registers[Rs1] * registers[Rs2];

				} else if (fn == 2) { // MULHSU
					console.log("MULHSU x" + Rd + " x" + Rs1 + " x" + Rs2);
					registers[Rd] = registers[Rs1] * registers[Rs2];

				} else if (fn == 3) { // MULHU
					console.log("MULHU x" + Rd + " x" + Rs1 + " x" + Rs2);
					registers[Rd] = registers[Rs1] * registers[Rs2];

				} else if (fn == 4) { // DIV
					console.log("DIV x" + Rd + " x" + Rs1 + " x" + Rs2);
					registers[Rd] = registers[Rs1] / registers[Rs2];

				} else if (fn == 5) { // DIVU
					console.log("DIVU x" + Rd + " x" + Rs1 + " x" + Rs2);
					registers[Rd] = registers[Rs1] / registers[Rs2];

				} else if (fn == 6) { // REM
					console.log("REM x" + Rd + " x" + Rs1 + " x" + Rs2);
					registers[Rd] = registers[Rs1] % registers[Rs2];

				} else if (fn == 7) { // REMU
					console.log("REMU x" + Rd + " x" + Rs1 + " x" + Rs2);
					registers[Rd] = registers[Rs1] % registers[Rs2];
				}
			}
			pc += 4;

		} else if (op == 0x1F) { // FENCE / FENCE.I
			console.log("FENCE / FENCE.I ...");
			putstring("\nerror: illegal instruction opcode: 0x" + op.toString(16));
			pc += 4;


		} else if (op == 0x73) { // ECALL / EBREAK / CSRRW / CSRRW / CSRRS / CSRRC / CSRRWI / CSRRSI / CSRRCI

			if (op == word) {
				console.log("ECALL");
				if (await ecall()) return; 

			} else {
				console.log("EBREAK / CSRxx ...");
				putstring("\nerror: illegal instruction opcode: 0x" + op.toString(16));
			}
			pc += 4;

		} else {
			putstring("\nerror: illegal instruction opcode: 0x" + op.toString(16));
			pc += 4;
		}

		//pc = save_pc + 4;
	}

	// screen = startup;
	// save();	
	putstring("[process exited]");
}

async function execute_program() {

	nvmemory = new Uint8Array(180);
	nvmemory.fill(0);

	registers = new Uint32Array(32);
	registers.fill(0);
	
	memory = new Uint8Array(65536 * 2);
	memory.fill(0);

	for (let i = 0; i < executable.length; i++) 
		memory[i] = executable[i];

	document.getElementById('in').focus();
	await riscv_virtual_machine(executable.length);
}

const main = async () => {
	let raw = get_cookie("state");
	decodeURIComponent(raw)
	let braw = atob(raw);
	let state = {}
	try { state = JSON.parse(braw); } 
	catch(e) { console.error(e); }
	if (state._nvmemory) nvmemory = state._nvmemory;
	document.getElementById('in').focus();
	putstring(startup);
	document.getElementById('in').focus();
	execute_program();
};

main();






























/*function backspace() {
	screen = screen.slice(0, -1); 
	update_screen();
	document.getElementById('in').focus();
}*/






/*		if (op == 0) { if (await ecall(r0)) return; } // ecall

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


*/



