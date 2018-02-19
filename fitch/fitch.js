/*  Fitch proof helper
 *  Model script
 *  Copyright 2018 Harmen de Weerd
 */

/**************************************************/
// Rules

ruleType = {
	NONE: 0,
	PREMISE: 1,
	ASSUMPTION: 2,
	FLAG: 3,
	TAUT: 4,
	REIT: 5,
	EQUAL_INTRODUCTION: 6,
	EQUAL_ELIMINATION: 7,
	AND_INTRODUCTION: 8,
	AND_ELIMINATION: 9,
	OR_INTRODUCTION: 10,
	OR_ELIMINATION: 11,
	NOT_INTRODUCTION: 12,
	NOT_ELIMINATION: 13,
	BOT_INTRODUCTION: 14,
	BOT_ELIMINATION: 15,
	CONDITIONAL_INTRODUCTION: 16,
	CONDITIONAL_ELIMINATION: 17,
	BICONDITIONAL_INTRODUCTION: 18,
	BICONDITIONAL_ELIMINATION: 19,
	FORALL_INTRODUCTION: 20,
	FORALL_ELIMINATION: 21,
	EXISTS_INTRODUCTION: 22,
	EXISTS_ELIMINATION: 23
};

tautologyLimit = 1000;

function checkRule(iIndex) {
	var target = document.getElementsByTagName("tr")[iIndex + 1].children[1];
	switch (proof[iIndex].rule) {
		case ruleType.PREMISE:
			for (var i = 0; i < iIndex; ++i) {
				if (proof[i].rule != ruleType.PREMISE) {
					throw "Premises may only appear at the top of the proof."
				}
			}
			break;
		case ruleType.FLAG:
			checkFlag(iIndex);
			break;
		case ruleType.TAUT:
			checkTautology(iIndex);
			break;
		case ruleType.REIT:
			ruleReiterate(iIndex);
			break;
		case ruleType.EQUAL_INTRODUCTION:
			ruleEqualIntroduction(iIndex);
			break;
		case ruleType.EQUAL_ELIMINATION:
			ruleEqualElimination(iIndex);
			break;
		case ruleType.AND_INTRODUCTION:
			ruleAndIntroduction(iIndex);
			break;
		case ruleType.AND_ELIMINATION:
			ruleAndElimination(iIndex);
			break;
		case ruleType.OR_INTRODUCTION:
			ruleOrIntroduction(iIndex);
			break;
		case ruleType.OR_ELIMINATION:
			ruleOrElimination(iIndex);
			break;
		case ruleType.NOT_INTRODUCTION:
			ruleNotIntroduction(iIndex);
			break;
		case ruleType.NOT_ELIMINATION:
			ruleNotElimination(iIndex);
			break;
		case ruleType.BOT_INTRODUCTION:
			ruleBotIntroduction(iIndex);
			break;
		case ruleType.BOT_ELIMINATION:
			ruleBotElimination(iIndex);
			break;
		case ruleType.CONDITIONAL_INTRODUCTION:
			ruleArrowIntroduction(iIndex);
			break;
		case ruleType.CONDITIONAL_ELIMINATION:
			ruleArrowElimination(iIndex);
			break;
		case ruleType.BICONDITIONAL_INTRODUCTION:
			ruleBiconditionalIntroduction(iIndex);
			break;
		case ruleType.BICONDITIONAL_ELIMINATION:
			ruleBiconditionalElimination(iIndex);
			break;
		case ruleType.FORALL_INTRODUCTION:
			ruleForallIntroduction(iIndex);
			break;
		case ruleType.FORALL_ELIMINATION:
			ruleForallElimination(iIndex);
			break;
		case ruleType.EXISTS_INTRODUCTION:
			ruleExistsIntroduction(iIndex);
			break;
		case ruleType.EXISTS_ELIMINATION:
			ruleExistsElimination(iIndex);
			break;
	}
}

function ruleEqualIntroduction(conclusionRule) {
	if (proof[conclusionRule].line.type != operandType.EQUALS) {
		throw "= Introduction must result in an equality.";
	}
	if (!proof[conclusionRule].line.left.equals(proof[conclusionRule].line.right)) {
		throw "Invalid = Introduction";
	}
	return true;
}

