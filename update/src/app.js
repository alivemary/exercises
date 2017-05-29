import update from "./update";

var state = [1, 2, 3];
var nextState = update(state, {$push: [4, 3]});


console.log(state);
console.log(nextState);
