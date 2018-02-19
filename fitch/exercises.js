/*  Fitch proof exercises
 *  IO script
 *  Copyright 2018 Harmen de Weerd
 */

document.addEventListener("DOMContentLoaded", function(){
		initProofs();
		var target = document.getElementById("exerciseBox").children[0];
		for (var i = 0; i < exercises.length; ++i) {
			var optionElement = document.createElement("option");
			optionElement.innerHTML = exercises[i].name;
			target.appendChild(optionElement);
		}
		document.getElementById("exerciseBox").children[0].addEventListener("change", loadExercise);
		document.getElementById("resetButton").addEventListener("click", resetCurrentProof);
		loadExerciseNumber(0);
	});

exerciseId = "fitch";
exercises = [{
	0:{input:"",rule:0,lines:"",sameDepth:true},
	length:1,
	name:"-- None --",
	goal:{input:"",rule:0,lines:"",sameDepth:true}
},{
	0:{input:"",rule:0,lines:"",sameDepth:true},
	length:1,
	name:"Practice",
	goal:{input:"",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Equality",
	0:{input:"a=b",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"b=a",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Conjunction",
	0:{input:"P&Q",rule:1,lines:"",sameDepth:true},
	1:{input:"R",rule:1,lines:"",sameDepth:true},
	2:{input:"",rule:0,lines:"",sameDepth:true},
	length:3,
	goal:{input:"P&R",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Disjunction",
	0:{input:"(P&Q)|(P&R)",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"Q|R",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Absurdity",
	0:{input:"P&!P",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"Q",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Negation",
	0:{input:"!(P|!P)",rule:2,lines:"",sameDepth:true},
	1:{input:"P",rule:2,lines:"",sameDepth:false},
	2:{input:"P|!P",rule:10,lines:[1],sameDepth:true},
	3:{input:"",rule:0,lines:"",sameDepth:true},
	length:4,
	goal:{input:"P|!P",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Implication",
	0:{input:"P>Q",rule:1,lines:"",sameDepth:true},
	1:{input:"Q>R",rule:1,lines:"",sameDepth:true},
	2:{input:"",rule:0,lines:"",sameDepth:true},
	length:3,
	goal:{input:"P>R",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Biconditional",
	0:{input:"P<Q",rule:1,lines:"",sameDepth:true},
	1:{input:"Q<R",rule:1,lines:"",sameDepth:true},
	2:{input:"",rule:0,lines:"",sameDepth:true},
	length:3,
	goal:{input:"P<R",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Universal",
	0:{input:"@x P(x)",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"@y P(y)",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Existential",
	0:{input:"?x P(x)",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"?y P(y)",rule:0,lines:"",sameDepth:true}
},{
	0:{input:"",rule:0,lines:"",sameDepth:true},
	length:1,
	name:"Short proofs",
	goal:{input:"",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Contraposition",// 7
	0:{input:"P>Q",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"!Q>!P",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Weakening conjunction", // 7
	0:{input:"(P&Q)|R",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"P|R",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Weakening consequent", // 5
	0:{input:"P>Q",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"P>(Q|R)",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Strengthening antecedent", // 5
	0:{input:"P>R",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"(P&Q)>R",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Exchanging quantifiers", // 6
	0:{input:"?y @x P(x,y)",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"@x ?y P(x,y)",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Circular reasoning", // 5	
	0:{input:"",rule:0,lines:"",sameDepth:true},
	length:1,
	goal:{input:"P>(Q>P)",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Absurdity", // 7
	0:{input:"P<~P",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"#",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Quantifiers", // 7
	0:{input:"~?x P(x)",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"@x ~P(x)",rule:0,lines:"",sameDepth:true}
},{
	0:{input:"",rule:0,lines:"",sameDepth:true},
	length:1,
	name:"Medium length proofs",
	goal:{input:"",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;And distribution", // 10
	0:{input:"P & (Q | R)",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"(P&Q) | (P&R)",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Or distribution", // 12
	0:{input:"P | (Q & R)",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"(P|Q) & (P|R)",rule:0,lines:"",sameDepth:true}
},{		
	name:"&nbsp;&nbsp;&nbsp;Transportation", // 10
	0:{input:"P | !!Q",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"!!P | Q",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Neither", // 14
	0:{input:"!(P & Q)",rule:1,lines:"",sameDepth:true}, 
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"!P | !Q",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Nor", // 10
	0:{input:"!P | !Q",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"!(P & Q)",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Excluded (wide) middle",// 10
	0:{input:"",rule:0,lines:"",sameDepth:true},
	length:1,
	goal:{input:"P | ~(P&Q)",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;For all conjunctions", // 13
	0:{input:"@x @y ((P(x) & Q(y)) > R(x,y))",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"@x (P(x) > @y (Q(y) > R(x,y)))",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Cue", // 11
	0:{input:"@x (P(x) | Q(x))",rule:1,lines:"",sameDepth:true},
	1:{input:"?x ~P(x)",rule:1,lines:"",sameDepth:true},
	2:{input:"",rule:0,lines:"",sameDepth:true},
	length:3,
	goal:{input:"?x Q(x)",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Taking sides", // 10
	0:{input:"@x P(x) | @x Q(x)",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"@x (P(x) | Q(x))",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Not all", // 12
	0:{input:"~@x P(x)",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"?x ~P(x)",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Impossible relations", // 10
	0:{input:"",rule:0,lines:"",sameDepth:true},
	length:1,
	goal:{input:"~?x @y (P(x,y) < ~P(y,y))",rule:0,lines:"",sameDepth:true}
},{
	name:"Long proofs",
	0:{input:"",rule:0,lines:"",sameDepth:true},
	length:1,
	goal:{input:"",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Disjunction chaining", // 17
	0:{input:"P1 | P2",rule:1,lines:"",sameDepth:true},
	1:{input:"Q1 | Q2",rule:1,lines:"",sameDepth:true},
	2:{input:"!P1 | !Q1",rule:1,lines:"",sameDepth:true},
	3:{input:"",rule:0,lines:"",sameDepth:true},
	length:4,
	goal:{input:"P2|Q2",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Or, And, Not", // 20
	0:{input:"Q| ~(P & R)",rule:1,lines:"",sameDepth:true},
	1:{input:"(T & R) | (R & S)",rule:1,lines:"",sameDepth:true},
	2:{input:"~(~P | ~S)",rule:1,lines:"",sameDepth:true},
	3:{input:"",rule:0,lines:"",sameDepth:true},
	length:4,
	goal:{input:"Q",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;Complex excluded middle", // 18
	0:{input:"",rule:0,lines:"",sameDepth:true},
	length:1,
	goal:{input:"(P & Q) | (~P | ~Q)",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;And Implication", // 15
	0:{input:"",rule:0,lines:"",sameDepth:true},
	length:1,
	goal:{input:"(P>(Q>R))<((P&Q)>R)",rule:0,lines:"",sameDepth:true}
},{
	name:"&nbsp;&nbsp;&nbsp;There can only be one", // 18
	0:{input:"?x (P(x) & @y (P(y) > (y=x)))",rule:1,lines:"",sameDepth:true},
	1:{input:"",rule:0,lines:"",sameDepth:true},
	length:2,
	goal:{input:"@x @y ((P(x) & P(y)) > (x=y))",rule:0,lines:"",sameDepth:true}
}];


