import update from "./update";

var state = {a: 3, b: "c", c: {d: 34}};
var nextState = update(state, {$delete: ['a', "c"]});


console.log(state);
console.log(nextState);
