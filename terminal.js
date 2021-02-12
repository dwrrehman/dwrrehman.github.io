const prompt_emblem = "::"

const welcome_message = "\
This is the terminal interface for Daniel Rehman's website.<br>\
Type \"i\" for more info.<br>";

const help_message = "\
l : CLEAR: clear screen <br>\
i : INFO: this help menu <br>\
s : LIST: display file <br>\
d : MOVE: cd <br>\
w : PWD: print working directory <br>\
e : EDIT: edit file <br>\
f : : <br>\
a : : <br>\n"

const example_html_string = "\
listing not available right now.<br>\
<a href='https://www.w3schools.com'>my href here.</a><br>\
<img src='dog.JPG' title='this is a dog' width='128' height='128'><br>"

var T = null

var working_directory = "/usr/home/me"

function run(command) {
	if (command === "") return ""; 
	else if (command === "i") return help_message
	else if (command === "l") { T.innerHTML = ""; return ""; }
	else if (command === "w") return working_directory + "<br>";
	else if (command === "s") return example_html_string;
	else return "?<br>"
}

function input(event) {
	event = event || window.event
	if (event.key === "Enter") {
		let start = T.innerHTML.lastIndexOf(prompt_emblem) + prompt_emblem.length + 1
		T.innerHTML = T.innerHTML.slice(0, -15)
		let end = T.innerHTML.length;
		let command = T.innerHTML.slice(start, end)
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
	T.innerHTML = welcome_message + prompt_emblem + String.fromCharCode(160)
	document.addEventListener('keyup', input, false);
}

