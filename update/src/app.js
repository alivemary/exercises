import update from "./update";

var state = {};
var nextState = update(state, {'hasOwnProperty': {$set: 'a'}});


console.log(state);
console.log(nextState);
