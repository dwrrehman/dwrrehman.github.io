const prompt_emblem = "::"

const welcome_message = "\
This is the terminal interface for Daniel Rehman's website.<br>\
Type \"a\" for more info.<br>";

const help_message = "\
\
a 	 : INFO: this help menu <br>\
w 	 : PWD: print working directory <br>\
e (file) : LIST: display file <br>\
f (file) : FILE: inspect file <br>\
\
j (file) : JUMP: change directory <br>\
i (file) : INT: unimplemented <br>\
o (file) : OPEN: unimplemented <br>\
;	 : CLEAR: clear screen <br>"

const example_html_string = "\
listing not available right now.<br>\
<a href='https://www.w3schools.com'>https://www.w3schools.com</a><br>\
<img src='dog.JPG' title='this is a dog' width='128' height='128'><br>"

var T = null

var working_directory = "/"

function run(command) {
	if (command === "nbsp;") return "";	
	else if (command === "a") return help_message
	else if (command === "w") return working_directory + "<br>";
	else if (command === "e") return example_html_string;
	else if (command === "f") return "file-command unimplemented.<br>";
	else if (command === "j") return "jump-command unimplemented.<br>";
	else if (command === "i") return "inter command unimplemented.<br>";
	else if (command === "o") return "open command unimplemented.<br>";
	else if (command === "l") { T.innerHTML = ""; return ""; }
	else return "?<br>"
}

function input(event) {
	event = event || window.event
	if (event.key === "Enter") {
		let start = T.innerHTML.lastIndexOf(prompt_emblem) + prompt_emblem.length + 1
		T.innerHTML = T.innerHTML.slice(0, -15)
		let command = T.innerHTML.slice(start, T.innerHTML.length);
		T.innerHTML += "<br>"
		let output = run(command)
		T.innerHTML += output + prompt_emblem + "&nbsp;"
	} 
	T.focus();
	var range = document.createRange();
	range.selectNodeContents(T);
	range.collapse(false);
	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

window.onload = function() {
	T = document.getElementById("terminal")
	T.innerHTML = welcome_message + prompt_emblem + "&nbsp;"
	document.addEventListener('keyup', input, false);
}
