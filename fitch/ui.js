/*  Fitch proof helper
 *  GUI script
 *  Copyright 2018 Harmen de Weerd
 */

document.addEventListener("DOMContentLoaded", function(){
		proof = getProof();
		addProofLine();
		document.getElementById("goalLine").addEventListener("blur", parseFormula);
		document.getElementById("goalLine").addEventListener("focus", resetFormatting);
		document.getElementById("goalLine").setAttribute("lineNumber", "goal");
		document.getElementById("exportLatexButton").addEventListener("click", exportLatexProof);
		document.getElementById("exportPlainButton").addEventListener("click", exportPlainProof);
		updateProof();
	});

/**************************************************/
// Select boxes 

ruleSelectBox = [
		["None", "-- None --"], 
		["Premise", "Premise", ""], 
		["Assumption", "Assumption", ""],
		["Flag", "Flag", ""], 
		["Tautology", "Tautology", "$\\mathbf{Taut}$"], 
		["Reiteration", "Reiteration", "$\\mathbf{Reit}$"], 
		["= Introduction", "= Introduction", "$\\mathbf{=I}$"], 
		["= Elimination", "= Elimination", "$\\mathbf{=E}$"], 
		["& Introduction", "&and; Introduction", "$\\mathbf{\\lor{}I}$"], 
		["& Elimination", "&and; Elimination", "$\\mathbf{\\lor{}E}$"],  
		["| Introduction", "&or; Introduction", "$\\mathbf{\\land{}I}$"],  
		["| Elimination", "&or; Elimination", "$\\mathbf{\\land{}E}$"],  
		["~ Introduction", "&not; Introduction", "$\\mathbf{\\lnot{}I}$"],  
		["~ Elimination", "&not; Elimination", "$\\mathbf{\\lnot{}E}$"],  
		["# Introduction", "&perp; Introduction", "$\\mathbf{\\bot{}I}$"],  
		["# Elimination", "&perp; Elimination", "$\\mathbf{\\bot{}E}$"], 
		["-> Introduction", "&rarr; Introduction", "$\\mathbf{\\to{}I}$"], 
		["-> Elimination", "&rarr; Elimination", "$\\mathbf{\\to{}E}$"],  
		["<-> Introduction", "&harr; Introduction", "$\\mathbf{\\leftrightarrow{}I}$"],  
		["<-> Elimination", "&harr; Elimination", "$\\mathbf{\\leftrightarrow{}E}$"],  
		["@ Introduction", "&forall; Introduction", "$\\mathbf{\\forall{}I}$"],
		["@ Elimination", "&forall; Elimination", "$\\mathbf{\\forall{}E}$"],
		["? Introduction", "&exist; Introduction", "$\\mathbf{\\exists{}I}$"],  
		["? Elimination", "&exist; Elimination", "$\\mathbf{\\exists{}E}$"]];

function createSelectBox(options) {
	// Creates a select box with given options
	var selectElement, optionElement;
	selectElement = document.createElement("select");
	for (var i = 0; i < options.length; ++i) {
		optionElement = document.createElement("option");
		optionElement.setAttribute("value", options[i][0]);
		optionElement.innerHTML = options[i][1];
		selectElement.appendChild(optionElement);
	}
	return selectElement;
}

function createRuleSelector() {
	return createSelectBox(ruleSelectBox);
}

function createAssumptionSelector() {
	return createSelectBox([[0,"Same depth"],[1,"Increased depth"]]);
}

/**************************************************/
// User interface

function createProofLine() {
	// Creates the interface for a new line in the proof
	var iIndex = document.getElementsByClassName("fitchFormula").length;
	var trElement = createTrElement(iIndex);
	document.getElementsByClassName("fitchTable")[0].children[0].appendChild(trElement);
	return trElement;
}

function addProofLine() {
	var trElement = createProofLine();
	if (proof.length < document.getElementsByClassName("fitchFormula").length) {
		resetLine(proof, proof.length);
	}
	return trElement;
}

function makeElementWithAttributes(strLabel, oAttributes) {
	var elem = document.createElement(strLabel);
	for (var i in oAttributes) {
		elem.setAttribute(i, oAttributes[i]);
	}
	return elem;
}