function ruleEqualElimination(conclusionRule) {
	if (proof[conclusionRule].lines.length != 2 || proof[conclusionRule].lines[0].length > 0 || proof[conclusionRule].lines[1].length > 0) {
		throw "= Elimination must refer to exactly two lines in the proof.";
	}
	var refRule = proof[conclusionRule].lines[0];
	var identityRule = proof[conclusionRule].lines[1];
	if (proof[identityRule].line.type != operandType.EQUALS || proof[identityRule].line.left.type != operandType.ATOM || proof[identityRule].line.right.type != operandType.ATOM) {
		throw "Second referent of = Elimination must be an equality between two atoms.";
	}
	var dictAllowReplace = {};
	dictAllowReplace[proof[identityRule].line.left.label] = proof[identityRule].line.right.label;
	if (!proof[conclusionRule].line.equals(proof[refRule].line, {}, dictAllowReplace)) {
		throw "Invalid = Elimination";
	}
	return true;
}

function ruleAndIntroduction(conclusionRule) {
	if (proof[conclusionRule].lines.length != 2 || proof[conclusionRule].lines[0].length > 0 || proof[conclusionRule].lines[1].length > 0) {
		throw "&and; Introduction must refer to exactly two lines in the proof.";
	}
	if (proof[conclusionRule].line.type != operandType.AND) {
		throw "&and; Elimination must conclude with a conjunction"
	}
	if (!proof[conclusionRule].line.left.equals(proof[proof[conclusionRule].lines[0]].line)) {
		throw "Left part of conclusion does not match first referent"
	}
	if (!proof[conclusionRule].line.right.equals(proof[proof[conclusionRule].lines[1]].line)) {
		throw "Right part of conclusion does not match second referent"
	}
	return true;
}

function ruleAndElimination(conclusionRule) {
	if (proof[conclusionRule].lines.length != 1 || proof[conclusionRule].lines[0].length > 0) {
		throw "&and; Elimination must refer to exactly one line in the proof.";
	}
	if (proof[proof[conclusionRule].lines[0]].line.type != operandType.AND) {
		throw "&and; Elimination can only be applied to a conjunction."
	} else if (!(proof[proof[conclusionRule].lines[0]].line.left.equals(proof[conclusionRule].line) || proof[proof[conclusionRule].lines[0]].line.right.equals(proof[conclusionRule].line))) {
		throw "Conclusion is not one of the conjuncts	."
	}
	return true;
}

function ruleOrIntroduction(conclusionRule) {
	if (proof[conclusionRule].lines.length != 1 || proof[conclusionRule].lines[0].length > 0) {
		throw "&or; Introduction must refer to exactly one line in the proof.";
	}
	if (proof[conclusionRule].line.type != operandType.OR) {
		throw "&or; Introduction must result in a disjunction."
	} else if (!proof[conclusionRule].line.left.equals(proof[proof[conclusionRule].lines[0]].line) && !proof[conclusionRule].line.right.equals(proof[proof[conclusionRule].lines[0]].line)) {
		throw "Referent must appear in the conclusion."
	}
	return true;
}

function ruleOrElimination(conclusionRule) {
	if (proof[conclusionRule].lines.length != 3) {
		throw "&or; Elimination must refer to a disjunction and two subproofs.";
	}
	if (proof[conclusionRule].lines[0].length > 0 || proof[proof[conclusionRule].lines[0]].line.type != operandType.OR) {
		throw "First refent of &or; Elimination must be a disjunction.";
	}
	if (proof[conclusionRule].lines[1].length != 2 || !proof[proof[conclusionRule].lines[0]].line.left.equals(proof[proof[conclusionRule].lines[1][0]].line)) {
		throw "Assumption of first subproof does not match first operand of the disjunction.";
	}
	if (proof[conclusionRule].lines[2].length != 2 || !proof[proof[conclusionRule].lines[0]].line.right.equals(proof[proof[conclusionRule].lines[2][0]].line)) {
		throw "Assumption of second subproof does not match second operand of the disjunction.";
	}
	if (!proof[conclusionRule].line.equals(proof[proof[conclusionRule].lines[1][1]].line) ||
		!proof[conclusionRule].line.equals(proof[proof[conclusionRule].lines[2][1]].line)) {
		throw "Conclusion does not match subproof conclusions.";
	}
	return true;
}

