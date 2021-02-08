const font_wh_ratio = 0.6;
var font_size = 30;	
var window_columns = 0;
var window_rows = 0;
var cursor_line = 0;
var cursor_column = 0;
var screen = [];

function flush_screen() {

	document.getElementById("terminal").style.fontSize = font_size.toString() + "px";
	document.getElementById("terminal").style.lineHeight = font_size.toString() + "px";
	
	const width  = 	window.innerWidth || 
			document.documentElement.clientWidth || 
			document.body.clientWidth;

	const height = 	window.innerHeight || 
			document.documentElement.clientHeight || 
			document.body.clientHeight;

	window_rows = Math.floor(height / font_size);
	window_columns = Math.floor(width / (font_size * font_wh_ratio));

	while(window_rows > screen.length) screen.push(Array(window_columns).fill(' '));

	if (cursor_line >= window_rows) cursor_line = window_rows - 1;
	if (cursor_column >= window_columns) cursor_column = window_columns - 1;

	console.log("window height and width:  ", width, height);
	console.log("cursor x y: ", cursor_column, cursor_line);
	console.log("window rows and cols : ", window_rows, window_columns);

	let string = "";
	for (let line = 0; line < window_rows; line++) {
		for (let column = 0; column < window_columns; column++) {

			if (line === cursor_line && column === cursor_column) {
				string += "<u>";
			}

			let c = " ";
			if (	line < screen.length && 
				column < screen[line].length) 

				c = screen[line][column];

			if (c === '\n') break;
			else if (c === ' ') string += "&nbsp;";
			else if (c === '\t') string += "&nbsp;";
			else string += c;

			if (line === cursor_line && column === cursor_column) {
				string += "</u>";
			}
		}
		string += "<br>";
	}
	document.getElementById("terminal").innerHTML = string;
}

function user_input(event) {
	event = event || window.event;

	if (
		event.key === "Dead" || 
		event.key === "Control" || 
		event.key === "Shift" || 
		event.key === "Alt" || 
		event.key === "Meta" || 
		event.key === "CapsLock") return;

	if (event.key === "Enter") {
		cursor_column = 0;
		if (cursor_line < window_rows - 1) cursor_line += 1;

	} else if (event.key === "Tab") {
		screen[cursor_line][cursor_column] = ' ';
		if (cursor_column < window_columns - 1) cursor_column += 1;

	} else if (event.key === "Backspace") {
		if (cursor_column > 0) cursor_column -= 1;
		screen[cursor_line][cursor_column] = ' ';

	} else if (event.key === 'ArrowRight') { 
		if (cursor_column < window_columns - 1) cursor_column += 1;

	} else if (event.key === 'ArrowLeft') {
		if (cursor_column > 0) cursor_column -= 1;

	} else if (event.key === 'ArrowUp') {
		if (cursor_line > 0) cursor_line -= 1;

	} else if (event.key === 'ArrowDown') {
		if (cursor_line < window_rows - 1) cursor_line += 1;

	} else {
		screen[cursor_line][cursor_column] = event.key;
		if (cursor_column < window_columns - 1) cursor_column += 1;
	}

	flush_screen();
}

function write_string(string) {
	for (let i = 0; i < string.length; i++) {

		if (string[i] === '\n') {
			cursor_column = 0;
			if (cursor_line < window_rows - 1) cursor_line += 1;
		} else {
			screen[cursor_line][cursor_column] = string[i];
			if (cursor_column < window_columns - 1) cursor_column += 1;
		}

	}
}

window.onload = function() {
	flush_screen();
	write_string("This is the interface for Daniel Rehman's website.\nIt's still a work in progress, currently!\n  Try typing something!\n");
	flush_screen();
	document.addEventListener('keydown', user_input, false);
	setTimeout(function() {
    		document.getElementById('trigger').focus();
	}, 0);
}


























// old code:


/*

things to do:

	- make a mv move command to reanme and relocate files.
	- allow sudo, and permissons
	- allow cd commands to use absolule locations too.							
	- fix the count command, so it ccounts words correctlty.

	



var manuals = {				
	"help": "a utility which displays helpeful text describing a given command. if no command is given, it just displays the help menu or available commands.", 
	"edit": "edits a file or directory on the file system, and creates it if it doesnt exist. use the Esc key or '~' key to exit the editor. this command can also be used to make an empty directory, by simply making an empty file. note, content is saved automatically upon exit. ",
	"list": "lists the contents in a directory, or the contents of a file. lists the files in the current directory, if nothing is given. ",								
	"change": "changes current directory to the directory given. if none is given, the root directory is assumed. '..' is the parent directory, and '.' is the current directory.",
	"present": "prints the current full directory you are in.",
	"count": "counts the number of characters in a file, as well as the number of lines, and the number of words.",
	"clear":"clears the screen. doesnt affect any file system data, however.",
	"remove": "deletes a file or directory, by setting its data to undefined. it also updates the parent directory to reflect this change",
	"execute": "executes a file, as javascript code. the identifier '_return' is used in the code to print something to the screen. '_parameters' is used to access the list of strings passed into the program, when executed. _parameters[0] is the command that was executed, _parameters[1] is the name of the program, and _parameters[2] is the first actual parameter.",
	"dump": "outputs the current state of the entire filesystem as a JSON string. this is used debug, as well as save the filesystem externally, and then reload it again with the init command.",
	"init": "reinitialize the whole filesystem by setting it equal to javascript object obtained by parsing the JSON string given."
}

var prompt_begin = ":";
var prompt_emblem = ":>";
var current_directory = "/";
var welcome_message = "This is a Command Line Interface For Daniel's Website. <br>type \"?\" for more info.";
var commandline_mode = true;
var has_focused_before = false;			
var last_target;
var file_being_edited = "";
var filepath_being_edited = "";
var screen_save = "";

function file(filename, filedata) {								
	this.filename = filename;
	this.filedata = filedata;
}

var files = new Object(); 
var fs = {"/":{"filename":"/","filedata":""}};


function prompt_string() {
	var directory = current_directory.slice(0, current_directory.length-1);
	var index = directory.lastIndexOf("/");				
	directory = directory.slice(index+1);				
	return prompt_begin + directory + prompt_emblem + String.fromCharCode(160);			
}

function load(string) {
	var result = JSON.parse(string);
	if (result != undefined) {
		files = result;
		return "successfully inited.\n";
	} else return "failed to init.\n";				
}

function init_command(commandlist) {
	if (commandlist.length == 1) {					
		 return load(JSON.stringify(fs));
	}
	var string = "";
	for (i = 1; i < commandlist.length; i++) {
		string += commandlist[i] + " ";
	}
	 return load(string);
}

function ls_command(commandlist) {
	// find flags:
	var a_flag = false;	
	var new_commandlist = [];				
	for (i = 0; i < commandlist.length; i++) {
		if (commandlist[i] == "-a") {						
			a_flag = true;
		} else {
			new_commandlist.push(commandlist[i]);
		}
	}
	var commandlist = new_commandlist;

	if (a_flag) {
		if (commandlist[1] != undefined) {						
			if (files[current_directory + commandlist[1] + "/"] != undefined) {
				return files[current_directory + commandlist[1] + "/"].filedata;
			}
		} else {						
			return files[current_directory].filedata;
		}
	} 

	if (!a_flag) {
		var result = "";
		if (commandlist[1] != undefined) {
			if (files[current_directory + commandlist[1] + "/"] != undefined) {
				var dir_text = files[current_directory + commandlist[1] + "/"].filedata;
				var dir_contents = dir_text.split('\n');
				for (i = 0; i < dir_contents.length; i++) {

					if (dir_contents[i].charAt(0) != ".") {										
						result += dir_contents[i];
						if (i < dir_contents.length-1)
							result += "\n";
					}
				}
				return result;
			}
		} else {
			var dir_text = files[current_directory].filedata;
			var dir_contents = dir_text.split('\n');
			for (i = 0; i < dir_contents.length; i++) {

				if (dir_contents[i].charAt(0) != ".") {										
					result += dir_contents[i];
					if (i < dir_contents.length-1)
						result += "\n";
				}
			}
			return result;
		}
	}
	return "";
}

function count_command(commandlist) {
	if (commandlist[1] === undefined) return "must pass in a file to count.\n";
	if (files[current_directory + commandlist[1] + "/"] != undefined) {
		var file = files[current_directory + commandlist[1] + "/"].filedata;
		var character_count = file.length;
		var word_count = file.replace( /\n/g, " " ).split( " " ).length;
		var line_count = file.split('\n').length;
		return "lines: " + line_count + ", words: " + word_count + ", characters: " + character_count + "\n";
	} else {
		return "";
	}
}

function edit_command(commandlist) {				
	if (commandlist[1] === undefined) return "must pass in a filename to edit.\n";
	commandline_mode = false;
	file_being_edited = commandlist[1];
	filepath_being_edited = current_directory + file_being_edited + "/";
	var initial_data = "";
	if (files[filepath_being_edited] === undefined) {
		files[current_directory].filedata += file_being_edited + "\n";
	} else {
		initial_data = files[filepath_being_edited].filedata;
	}					
	screen_save = document.getElementById("text").innerText;
	document.getElementById("text").innerText = initial_data;
	return "";
}

function execute_command(commandlist) {
	if (commandlist[1] === undefined) return "must pass in a program to execute.\n";
	_return = "";
	_parameters = commandlist;
	eval(files[current_directory + commandlist[1] + "/"].filedata);
	return _return;
}

function change_command(commandlist) {
	if (commandlist[1] == ".." && current_directory != "/") {
		var index = current_directory.slice(0, current_directory.length - 1).lastIndexOf("/");
		current_directory = current_directory.slice(0, index + 1);

	} else if (commandlist[1] == ".." && current_directory == "/") {
		return "";
		
	} else if (commandlist[1] == ".") { 
		return "";

	} else if (commandlist[1] === undefined) {
		current_directory = "/";
		return "";

	} else {						
		var directory_exists = false;
		var files_in_current_directory = files[current_directory].filedata.split('\n');
		for (var i = 0; i < files_in_current_directory.length; i++) {
			if (files_in_current_directory[i] == commandlist[1] && files[current_directory + files_in_current_directory[i] + "/"] != undefined) {
				directory_exists = true;
			}
		}
		if (directory_exists) 
			current_directory += commandlist[1] + "/";	 // only relative movement through fs.			
		else {
			return "file does not exist.\n";
		}
	}
	return "";
}

// stubs for executed javscript to use to interact with the terminal.
var _return;
var _parameters;
//

function interpret(commandstring) {				
	var commandlist = commandstring.trim().split(' ');
	var command = commandlist[0];

	if (command == "help" || command == "?" || command == "man") {
		if (commandlist[1] === undefined) {
		return "commands:\nedit(ed) <file> \nlist(ls) [file] \npresent(pwd) \nchange(cd) [file] \ndump \ninit [JSON string] \nremove(rm) <file> \ncount(wc) <file> \nclear(l) \nexecute(x) <file> \nhelp(?) [command]\n";
	} else {
		if (manuals[commandlist[1]] != undefined) {
			return manuals[commandlist[1]] + "\n";
		} else return "no manual for " + commandlist[1] + ".\n"; 
	}

	} else if (command == "edit" || command == "ed" || command == "e" || command == "mkdir") {
		return edit_command(commandlist);

	} else if (command == "remove" || command == "rm") {
		
		var text = files[current_directory].filedata;
		var index = text.indexOf(commandlist[1] + "\n");
		if (index < 0) {
			return "file does not exist.\n";
		} else {
			var first = text.slice(0, index);
			var second = text.slice(index + commandlist[1].length + 1);						
			files[current_directory].filedata = first + second;
			files[current_directory + commandlist[1] + "/"] = undefined;										
			return "";
		}										

	} else if (command == "execute" || command == "x") {
		return execute_command(commandlist);

	} else if (command == "change" || command == "cd") {
		return change_command(commandlist);

	} else if (command == "present" || command == "pwd") {
		return current_directory + "\n";					
						
	} else if (command == "list" || command == "ls" || command == "sl" || command == "cat") {
		return ls_command(commandlist);

	} else if (command == "clear" || command == "l") {
		document.getElementById("text").innerHTML = "";	
		return "";

	} else if (command == "count" || command == "wc") {
		return count_command(commandlist);

	} else if (command == "dump") {
		return JSON.stringify(files) + "\n";

	} else if (command == "init") {
		return init_command(commandlist);			

	} else if (command == "") 
		return ""; 

	else return "unknown command: " + command + "\n";
}

function placeCaretAtEnd(el) {
	el.focus();
	if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
	var range = document.createRange();
	range.selectNodeContents(el);
	range.collapse(false);
	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
	} else if (typeof document.body.createTextRange != "undefined") {
	var textRange = document.body.createTextRange();
	textRange.moveToElementText(el);
	textRange.collapse(false);
	textRange.select();
	}
}

function on_focus() {
	if (!has_focused_before) {
		has_focused_before = true;
		files = fs;
		document.getElementById("text").innerHTML = welcome_message + "<br>" + prompt_string();		
	}
	placeCaretAtEnd(document.getElementById("text"));										
}

window.onload = function() {
	document.addEventListener('keyup', function(event) { 					
		var last_character_in_text = document.getElementById("text").innerText.slice(-1);

		// command line mode:
		if (commandline_mode && event.key == "Enter" && last_character_in_text == "\n") {
			// get command:
			var start_index = document.getElementById("text").innerText.lastIndexOf(prompt_emblem) + prompt_emblem.length + 1;
			var end_index = document.getElementById("text").innerText.length - 2;
			var command = document.getElementById("text").innerText.slice(start_index, end_index);					
			var result = interpret(command);

			// prompt again
			if (file_being_edited == "") {
				document.getElementById("text").innerText = document.getElementById("text").innerText.slice(0, document.getElementById("text").innerText.length-1);
			}

			document.getElementById("text").innerText += result;
			if (commandline_mode) 
				document.getElementById("text").innerText += prompt_string();	

			placeCaretAtEnd(document.getElementById("text"))

		// text mode:
		} else if (!commandline_mode && (event.key == "Escape" || event.key == "~")) {						
			if (event.key == "~") {	
				document.getElementById("text").innerText = document.getElementById("text").innerText.slice(0, document.getElementById("text").innerText.length-1);						
			}

			files[filepath_being_edited] = new file(file_being_edited, document.getElementById("text").innerText);
			commandline_mode = true;
			document.getElementById("text").innerText = screen_save + prompt_string();	
			placeCaretAtEnd(document.getElementById("text"));
			file_being_edited = "";
			filepath_being_edited = "";
		}
	}, false);

	on_focus();
}    		


*/