function createTrElement(iIndex) {
	var trElement, tdElement, currentElement, iIndex;
	trElement = makeElementWithAttributes("tr", {lineNumber: iIndex});
	trElement.appendChild(document.createElement("td"));
	tdElement = document.createElement("td");
	tdElement.addEventListener("click", moveFocus);
	tdElement.appendChild(makeElementWithAttributes("div", {class: "turnstile"}));
	currentElement = makeElementWithAttributes("div", {class: "fitchFormula", contenteditable: "true"});
	currentElement.addEventListener("blur", parseFormula);
	currentElement.addEventListener("focus", resetFormatting);
	tdElement.appendChild(currentElement);
	tdElement.appendChild(makeElementWithAttributes("div", {class: "tooltiptext lefttooltip"}));
	trElement.appendChild(tdElement);
	tdElement = document.createElement("td");
	currentElement = createRuleSelector()
	currentElement.addEventListener("blur", parseRule);
	currentElement.addEventListener("change", parseRule);
	currentElement.setAttribute("class","fitchRule");
	tdElement.appendChild(currentElement);
	currentElement = makeElementWithAttributes("div", {class: "fitchLines", contenteditable: "true"});
	currentElement.style.display = "none";
	currentElement.addEventListener("blur", parseLines);
	tdElement.appendChild(currentElement);
	currentElement = createAssumptionSelector();
	currentElement.addEventListener("blur", parseLines);
	currentElement.addEventListener("change", parseLines);
	currentElement.style.display = "none";
	tdElement.appendChild(currentElement);
	tdElement.appendChild(makeElementWithAttributes("div", {class: "tooltiptext righttooltip"}));
	trElement.appendChild(tdElement);
	tdElement = document.createElement("td");
	currentElement = makeElementWithAttributes("div", {class: "interfaceButton closeButton"});
	currentElement.appendChild(document.createTextNode("X"));
	currentElement.addEventListener("click", removeLine);
	tdElement.appendChild(currentElement);
	currentElement = makeElementWithAttributes("div", {class: "interfaceButton insertButton"});
	currentElement.appendChild(document.createTextNode("+"));
	currentElement.addEventListener("click", insertLine);
	tdElement.appendChild(currentElement);
	trElement.appendChild(tdElement);
	return trElement;
}

/**************************************************/
// Appearance and user helpers

function moveFocus(ev) {
	if (ev.target.getElementsByClassName("fitchFormula").length > 0) {
		ev.target.getElementsByClassName("fitchFormula")[0].focus();
	} else if (ev.target.getElementsByClassName("fitchLines").length > 0) {
		ev.target.getElementsByClassName("fitchLines")[0].focus();
	}
}

function resetFormatting(ev) {
	var iIndex = getTrElement(ev.target).getAttribute("lineNumber")*1;
	if (isNaN(iIndex)) {
		iIndex = getTrElement(ev.target).getAttribute("lineNumber");
	}
	ev.target.textContent = proof[iIndex].input;
}

/**************************************************/
// Inserting and removing

function getTrElement(elem) {
	while (elem.getAttribute("lineNumber") == null) {
		elem = elem.parentNode;
	}
	return elem;
}

function insertLine(ev) {
	var trElement = getTrElement(ev.target);
	var iIndex = trElement.getAttribute("lineNumber")*1;
	addLine(proof, iIndex);
	resetLine(proof, iIndex);
	updateLineReferences(iIndex, 1);
	trElement.parentNode.insertBefore(createTrElement(iIndex), trElement);
	updateProof();
}

function removeLine(ev) {
	var iIndex = getTrElement(ev.target).getAttribute("lineNumber")*1;
	if (proof.length <= 1) {
		window.alert("Cannot remove last line of a proof.");
		return;
	}
	var trLine = getTrElement(ev.target);
	trLine.parentNode.removeChild(trLine);
	removeProofLine(proof, iIndex);
	updateLineReferences(iIndex, -1);
	updateProof();
}

function clearProof() {
	proof = getProof();
	while (document.getElementsByClassName("fitchContainer")[0].getElementsByTagName("tr").length > 1) {
		document.getElementsByClassName("fitchContainer")[0].getElementsByTagName("tr")[1].parentNode.removeChild(document.getElementsByClassName("fitchContainer")[0].getElementsByTagName("tr")[1]);
	}
}

