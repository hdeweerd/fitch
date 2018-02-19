/*  Logic formula and parser
 *  Model script
 *  Copyright 2018 Harmen de Weerd
 */
 
operandType = {
	NONE: -1,
	ATOM: 0,
	AND: 1,
	OR: 2,
	NOT: 3,
	ARROW: 4,
	EQUALS: 5,
	BOT: 6,
	IFF: 7,
	FORALL: 8,
	EXISTS: 9
};

logicSymbols = {};
logicSymbols[operandType.AND] = ["&", "&and;"];
logicSymbols[operandType.OR] = ["|", "&or;"];
logicSymbols[operandType.NOT] = ["~", "&not;"];
logicSymbols[operandType.ARROW] = [">", "&rarr;"];
logicSymbols[operandType.EQUALS] = ["=", "="];
logicSymbols[operandType.BOT] = ["#", "&perp;"];
logicSymbols[operandType.IFF] = ["<", "&harr;"];
logicSymbols[operandType.FORALL] = ["@", "&forall;"];
logicSymbols[operandType.EXISTS] = ["?", "&exist;"];

infixOperators = "|&^>=<";
prefixOperators = "(~!@?";
quantifiers = "@?";

/**************************************************/
// Symbols

function opAtom(strLabel) {
	// Predicates, functions, and variables
	this.type = operandType.ATOM;
	this.label = strLabel;
	this.arguments = [];
	this.copy = function(dictReplace = {}) {
			var cpy = new opAtom(this.label);
			if (typeof dictReplace[this.label] != "undefined") {
				cpy.label = dictReplace[this.label];
			}
			for (var i = 0; i < this.arguments.length; ++i) {
				cpy.arguments[i] = this.arguments[i].copy(dictReplace);
			}
			return cpy;
		};
	this.equals = function(oOther, dictForceReplace = {}, dictAllowReplace = {}) {
			// Allows this to be replaced 
			if (oOther == null || this.type !== oOther.type || this.arguments.length != oOther.arguments.length) {
				return false;
			}
			if (typeof dictForceReplace[oOther.label] != "undefined") {
				if (dictForceReplace[oOther.label] != this.label) {
					return false;
				}
			} else if (this.label !== oOther.label && (dictAllowReplace[oOther.label] != this.label)) {
				return false;
			}
			for (var i = 0; i < this.arguments.length; ++i) {
				if (!this.arguments[i].equals(oOther.arguments[i], dictForceReplace, dictAllowReplace)) {
					return false;
				}				
			}
			return true;
		};
	this.getTruthValue = function(dict) {
			return dict[this.toString()];
		};
	this.getAtoms = function(dict) {
			dict[this.toString()] = false;
		};
	this.getVariables = function(dictUnbound, dictBound) {
			if (this.arguments.length > 0) {
				for (var i = 0; i < this.arguments.length; ++i) {
					this.arguments[i].getVariables(dictUnbound, dictBound);
				}
			} else {
				if (dictBound.indexOf(this.label) < 0 && dictUnbound.indexOf(this.label)) {
					dictUnbound.push(this.label);
				}
			}
		};
	this.toString = function() {
			var retVal = this.label;
			if (this.arguments.length > 0) {
				retVal += "(" + this.arguments[0];
				for (var i = 1; i < this.arguments.length; ++i) {
					retVal += ", "+this.arguments[i];
				}
				retVal += ")";
			}
			return retVal;
		};
}

function opBot() {
	opAtom.call(this, logicSymbols[operandType.BOT][1]);
	this.type = operandType.BOT;
	this.getVariables = function(dictUnbound, dictBound) {
		};
	this.getTruthValue = function(dict) {
			return false;
		};
	this.getAtoms = function(dict) {
			return;
		};
	this.toString = function(symbols = logicSymbols) {
			return symbols[operandType.BOT][1];
		};
}

function opNot(opTarget) {
	this.type = operandType.NOT;
	this.target = opTarget;
	this.copy = function(dictReplace = {}) {
			return new opNot(this.target.copy(dictReplace));
		};
	this.equals = function(oOther, dictForceReplace = {}, dictAllowReplace = {}) {
			if (oOther == null || this.type !== oOther.type || !this.target.equals(oOther.target, dictForceReplace, dictAllowReplace)) {
				return false;
			}
			return true;
		};
	this.getVariables = function(dictUnbound, dictBound) {
			this.target.getVariables(dictUnbound, dictBound);
		};
	this.getTruthValue = function(dict) {
			return !this.target.getTruthValue(dict);
		};
	this.getAtoms = function(dict) {
			this.target.getAtoms(dict);
		};
	this.toString = function(symbols = logicSymbols) {
			return symbols[this.type][1] +  this.target.toString(symbols);
		};
}