function ruleNotIntroduction(conclusionRule) {
	if (proof[conclusionRule].lines.length != 1 || proof[conclusionRule].lines[0].length != 2) {
		throw "&not; Introduction must refer to exactly one subproof.";
	}
	if (!(proof[proof[conclusionRule].lines[0][1]].line instanceof opBot)) {
		throw "Subproof conclusion must be " + logicSymbols[operandType.BOT][1] + "."
	} else if (proof[conclusionRule].line.type != operandType.NOT) {
		throw "&not; Introduction must conclude a negation."
	} else if (!proof[conclusionRule].line.target.equals(proof[proof[conclusionRule].lines[0][0]].line)) {
		throw "&not; Introduction must conclude by negating the assumption of the subproof."
	}
	return true;
}

function ruleNotElimination(conclusionRule) {
	if (proof[conclusionRule].lines.length != 1 || proof[conclusionRule].lines[0].length > 0) {
		throw "&not; Elimination must refer to exactly one line in the proof.";
	}
	var premiseRule = Math.floor(proof[conclusionRule].lines[0] * 1) - 1;
	if (proof[proof[conclusionRule].lines[0]].line.type != operandType.NOT || 
		proof[proof[conclusionRule].lines[0]].line.target.type != operandType.NOT) {
		throw "&not; Elimination must refer to a line that starts with a double negation."
	} else if (!proof[proof[conclusionRule].lines[0]].line.target.target.equals(proof[conclusionRule].line)) {
		throw "Invalid conclusion."
	}
	return true;
}

function ruleBotIntroduction(conclusionRule) {
	if (proof[conclusionRule].lines.length != 2 || proof[conclusionRule].lines[0].length > 0 || proof[conclusionRule].lines[1].length > 0) {
		throw "&perp; Introduction must refer to exactly two lines in the proof.";
	}
	if (!(proof[conclusionRule].line instanceof opBot)) {
		throw "&perp; Introduction must have &perp; as a conclusion.";
	}
	if (proof[proof[conclusionRule].lines[0]].line.type == operandType.NOT &&
		proof[proof[conclusionRule].lines[0]].line.target.equals(proof[proof[conclusionRule].lines[1]].line)) {
		return true;
	}
	if (proof[proof[conclusionRule].lines[1]].line.type == operandType.NOT &&
		proof[proof[conclusionRule].lines[1]].line.target.equals(proof[proof[conclusionRule].lines[0]].line)) {
		return true;
	}
	throw "&perp; Introduction must refer to a line and it negation."
}

function ruleBotElimination(conclusionRule) {
	if (proof[conclusionRule].lines.length != 1 || proof[conclusionRule].lines[0].length > 0) {
		throw "&perp; Elimination must refer to exactly one line in the proof.";
	}
	if (!(proof[proof[conclusionRule].lines[0]].line instanceof opBot)) {
		throw "&perp; Elimination must refer to &perp;.";
	}
	return true;
}

function ruleArrowIntroduction(conclusionRule) {
	if (proof[conclusionRule].lines.length != 1 || proof[conclusionRule].lines[0].length != 2) {
		throw "&rarr; Introduction must refer to exactly one subproof.";
	}
	if (proof[conclusionRule].line.type != operandType.ARROW) {
		throw "&rarr; Introduction must conclude in a conditional.";
	}
	if (!proof[conclusionRule].line.left.equals(proof[proof[conclusionRule].lines[0][0]].line)) {
		throw "Antecedent of conclusion must be the assumption of the subproof.";
	}
	if (!proof[conclusionRule].line.right.equals(proof[proof[conclusionRule].lines[0][1]].line)) {
		throw "Consequent of conclusion must be the conclusion of the subproof.";
	}
	return true;
}

function ruleArrowElimination(conclusionRule) {
	if (proof[conclusionRule].lines.length != 2 || proof[conclusionRule].lines[0].length > 0 || proof[conclusionRule].lines[1].length > 0) {
		throw "&rarr; Elimination must refer to exactly two lines in the proof.";
	}
	var conditionalRule = 0;
	if (proof[proof[conclusionRule].lines[0]].line.type != operandType.ARROW) {
		conditionalRule = 1;
	}
	var atomRule = 1 - conditionalRule;
	if (proof[proof[conclusionRule].lines[conditionalRule]].line.type != operandType.ARROW) {
		throw "&rarr; Elimination must refer to a conditional.";
	}
	if (!proof[proof[conclusionRule].lines[atomRule]].line.equals(proof[proof[conclusionRule].lines[conditionalRule]].line.left)) {
		throw "Line "+(proof[conclusionRule].lines[atomRule]+1)+" does not match antecedent of line "+(conditionalRule+1)+".";
	}
	if (!proof[conclusionRule].line.equals(proof[proof[conclusionRule].lines[conditionalRule]].line.right)) {
		throw "Conclusion does not match the consequent of line "+(proof[conclusionRule].lines[conditionalRule]+1)+".";
	}
	return true;
}

