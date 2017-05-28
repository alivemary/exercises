import update from "./update";

var state = {};
var nextState = update(state, {'hasOwnProperty': {$push: 'a'}});


console.log(state);
console.log(nextState);
