0 ctf
	this is a program that runs in a 
	rv32-like virtual machine, inside
	of my terminal emulator website.

	written by dwrr on 202402132.234551.
0 ctstop

1 systemexit define
01 systemread define
11 systemwrite define 

0101 '\n' define
000001 ___ define


100001 '!' define
011101 '.' define

1000001 'A' define
0100001 'B' define
1100001 'C' define
0010001 'D' define
1010001 'E' define
0110001 'F' define
1110001 'G' define
0001001 'H' define

1001001 'I' define
0101001 'J' define
1101001 'K' define
0011001 'L' define
1011001 'M' define
0111001 'N' define
1111001 'O' define
0000101 'P' define
1000101 'Q' define
0100101 'R' define
1100101 'S' define
0010101 'T' define
1010101 'U' define
0110101 'V' define
1110101 'W' define
0001101 'X' define
1001101 'Y' define
0101101 'Z' define




101001 codestart define
0 0 codestart jal

	0001 stringstart define

	'H' db
	'I' db
	___ db
	'T' db
	'H' db
	'E' db
	'R' db
	'E' db

	'!' db
	___ db
	'T' db
	'H' db
	'I' db
	'S' db
	___ db
	'I' db

	'S' db
	___ db
	'S' db
	'T' db
	'I' db
	'L' db
	'L' db
	___ db

	'A' db
	___ db
	'W' db
	'O' db
	'R' db
	'K' db
	___ db
	'I' db

	'N' db
	___ db
	'P' db
	'R' db
	'O' db
	'G' db
	'R' db
	'E' db

	'S' db
	'S' db
	'!' db
	'\n' db
	'L' db
	'O' db
	'L' db
	'.' db

	000011 stringcount define


codestart ctat

	0 ecall
	0 ecall
	
	stringcount 01 01 addi
	stringstart 1 1 addi

	systemwrite ecall

	systemexit ecall

eof


011 1001 1001 addi
101 0101 0101 addi
0101 1001 1011 mul
1111111111111111 01 01 addi