function ruleBiconditionalIntroduction(conclusionRule) {
	if (proof[conclusionRule].lines.length != 2 || proof[conclusionRule].lines[0].length != 2 || proof[conclusionRule].lines[1].length != 2) {
		throw "&harr; Introduction must refer to exactly two subproofs.";
	}
	if (proof[conclusionRule].line.type != operandType.IFF) {
		throw "&harr; Introduction must conclude in a biconditional.";
	}
	var forwardLine = 0;
	if (!proof[conclusionRule].line.left.equals(proof[proof[conclusionRule].lines[0][0]].line)) {
		forwardLine = 1;
	}
	if (!proof[conclusionRule].line.left.equals(proof[proof[conclusionRule].lines[forwardLine][0]].line) ||
		!proof[conclusionRule].line.right.equals(proof[proof[conclusionRule].lines[forwardLine][1]].line)) {
		throw "No subproof for antecedent &rarr; consequent.";
	}
	if (!proof[conclusionRule].line.right.equals(proof[proof[conclusionRule].lines[1 - forwardLine][0]].line) ||
		!proof[conclusionRule].line.left.equals(proof[proof[conclusionRule].lines[1 - forwardLine][1]].line)) {
		throw "No subproof for antecedent &larr; consequent.";
	}
	return true;
}

function ruleBiconditionalElimination(conclusionRule) {
	if (proof[conclusionRule].lines.length != 2 || proof[conclusionRule].lines[0].length > 0 || proof[conclusionRule].lines[1].length > 0) {
		throw "&harr; Elimination must refer to exactly two lines in the proof.";
	}
	var conditionalRule = 0;
	if (proof[proof[conclusionRule].lines[0]].line.type != operandType.IFF) {
		conditionalRule = 1;
	}
	var atomRule = 1 - conditionalRule;
	if (proof[proof[conclusionRule].lines[conditionalRule]].line.type != operandType.IFF) {
		throw "&harr; Elimination must refer to a biconditional.";
	}
	if (proof[proof[conclusionRule].lines[atomRule]].line.equals(proof[proof[conclusionRule].lines[conditionalRule]].line.left)) {
		if (!proof[conclusionRule].line.equals(proof[proof[conclusionRule].lines[conditionalRule]].line.right)) {
			throw "Invalid inference.";
		}
	} else if (!proof[proof[conclusionRule].lines[atomRule]].line.equals(proof[proof[conclusionRule].lines[conditionalRule]].line.right)) {
		throw "Line "+(proof[conclusionRule].lines[atomRule]+1)+" does not match antecedent or consequent of line "+(conditionalRule+1)+".";
	} else if (!proof[conclusionRule].line.equals(proof[proof[conclusionRule].lines[conditionalRule]].line.left)) {
		throw "Invalid conclusion.";
	}
	return true;
}

function ruleForallIntroduction(conclusionRule) {
	if (proof[conclusionRule].lines.length != 1 || proof[conclusionRule].lines[0].length != 2) {
		throw "&forall; Introduction must refer to exactly one subproof.";
	}
	if (proof[proof[conclusionRule].lines[0][0]].rule != ruleType.FLAG) {
		throw "&forall; Introduction must refer to a subproof starting with a flag.";
	}
	if (proof[conclusionRule].line.type != operandType.FORALL) {
		throw "&forall; Introduction must conclude in a universal quantifier.";
	}
	
	var dictReplace = {};
	dictReplace[proof[proof[conclusionRule].lines[0][0]].line.label] = proof[conclusionRule].line.left;
	if (!proof[conclusionRule].line.right.equals(proof[proof[conclusionRule].lines[0][1]].line, dictReplace)) {
		// Conclusion must replace all occurences of the flagged constant with a variable
		throw "Conclusion must replace all occurrences of constant '"+proof[proof[conclusionRule].lines[0][0]].line.label+"' with variable '"+proof[conclusionRule].line.left+"'.";
	}
}