function updateLineReferences(iIndex, diff) {
	var targets = document.getElementsByClassName("fitchContainer")[0].getElementsByTagName("tr");
	for (var i = 0; i < targets.length; ++i) {
		var curLine = targets[i].getAttribute("lineNumber")*1;
		if (curLine >= iIndex) {
			targets[i].setAttribute("lineNumber", curLine + diff);
		}
	}
	for (var i = 0; i < proof.length; ++i) {
		if (!(proof[i].rule in [ruleType.NONE, ruleType.FLAG, ruleType.ASSUMPTION, ruleType.PREMISE, ruleType.TAUT, ruleType.EQUAL_INTRODUCTION])) {
			for (var j = 0; j < proof[i].lines.length; ++j) {
				if (proof[i].lines[j].length == 2) {
					if (proof[i].lines[j][0] >= iIndex) {
						proof[i].lines[j][0] = Math.max(0, proof[i].lines[j][0] + diff);
					}
					if (proof[i].lines[j][1] >= iIndex) {
						proof[i].lines[j][1] = Math.max(0, proof[i].lines[j][1] + diff);
					}
				} else {
					if (proof[i].lines[j] >= iIndex) {
						proof[i].lines[j] = Math.max(0, proof[i].lines[j] + diff);
					}
				}
			}
		}
	}
}

function updateProof() {
	if (proof[proof.length - 1].line != null || proof[proof.length - 1].rule > 0) {
		addProofLine();
	}
	var errors = 0;
	var target = document.getElementsByClassName("fitchRule");
	var goalLineExists = false;
	for (var i = 0; i < proof.length; ++i) {
		// Recalculate line depth
		updateLineDepth(i);
		try {
			// Check correct line references
			if (typeof(proof[i].lines) != "string") {
				checkLineReferences(i);
			} else if (proof[i].lines.length > 0) {
				throw proof[i].lines;
			}
			// Check correctness of line
			checkRule(i);
			document.getElementsByClassName("fitchContainer")[0].getElementsByTagName("tr")[i+1].getElementsByClassName("fitchLines")[0].innerHTML = linesToString(proof[i].lines);
			target[i].className = "fitchRule";
			target[i].parentNode.className = "";
		} catch (err) {
			target[i].className = "fitchRule errorLine";
			target[i].parentNode.className = "tooltip";
			document.getElementsByClassName("tooltiptext")[2*i + 1].innerHTML = err;
			errors++;
		}
		if (proof[i].subproof.length == 0 && proof[i].line != null && proof[i].rule != ruleType.NONE && proof[i].rule != ruleType.PREMISE && proof[i].rule != ruleType.TAUT &&proof[i].line.equals(proof["goal"].line)) {
			goalLineExists = true;
		}
		// Update UI
		var turnstile = document.getElementsByClassName("turnstile")[i];
		document.getElementsByClassName("fitchFormula")[i].style.marginLeft = (proof[i].subproof.length*10 + 10)+"px";
		while (turnstile.firstChild) {
			turnstile.removeChild(turnstile.firstChild);
		}
		for (var j = 0; j <= proof[i].subproof.length; ++j) {
			var tmpElem = makeElementWithAttributes("div", {class:"bar"});
			tmpElem.innerHTML = "&nbsp;";
			turnstile.appendChild(tmpElem);
		}
		if (proof[i].rule == ruleType.ASSUMPTION || proof[i].rule == ruleType.FLAG) {
			tmpElem.setAttribute("class", "bar premiseLine assumptionLine");
		}
		if (proof[i].rule == ruleType.PREMISE && i < proof.length - 1 && proof[i+1].rule != ruleType.PREMISE) {
			tmpElem.setAttribute("class", "bar premiseLine");
		}
	}
	// Check whether proof is correct: no errors, goal is achieved
	if (errors < 1 && goalLineExists) {
		document.getElementById("goalBox").classList.add("proofFound");
	} else {
		document.getElementById("goalBox").classList.remove("proofFound");
	}
	try {
		// Update stored proof as trimmed proof
		// Store in localStorage
		var iIndex = document.getElementById("exerciseBox").children[0].selectedIndex;
		storedProofs[iIndex] = trimProof(proof);
		window.localStorage.setItem("storedProofs"+exerciseId, JSON.stringify(storedProofs));
	} catch(e) {
		// Localstorage error (does not exist or permission denied)
	}
}