function opBinary(opRight, opLeft, iType) {
	//Note: Left and right are switched!
	this.type = iType;
	this.left = opLeft;
	this.right = opRight;
	this.equals = function(oOther, dictForceReplace = {}, dictAllowReplace = {}) {
			if (oOther == null || this.type !== oOther.type || !this.left.equals(oOther.left, dictForceReplace, dictAllowReplace) || !this.right.equals(oOther.right, dictForceReplace, dictAllowReplace)) {
				return false;
			}
			return true;
		};
	this.getTruthValue = function(dict) {
			return this.left.getTruthValue(dict) || this.right.getTruthValue(dict);
		};
	this.getAtoms = function(dict) {
			this.left.getAtoms(dict);
			this.right.getAtoms(dict);
		};
	this.getVariables = function(dictUnbound, dictBound) {
			this.left.getVariables(dictUnbound, dictBound);
			this.right.getVariables(dictUnbound, dictBound);
		};
	this.toString = function(symbols = logicSymbols) {
			return "(" + this.left.toString(symbols) + " " + symbols[this.type][1] + " " + this.right.toString(symbols) + ")";
		};
}

function opAnd(opLeft, opRight) {
	opBinary.call(this, opLeft, opRight, operandType.AND);
	this.copy = function(dictReplace = {}) {
			return new opAnd(this.right.copy(dictReplace), this.left.copy(dictReplace));
		};
	this.getTruthValue = function(dict) {
			return this.left.getTruthValue(dict) && this.right.getTruthValue(dict);
		};
}

function opOr(opLeft, opRight) {
	opBinary.call(this, opLeft, opRight, operandType.OR);
	this.copy = function(dictReplace = {}) {
			return new opOr(this.right.copy(dictReplace), this.left.copy(dictReplace));
		};
	this.getTruthValue = function(dict) {
			return this.left.getTruthValue(dict) || this.right.getTruthValue(dict);
		};
}

function opArrow(opLeft, opRight) {
	opBinary.call(this, opLeft, opRight, operandType.ARROW);
	this.copy = function(dictReplace = {}) {
			return new opArrow(this.right.copy(dictReplace), this.left.copy(dictReplace));
		};
	this.getTruthValue = function(dict) {
			return !this.left.getTruthValue(dict) || this.right.getTruthValue(dict);
		};
}

function opBiconditional(opLeft, opRight) {
	opBinary.call(this, opLeft, opRight, operandType.IFF);
	this.copy = function(dictReplace = {}) {
			return new opBiconditional(this.right.copy(dictReplace), this.left.copy(dictReplace));
		};
	this.getTruthValue = function(dict) {
			return (this.left.getTruthValue(dict) == this.right.getTruthValue(dict));
		};
}

function opEquality(opLeft, opRight) {
	opBinary.call(this, opLeft, opRight, operandType.EQUALS);
	this.copy = function(dictReplace = {}) {
			return new opEquality(this.right.copy(dictReplace), this.left.copy(dictReplace));
		};
	this.getTruthValue = function(dict) {
			return (this.left.getTruthValue(dict) == this.right.getTruthValue(dict));
		};
}

function opForAll(opSentence, opQuantifier) {
	opBinary.call(this, opSentence, opQuantifier, operandType.FORALL);
	this.copy = function(dictReplace = {}) {
			return new opForAll(this.right.copy(dictReplace), this.left.copy(dictReplace));
		};
	this.getTruthValue = function(dict) {
			return (this.left.getTruthValue(dict) == this.right.getTruthValue(dict));
		};
	this.getVariables = function(dictUnbound, dictBound) {
			if (dictBound.indexOf(this.left.label) >= 0) {
				throw "Variable '"+this.left.label+"' is already bound.";
			}
			dictBound.push(this.left.label);
			this.left.getVariables(dictUnbound, dictBound);
			this.right.getVariables(dictUnbound, dictBound);
			dictBound.splice(dictBound.indexOf(this.left.label));
		};
	this.toString = function(symbols = logicSymbols) {
			return "(" + symbols[this.type][1] + this.left.toString(symbols) + " " + this.right.toString(symbols) + ")";
		};
}

function opExists(opSentence, opQuantifier) {
	opBinary.call(this, opSentence, opQuantifier, operandType.EXISTS);
	this.copy = function(dictReplace = {}) {
			return new opExists(this.right.copy(dictReplace), this.left.copy(dictReplace));
		};
	this.getTruthValue = function(dict) {
			return (this.left.getTruthValue(dict) == this.right.getTruthValue(dict));
		};
	this.getVariables = function(dictUnbound, dictBound) {
			if (dictBound.indexOf(this.left.label) >= 0) {
				throw "Variable '"+this.left.label+"' is already bound.";
			}
			dictBound.push(this.left.label);
			this.left.getVariables(dictUnbound, dictBound);
			this.right.getVariables(dictUnbound, dictBound);
			dictBound.splice(dictBound.indexOf(this.left.label));
		};
	this.toString = function(symbols = logicSymbols) {
			return "(" + symbols[this.type][1] + this.left.toString(symbols) + " " + this.right.toString(symbols) + ")";
		};
}