function ruleForallElimination(conclusionRule) {
	if (proof[conclusionRule].lines.length != 1 || proof[conclusionRule].lines[0].length > 0) {
		throw "&forall; Elimination must refer to exactly one line in the proof.";
	}
	if (proof[proof[conclusionRule].lines[0]].line.type != operandType.FORALL) {
		throw "&forall; Elimination must refer to a universal quantifier line.";
	}
	var foundMatch = "$";
	for (var i = 0; i < proof[conclusionRule].unboundVariables.length; ++i) {
		// The conclusion must replace all occurences of the variable with a constant
		var dictReplace = {};
		dictReplace[proof[proof[conclusionRule].lines[0]].line.left] = proof[conclusionRule].unboundVariables[i];
		if (proof[conclusionRule].line.equals(proof[proof[conclusionRule].lines[0]].line.right, dictReplace)) {
			foundMatch = proof[conclusionRule].unboundVariables[i];
			break;
		}
	}
	if (foundMatch === "$") {
		throw "Conclusion does not replace all occurences of variable '"+proof[proof[conclusionRule].lines[0]].line.left+"' with a single constant.";
	}
	// Match must be existing constant
	for (var i = 0; i < conclusionRule; ++i) {
		if (hasHigherLevel(proof[conclusionRule].subproof, proof[i].subproof) && proof[i].unboundVariables.indexOf(foundMatch) >= 0) {
			return true;
		}
	}
	throw "&forall; Elimination may not introduce new constants.";
}

function ruleExistsIntroduction(conclusionRule) {
	if (proof[conclusionRule].lines.length != 1 || proof[conclusionRule].lines[0].length > 0) {
		throw "&exist; Introduction must refer to exactly one line in the proof.";
	}
	if (proof[conclusionRule].line.type != operandType.EXISTS) {
		throw "&exist; Introduction must conclude an existential quantifier.";
	}
	if (proof[proof[conclusionRule].lines[0]].unboundVariables.indexOf(proof[conclusionRule].line.left.label) >= 0) {
		throw "Variable '"+proof[conclusionRule].line.left.label+"' already exists as a constant in referred line.";
	}
	var foundMatch = false;
	for (var i = 0; i < proof[proof[conclusionRule].lines[0]].unboundVariables.length; ++i) {
		// The referent must be a replacement of all variables with a single constant
		var dictReplace = {};
		dictReplace[proof[conclusionRule].line.left] = proof[proof[conclusionRule].lines[0]].unboundVariables[i];
		if (proof[proof[conclusionRule].lines[0]].line.equals(proof[conclusionRule].line.right, dictReplace)) {
			foundMatch = true;
			break;
		}
	}
	if (!foundMatch && !proof[conclusionRule].line.right.equals(proof[proof[conclusionRule].lines[0]].line)) {
		throw "Conclusion does not match referred line by replacing some variable by '"+proof[conclusionRule].line.left+"'.";
	}
	
}

function ruleExistsElimination(conclusionRule) {
	if (proof[conclusionRule].lines.length != 1 || proof[conclusionRule].lines[0].length > 0) {
		throw "&exist; Elimination must refer to exactly one line in the proof.";
	}
	if (proof[proof[conclusionRule].lines[0]].line.type != operandType.EXISTS) {
		throw "&exist; Elimination must refer to an existential quantifier.";
	}
	var foundMatch = "$";
	for (var i = 0; i < proof[conclusionRule].unboundVariables.length; ++i) {
		// The conclusion must replace all occurences of the bound variable with a constant
		var dictReplace = {};
		dictReplace[proof[proof[conclusionRule].lines[0]].line.left.label] = proof[conclusionRule].unboundVariables[i];
		if (proof[conclusionRule].line.equals(proof[proof[conclusionRule].lines[0]].line.right, dictReplace)) {
			foundMatch = proof[conclusionRule].unboundVariables[i];
			break;
		}
	}
	if (foundMatch == "$") {
		throw "Conclusion does not replace all occurences of '"+proof[proof[conclusionRule].lines[0]].line.left+"' with a single variable.";
	}
	for (var i = 0; i < conclusionRule; ++i) {
		// Must use a new variable
		if (hasHigherLevel(proof[conclusionRule].subproof, proof[i].subproof)) {
			if (proof[i].unboundVariables.indexOf(foundMatch) >= 0) {
				throw "Variable '"+foundMatch+"' already introduced in line "+(i+1)+".";
			}
		}
	}
	return true;
}