/**************************************************/
// Parsing

function checkNumber(number, maxVal) {
	return !isNaN(number) && number >= 0 && parseInt(number) <= parseInt(maxVal);
}

function parseFormula(ev) {
	var iIndex = getTrElement(ev.target).getAttribute("lineNumber")*1;
	if (isNaN(iIndex)) {
		iIndex = "goal";
	}
	try {
		proof[iIndex].input = ev.target.textContent;
		if (proof[iIndex].input.trim() != "") {
			proof[iIndex].line = parseTerm(proof[iIndex].input);
			getVariables(proof, iIndex);
			ev.target.classList.remove("errorLine");
			ev.target.innerHTML = proof[iIndex].line.toString();
			ev.target.parentNode.classList.remove("tooltip");
		}
	} catch (err) {
		proof[iIndex].line = null;
		ev.target.classList.add("errorLine");
		if (!isNaN(iIndex)) {
			ev.target.parentNode.classList.add("tooltip");
			document.getElementsByClassName("tooltiptext")[2*iIndex].innerHTML = err;
		}
	}
	updateProof();
}

function parseRule(ev) {
	// Check for proper line references
	var iIndex = ev.target.parentNode.parentNode.getAttribute("lineNumber")*1;
	var target = document.getElementsByClassName("fitchContainer")[0].getElementsByTagName("tr")[iIndex + 1].children[2];
	proof[iIndex].rule = ev.target.parentNode.children[0].selectedIndex;
	target.children[2].style.display = "none";
	switch (proof[iIndex].rule) {
		case ruleType.FLAG:
		case ruleType.ASSUMPTION:
			target.children[2].style.display = "inline";
		case ruleType.NONE:
		case ruleType.PREMISE:
		case ruleType.TAUT:
		case ruleType.EQUAL_INTRODUCTION:
			target.children[1].style.display = "none";
			break;
		default:
			target.children[1].style.display = "inline-block";
			break;
	}
	updateProof();
}

function stringToLines(str, iIndex) {
	var lines = [];
	if (str.trim() != "") {
		lines = str.split(",");
	}
	for (var i = 0; i < lines.length; ++i) {
		if (lines[i].indexOf("-") > -1) {
			lines[i] = lines[i].split("-");
			// Must be two numbers separated by a dash
			if (lines[i].length != 2 || !checkNumber(lines[i][1], iIndex) || !checkNumber(lines[i][0], lines[i][1])) {
				throw "Invalid subproof range";
			}
			lines[i][0] = parseInt(lines[i][0]) - 1;
			lines[i][1] = parseInt(lines[i][1]) - 1;
		} else {
			// Must be a number before this line
			lines[i] =  parseInt(lines[i]) - 1;
			if (!checkNumber(lines[i], iIndex - 1)) {
				throw "Invalid line reference";
			} 
		}
	}
	return lines;
}

function parseLines(ev) {
	var iIndex = ev.target.parentNode.parentNode.getAttribute("lineNumber")*1;
	try {
		if (typeof(ev.target.value) === "undefined") {
			if (ev.target.textContent.trim() != "") {
				proof[iIndex].lines = stringToLines(ev.target.parentNode.children[1].textContent, iIndex);
			} else {
				proof[iIndex].lines = [];
			}
		} else {
			proof[iIndex].sameDepth = (ev.target.value == "0");
		}
	} catch (err) {
		proof[iIndex].lines = err;
	}
	updateProof();
}

/**************************************************/
// Exporting

function linesToString(lines) {
	strOut = "";
	for (var j = 0; j < lines.length; ++j) {
		if (lines[j].length > 0) {
			strOut += (lines[j][0] + 1) + "-" + (lines[j][1] + 1);
		} else {
			strOut += (lines[j] + 1);
		}
		if (j < lines.length - 1) {
			strOut += ", ";
		}
	}
	return strOut;
}