/**************************************************/
// Parser

function collapseTerms(stack) {
	//Backtrack and collapse operators until opening bracket is found
	var operator;
	while (stack.operators.length > 0 && stack.operators[stack.operators.length - 1] != "(") {
		operator = stack.operators.pop();
		switch (operator) {
			case "~":
			case "!":
				stack.operands.push(new opNot(stack.operands.pop()));
				break;
			case "|":
				stack.operands.push(new opOr(stack.operands.pop(), stack.operands.pop()));
				break;
			case "^":
			case "&":
				stack.operands.push(new opAnd(stack.operands.pop(), stack.operands.pop()));
				break;
			case "<":
				stack.operands.push(new opBiconditional(stack.operands.pop(), stack.operands.pop()));
				break;
			case ">":
				stack.operands.push(new opArrow(stack.operands.pop(), stack.operands.pop()));
				break;
			case "=":
				stack.operands.push(new opEquality(stack.operands.pop(), stack.operands.pop()));
				break;
			case "@":
				stack.operands.push(new opForAll(stack.operands.pop(), stack.operands.pop()));
				break;
			case "?":
				stack.operands.push(new opExists(stack.operands.pop(), stack.operands.pop()));
				break;
		}
	}
}

function readTerm(stack, allowFunctions = true) {
	// Read a single predicate, function, or variable
	var pos = 0;
	while (pos < stack.input.length && "abcdefghijklmnopqrstuvwxyz0123456789_".indexOf(stack.input.charAt(pos).toLowerCase()) > -1) {
		pos++;
	}
	stack.operands.push(new opAtom(stack.input.substr(0,pos)));
	stack.input = stack.input.substr(pos).trim();
	if (allowFunctions && stack.input.charAt(0) == "(") {
		stack.input = stack.input.substr(1).trim();
		while (stack.input.length > 0 && stack.input.charAt(0) != ")") {
			if (stack.input.charAt(0).toUpperCase() != stack.input.charAt(0).toLowerCase()) {
				readTerm(stack);
				stack.operands[stack.operands.length - 2].arguments.push(stack.operands.pop());
			} else {
				throw "Unexpected symbol at '"+stack.input+"'";
			}
			if (stack.input.charAt(0) == ",") {
				stack.input = stack.input.substr(1).trim();
			}
		}
		stack.input = stack.input.substr(1).trim();
	}
}

function parseTerm(strInput) {
	// Term = atom | (Term) | ~Term | !Term | Term|Term | Term&Term | Term=Term | Term>Term | Term<Term | @var Term | ?var Term
	if (strInput.trim() == "") {
		return null;
	}
	var stack = {
		input: strInput.trim(),
		expectTerm: 1,
		operators: [],
		operands: []
	};
	while (stack.input.length > 0) {
		// Check connectives
		if (stack.expectTerm == 0) {
			if (infixOperators.indexOf(stack.input.charAt(0)) > -1) {
				// Infix operators
				stack.operators.push(stack.input.charAt(0));
				stack.expectTerm = 1;
			} else if (stack.input.charAt(0) === ")") {
				// Collapse
				collapseTerms(stack);
				if (stack.operators.length > 0 && stack.operators[stack.operators.length - 1] === "(") {
					// Pop closing bracket, and continue collapsing
					stack.operators.pop();
					collapseTerms(stack);
				} else {
					throw "Closing bracket found without corresponding opening bracket";
				}
			} else {
				throw "Unexpected symbol at '"+stack.input+"'";
			}
			stack.input = stack.input.substr(1);
		} else {
			if (stack.expectTerm == 1 && prefixOperators.indexOf(stack.input.charAt(0)) > -1) {
				// "Prefix" operators
				if (quantifiers.indexOf(stack.input.charAt(0)) > -1) {
					stack.expectTerm = 2;
				}
				stack.operators.push(stack.input.charAt(0));
				stack.input = stack.input.substr(1);
			} else if (stack.input.charAt(0).toUpperCase() !== stack.input.charAt(0).toLowerCase()) {
				// Letters
				readTerm(stack, stack.expectTerm == 1);
				stack.expectTerm--;
			} else if (stack.input.charAt(0) === "#") {
				// falsum/bot
				stack.operands.push(new opBot());
				stack.input = stack.input.substr(1);
				stack.expectTerm--;
			} else {
				throw "Expected operand but found '"+stack.input+"'"
			}
			if (stack.expectTerm == 0) {
				// Terms have been gathered, collapse operator
				collapseTerms(stack);
			}
		}
		// Remove whitespace
		stack.input = stack.input.trim();
	}
	if (stack.operators.length > 0) {
		throw "Unexpected end of formula while parsing " + stack.operators[stack.operators.length - 1];
	}
	return stack.operands[0];
}