function ruleReiterate(conclusionRule) {
	if (proof[conclusionRule].lines.length != 1 || proof[conclusionRule].lines[0].length > 0) {
		throw "Reiteration must refer to exactly one line in the proof.";
	}
	if (!proof[conclusionRule].line.equals(proof[proof[conclusionRule].lines[0]].line)) {
		throw "Reiteration does not repeat line "+(proof[conclusionRule].lines[0] + 1)+".";
	}
	return true;
}

function checkFlag(conclusionRule) {
	if (!(proof[conclusionRule].line instanceof opAtom) || proof[conclusionRule].line.arguments.length > 0) {
		throw "Flags can only introduce a single variable."
	}
	for (var i = 0; i < conclusionRule; ++i) {
		if (proof[i].unboundVariables.indexOf(proof[conclusionRule].line.label) >= 0) {
			throw "Introduced variable '"+proof[conclusionRule].line.label+"' already appears in line "+(i+1)+".";
		}
	}
	return true;
}

function checkTautology(conclusionRule) {
	var retVal = false;
	try {
		retVal = processSatisfiability([new opNot(proof[conclusionRule].line)], [], [], proof[conclusionRule].unboundVariables.slice(0), [], 0);
	} catch (err) {
		// Failed to evaluate tautology, assume it hold.
		console.log(err);
	}
	if (retVal !== false) {
		if (retVal.length == 0) {
			throw "Does not hold for the empty world.";
		} else {
			throw "Does not hold for "+retVal.toString()+".";
		}
	}
	return true;
}

/**************************************************/
// Proof manipulation

function getProof() {
	var proof = {length: 0};
	resetLine(proof, "goal");
	return proof;
}

function removeProofLine(proof, iIndex) {
	for (var i = iIndex + 1; i < proof.length; ++i) {
		proof[i-1] = proof[i];
	}
	delete proof[proof.length - 1];
	proof.length--;	
}

function addLine(proof, iIndex) {
	for (var i = proof.length; i > iIndex; --i) {
		proof[i] = proof[i-1];
	}
	resetLine(proof, iIndex);
	proof.length++;
}

function resetLine(proof, iIndex) {
	proof[iIndex] = {
		line: null,
		subproof: [],
		unboundVariables: [],
		boundVariables: [],
		input: "",
		rule: 0,
		lines: "",
		sameDepth: true
	}
	if (!isNaN(iIndex) && iIndex >= proof.length) {
		proof.length = iIndex + 1;
	}
}

function trimProof(proof) {
	var newProof = {length: proof.length, name: proof.name};
	var i;
	for (i = 0; i < proof.length; ++i) {
		newProof[i] = {input: proof[i].input, rule: proof[i].rule, lines: proof[i].lines, sameDepth: proof[i].sameDepth};
	}
	i = "goal";
	newProof[i] = {input: proof[i].input, rule: proof[i].rule, lines: proof[i].lines, sameDepth: proof[i].sameDepth};
	return newProof;
}

function expandProof(proof) {
	var newProof = trimProof(proof);
	for (var i = 0; i < newProof.length; ++i) {
		try {
			newProof[i].line = parseTerm(newProof[i].input);
			getVariables(newProof, i);
		} catch(e) {
			// Error parsing formula
		}
	}
	try {
		newProof["goal"].line = parseTerm(newProof["goal"].input);
	} catch(e) {
		// Error parsing formula
	}
	return newProof;
}

function getVariables(proof, iIndex) {
	proof[iIndex].unboundVariables = [];
	proof[iIndex].boundVariables = [];
	proof[iIndex].line.getVariables(proof[iIndex].unboundVariables, proof[iIndex].boundVariables);
}

/**************************************************/
// Updating

function hasHigherLevel(referringProof, referredProof) {
	// Can only refer to lines in the same or lower depth
	if (referredProof.length > referringProof.length) {
		return false;
	}
	for (var i = 0; i < referredProof.length; ++i) {
		if (referringProof[i] != referredProof[i]) {
			return false;
		}
	}
	return true;
}