function createLatexProof() {
	var strOut = [];
	var maxLength = 0;
	var logicSymbols = {};
	logicSymbols[operandType.AND] = ["&", "\\land{}"];
	logicSymbols[operandType.OR] = ["|", "\\lor{}"];
	logicSymbols[operandType.NOT] = ["~", "\\lnot{}"];
	logicSymbols[operandType.ARROW] = [">", "\\to{}"];
	logicSymbols[operandType.EQUALS] = ["=", "="];
	logicSymbols[operandType.BOT] = ["#", "\\bot{}"];
	logicSymbols[operandType.IFF] = ["<", "\\leftrightarrow{}"];
	logicSymbols[operandType.FORALL] = ["@", "\\forall{}"];
	logicSymbols[operandType.EXISTS] = ["?", "\\exists{}"];
	for (var i = 0; i < proof.length - 1; ++i) {
		strOut[i] = "";
		for (var j = 0; j < proof[i].subproof.length; ++j) {
			strOut[i] += "\\fa ";
		}
		if (proof[i].rule == ruleType.ASSUMPTION || proof[i].rule == ruleType.FLAG ||
			(proof[i].rule == ruleType.PREMISE && i < proof.length - 1 && proof[i + 1].rule != ruleType.PREMISE)) {
			strOut[i] += "\\fh ";
		} else {
			strOut[i] += "\\fa ";
		}
		if (proof[i].line != null) {
			strOut[i] += proof[i].line.toString(logicSymbols);
		}
		maxLength = Math.max(maxLength, strOut[i].length);
	}
	for (var i = 0; i < strOut.length; ++i) {
		strOut[i] += " & " + ruleSelectBox[proof[i].rule][2];
		switch (proof[i].rule) {
			case ruleType.NONE:
			case ruleType.FLAG:
			case ruleType.ASSUMPTION:
			case ruleType.PREMISE:
			case ruleType.TAUT:
			case ruleType.EQUAL_INTRODUCTION:
				break;
			default:
				strOut[i] += ": " + linesToString(proof[i].lines);
				break;
		}
	}
	// Rule (lines)
	return "%\\usepackage{fitch}\n\n\\begin{fitch}\n"+strOut.join("\\\\\n")+"\n\\end{fitch}\n";
}

function createPlainTextProof() {
	var strOut = [];
	var maxLength = 0;
	var logicSymbols = {};
	logicSymbols[operandType.AND] = ["&", "&"];
	logicSymbols[operandType.OR] = ["|", "|"];
	logicSymbols[operandType.NOT] = ["~", "~"];
	logicSymbols[operandType.ARROW] = [">", "->"];
	logicSymbols[operandType.EQUALS] = ["=", "="];
	logicSymbols[operandType.BOT] = ["#", "#"];
	logicSymbols[operandType.IFF] = ["<", "<->"];
	logicSymbols[operandType.FORALL] = ["@", "@"];
	logicSymbols[operandType.EXISTS] = ["?", "?"];
	for (var i = 0; i < proof.length - 1; ++i) {
		strOut[i] = (i<10?" ":"") + (i+1) + " ";
		for (var j = 0; j < proof[i].subproof.length; ++j) {
			strOut[i] += "| ";
		}
		if (proof[i].rule == ruleType.ASSUMPTION || proof[i].rule == ruleType.FLAG ||
			(proof[i].rule == ruleType.PREMISE && i < proof.length - 1 && proof[i + 1].rule != ruleType.PREMISE)) {
			strOut[i] += "|_";
		} else {
			strOut[i] += "| ";
		}
		if (proof[i].line != null) {
			strOut[i] += proof[i].line.toString(logicSymbols);
		}
		maxLength = Math.max(maxLength, strOut[i].length);
	}
	for (var i = 0; i < strOut.length; ++i) {
		while (strOut[i].length < maxLength) {
			strOut[i] += " ";
		}
		strOut[i] += "   \t" + ruleSelectBox[proof[i].rule][0];
		switch (proof[i].rule) {
			case ruleType.NONE:
			case ruleType.FLAG:
			case ruleType.ASSUMPTION:
			case ruleType.PREMISE:
			case ruleType.TAUT:
			case ruleType.EQUAL_INTRODUCTION:
				break;
			default:
				strOut[i] += ": " + linesToString(proof[i].lines);
				break;
		}
	}
	// Rule (lines)
	return strOut.join("\n");
}

