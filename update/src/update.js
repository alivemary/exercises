export default function update(initialData, updateData) {
  function iterateTroughObject(state, commandObject) {
    let newData = {};

    for (let prop in state) {
      if (state.hasOwnProperty(prop)) {
        if (commandObject.hasOwnProperty(prop)) {
          if (isCommand(commandObject[prop])) {
            return Object.assign({}, newData, { [prop]: newValue(commandObject[prop]) });
          } else {
            newData = Object.assign({}, newData, {
              [prop]: iterateTroughObject(state[prop], commandObject[prop])
            });
          }
        } else {
          newData = Object.assign({}, newData, { [prop]: state[prop] });
        }
      }
    }
    return newData;
  }

  
  let data = iterateTroughObject(initialData, updateData);
  
  function isCommand(checkObject) {
    let key = Object.keys(checkObject);
    return key[0].charAt(0) === "$";
  }

  function newValue(commandObject) {
    let key = Object.keys(commandObject);
    return commandObject[key[0]];
  }

  let commandsMap = new Map();

  commandsMap.set("$push", () => {
    return [...initialData, updateData["$push"][0]];
  });
  commandsMap.set("$unshift", () => {
    return [updateData["$unshift"][0], ...initialData];
  });
  commandsMap.set("$set", () => {
    return Object.assign({}, initialData, data);
  });
  return commandsMap.get("$set")();
}