function updateLineDepth(i) {
	var subproof = (i == 0 ? [] : proof[i - 1].subproof.slice(0));
	switch (proof[i].rule) {
		case ruleType.FLAG:
		case ruleType.ASSUMPTION:
			if (proof[i].sameDepth) {
				subproof.pop();
			}
			subproof.push(i);
			break;
		case ruleType.CONDITIONAL_INTRODUCTION:
		case ruleType.BICONDITIONAL_INTRODUCTION:
		case ruleType.OR_ELIMINATION:
		case ruleType.NOT_INTRODUCTION:
		case ruleType.FORALL_INTRODUCTION:
			for (var j = 0; j < proof[i].lines.length; ++j) {
				if (proof[i].lines[j].length == 2 &&
					proof[proof[i].lines[j][1]].subproof.length == subproof.length &&
					hasHigherLevel(proof[proof[i].lines[j][1]].subproof, subproof.slice(0,-1))) {
					// By closing the current subproof, the reference to a (possible different) subproof becomes valid
					subproof.pop();
					break;
				}
			}
	}
	proof[i].subproof = subproof.slice(0);
}

function checkLineReferences(iProofLine) {
	// Check whether only valid lines are referenced
	// Valid lines are those that appear in (sub)proofs encapsulating this line
	if (proof[iProofLine].rule != ruleType.ASSUMPTION) {
		for (var i = 0; i < proof[iProofLine].lines.length; ++i) {
			if (proof[iProofLine].lines[i].length == 2) {
				// First number must be an assumption
				if (proof[proof[iProofLine].lines[i][0]].rule != ruleType.ASSUMPTION &&
					proof[proof[iProofLine].lines[i][0]].rule != ruleType.FLAG) {
					throw "First line of a subproof should be an assumption or a flag.";
				}
				// Second line may not be NONE
				if (proof[proof[iProofLine].lines[i][1]].rule == ruleType.NONE) {
					throw "Cannot refer to a line with a NONE rule";
				}
				// Second number must be in same subproof as first number
				if (!hasHigherLevel(proof[proof[iProofLine].lines[i][0]].subproof, proof[proof[iProofLine].lines[i][1]].subproof) ||
					proof[proof[iProofLine].lines[i][0]].subproof.length != proof[proof[iProofLine].lines[i][1]].subproof.length) {
					throw "Subproof range must refer to single subproof";
				}
				// Second number must be exactly one level higher than this line
				if (!hasHigherLevel(proof[proof[iProofLine].lines[i][0]].subproof, proof[iProofLine].subproof) ||
					proof[proof[iProofLine].lines[i][0]].subproof.length - 1 != proof[iProofLine].subproof.length) {
					throw "Can only refer to subproof of one level deeper";
				}
			} else {
				// Line number must be in the same subproof or lower
				if (proof[proof[iProofLine].lines[i]].rule == ruleType.NONE) {
					throw "Cannot refer to a line with a NONE rule";
				}
				if (!hasHigherLevel(proof[iProofLine].subproof, proof[proof[iProofLine].lines[i]].subproof)) {
					throw "Invalid reference to line " + (proof[iProofLine].lines[i] + 1);
				}
			}
		}
	}
}

/**************************************************/
// Tautology


function arrayContains(arr, elem) {
	for (var i = 0; i < arr.length; ++i) {
		if (arr[i].equals(elem)) {
			return true;
		}
	}
	return false;
}