function createProofExercise(prf) {
	var strOut = "{\n";
	for (var i = 0; i < prf.length; ++i) {
		strOut += "\t"+i+":{input:\"" + prf[i].input + "\",rule:" + prf[i].rule + ",lines:" + JSON.stringify(prf[i].lines) + ",sameDepth:" + prf[i].sameDepth+"},\n";
	}
	strOut += "\tlength:" + prf.length +",\n";
	strOut += "\tname:\"" + prf.name + "\",\n";
	strOut += "\tgoal:{input:\"" + prf["goal"].input + "\",rule:" + prf["goal"].rule + ",lines:" + JSON.stringify(prf["goal"].lines) + ",sameDepth:" + prf["goal"].sameDepth+"}\n";
	return strOut +"}";
}

function exportLatexProof() {
	exportProof(createLatexProof());
}

function exportPlainProof() {
	exportProof(createPlainTextProof());
}

function exportProofExercise() {
	exportProof(createProofExercise(proof));
}

function exportProof(input) {
	newWindow = window.open();
	newElem = newWindow.document.createElement("h1");
	newWindow.document.title = document.getElementById("exerciseBox").children[0].value;
	newElem.appendChild(newWindow.document.createTextNode("Proof for "+document.getElementById("exerciseBox").children[0].value));
	newWindow.document.getElementsByTagName("body")[0].appendChild(newElem);
	newElem = newWindow.document.createElement("pre");
	newElem.appendChild(newWindow.document.createTextNode(input));
	newWindow.document.getElementsByTagName("body")[0].appendChild(newElem);
}

function initProofs() {
	storedProofs = [];
	for (var i = 0; i < exercises.length; ++i) {
		storedProofs[i] = trimProof(exercises[i]);
	}
	try {
		var localProofs = JSON.parse(window.localStorage.getItem("storedProofs"+exerciseId));
		if (localProofs != null) {
			for (var i = 0; i < localProofs.length; ++i) {
				storedProofs[i] = localProofs[i];
				storedProofs[i].name = exercises[i].name;
			}
		}
	} catch(e) {
		// Localstorage not present or access denied,
		// ignore and don't use localstorage
		// Maybe needs a display that saving doesn't work
		window.alert("Error trying to access local storage.\nWarning: changes will not be saved!");
	}
/*	if (window.location.search.length > 0) {
		var newProof = JSON.parse(decodeURIComponent(window.location.search.substr(1)));
		if (confirm("A Fitch diagram was passed on to this page. Do you wish to overwrite the --None-- proof with this diagram?\n\nWarning: this action cannot be undone.")) {
			storedProofs[0] = newProof;
		}
	}*/
}

function loadExercise(ev) {
	var iIndex = document.getElementById("exerciseBox").children[0].selectedIndex;
	loadExerciseNumber(iIndex);
}

function loadExerciseNumber(iIndex) {
	clearProof();
	if (iIndex < 0) {
		addProofLine();
		return;
	}
	proof = expandProof(storedProofs[iIndex]);
	for (var i = 0; i < proof.length; ++i) {
		trElement = createProofLine();
		trElement.getElementsByClassName("fitchFormula")[0].innerHTML = (proof[i].line != null ? proof[i].line : proof[i].input);
		trElement.getElementsByTagName("option")[proof[i].rule].selected = "selected";
		var target = document.getElementsByClassName("fitchContainer")[0].getElementsByTagName("tr")[i + 1].children[2];
		target.children[2].style.display = "none";
		switch (proof[i].rule) {
			case ruleType.FLAG:
			case ruleType.ASSUMPTION:
				target.children[2].style.display = "inline";
				target.children[2].getElementsByTagName("option")[proof[i].sameDepth?0:1].selected = "selected";
			case ruleType.NONE:
			case ruleType.PREMISE:
			case ruleType.EQUAL_INTRODUCTION:
				target.children[1].style.display = "none";
				break;
			default:
				target.children[1].style.display = "inline-block";
				target.children[1].innerHTML = linesToString(proof[i].lines);
				break;
		}
	}
	proof["goal"].line = parseTerm(proof["goal"].input);
	document.getElementById("goalLine").innerHTML = (proof["goal"].line == null ? "" : proof["goal"].line);
	updateProof();
}

function resetCurrentProof() {
	if (confirm("Are you sure you want to reset the proof for "+document.getElementById("exerciseBox").children[0].value+"? This action will delete any progress you have made and cannot be undone.")) {
		var iIndex = document.getElementById("exerciseBox").children[0].selectedIndex;
		storedProofs[iIndex] = trimProof(exercises[iIndex]);
		loadExercise();
	}
}


