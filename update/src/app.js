import update from "./update";

let state = {};
let nextState = update(state, 
  {'hasOwnProperty': {$set: 'a'}}
);
console.log(nextState);
console.log(state);