function processSatisfiability(toProcess, trueList, falseList, constantList, forAllList, count) {
	// Note: Cannot handle @x ?y P(x,y)
	var dictReplace, retVal;
	while (toProcess.length > 0) {
		/*
		console.log(toProcess);
		console.log(toProcess[toProcess.length-1].toString());
		*/
		count++;
		var curElem = toProcess.pop();
		switch (curElem.type) {
			case operandType.BOT:
				return false;
			case operandType.ATOM:
				if (arrayContains(falseList,curElem)) {
					return false;
				}
				trueList.push(curElem);
				break;
			case operandType.AND:
				toProcess.push(curElem.left, curElem.right);
				break;
			case operandType.OR:
				var newProcess = toProcess.slice(0);
				newProcess.push(curElem.left);
				retVal = processSatisfiability(newProcess, trueList.slice(0), falseList.slice(0), constantList.slice(0), forAllList.slice(0), count);
				if (retVal !== false) {
					return retVal;
				}
				toProcess.push(curElem.right);
				break;
			case operandType.ARROW:
				var newProcess = toProcess.slice(0);
				newProcess.push(new opNot(curElem.left));
				retVal = processSatisfiability(newProcess, trueList.slice(0), falseList.slice(0), constantList.slice(0), forAllList.slice(0), count);
				if (retVal !== false) {
					return retVal;
				}
				toProcess.push(curElem.right);
				break;
			case operandType.IFF:
				var newProcess = toProcess.slice(0);
				newProcess.push(new opNot(curElem.left), new opNot(curElem.right));
				retVal = processSatisfiability(newProcess, trueList.slice(0), falseList.slice(0), constantList.slice(0), forAllList.slice(0), count);
				if (retVal !== false) {
					return retVal;
				}
				toProcess.push(curElem.left, curElem.right);
				break;
			case operandType.FORALL:
				forAllList.push(curElem);
				dictReplace = {};
				for (var i = 0; i < constantList.length; ++i) {
					dictReplace[curElem.left.label] = constantList[i];
					toProcess.push(curElem.right.copy(dictReplace));
				}
				break;
			case operandType.EXISTS:
				constantList.push("$"+count);
				dictReplace = {};
				dictReplace[curElem.left.label] = "$"+count;
				toProcess.push(curElem.right.copy(dictReplace));
				for (var i = 0; i < forAllList.length; ++i) {
					dictReplace = {};
					dictReplace[forAllList[i].left.label] = "$"+count;
					toProcess.push(forAllList[i].right.copy(dictReplace));
				}
				break;
			case operandType.EQUALS:
				dictReplace = {};
				dictReplace[curElem.left.label] = curElem.right.label;
				for (var i = 0; i < toProcess.length; ++i) {
					toProcess[i] = toProcess[i].copy(dictReplace);
				}
				for (var i = 0; i < trueList.length; ++i) {
					trueList[i] = trueList[i].copy(dictReplace);
				}
				for (var i = 0; i < falseList.length; ++i) {
					falseList[i] = falseList[i].copy(dictReplace);
					if (arrayContains(trueList, falseList[i])) {
						return false;
					}
				}
				break;
			case operandType.NOT:
				switch (curElem.target.type) {
					case operandType.ATOM:
						if (arrayContains(trueList, curElem.target)) {
							return false;
						}
						falseList.push(curElem.target);
						break;
					case operandType.OR:
						toProcess.push(new opNot(curElem.target.left), new opNot(curElem.target.right));
						break;
					case operandType.AND:
						var newProcess = toProcess.slice(0);
						newProcess.push(new opNot(curElem.target.left));
						retVal = processSatisfiability(newProcess, trueList.slice(0), falseList.slice(0), constantList.slice(0), forAllList.slice(0), count);
						if (retVal !== false) {
							return retVal;
						}
						toProcess.push(new opNot(curElem.target.right));
						break;
					case operandType.ARROW:
						toProcess.push(curElem.target.left, new opNot(curElem.target.right));
						break;
					case operandType.IFF:
						var newProcess = toProcess.slice(0);
						newProcess.push(new opNot(curElem.target.left), curElem.target.right);
						retVal = processSatisfiability(newProcess, trueList.slice(0), falseList.slice(0), constantList.slice(0), forAllList.slice(0), count);
						if (retVal !== false) {
							return retVal;
						}
						toProcess.push(curElem.target.left, new opNot(curElem.target.right));
						break;
					case operandType.FORALL:
						toProcess.push(new opExists(new opNot(curElem.target.right), curElem.target.left));
						break;
					case operandType.EXISTS:
						toProcess.push(new opForAll(new opNot(curElem.target.right), curElem.target.left));
						break;
					case operandType.NOT:
						toProcess.push(curElem.target.target);
						break;
					case operandType.EQUALS:
						if (curElem.target.left.equals(curElem.target.right)) {
							return false;
						}
						var newAtom = new opAtom("$"+count);
						newAtom.arguments[0] = curElem.target.left;
						trueList.push(newAtom);
						newAtom = new opAtom("$"+count);
						newAtom.arguments[0] = curElem.target.right;
						falseList.push(newAtom);
						break;
				}
		}
		if (count >= tautologyLimit) {
			throw "Unable to confirm tautology: Evaluation limit exceeded.";
		}
	}
	for (var i = 0; i < falseList.length; ++i) {
		trueList.push(new opNot(falseList[i]));
	}
	return trueList;
}


function downloadFitch(data){
    var json = JSON.stringify(data),
    blob = new Blob([json], {type: "octet/stream"});
	var link = document.createElement('a');
	link.appendChild(document.createTextNode("click"));
	link.href = window.URL.createObjectURL(blob);
	link.download = "fitch.json";
	link.click();
	document.body.appendChild(link);
}
