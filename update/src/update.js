export default function update(initialData, updateData) {
  let commandsMap = new Map();

  commandsMap.set("$push", (initialArray, commandObject) => {
    return [...initialArray, ...commandObject["$push"]];
  });

  commandsMap.set("$unshift", (initialArray, commandObject) => {
    return [...commandObject["$unshift"], ...initialArray];
  });

  commandsMap.set("$splice", (initialArray, commandObject) => {
    let data = commandObject["$splice"][0];
    return [
      ...initialArray.slice(0, data[0]),
      ...data.slice(2),
      ...initialArray.slice(data[0] + data[1])
    ];
  });

  commandsMap.set("$merge", (initialObject, commandObject) => {
    return Object.assign({}, initialObject, commandObject["$merge"]);
  });

  commandsMap.set("$apply", (initialObject, commandObject) => {
    let action = commandObject["$apply"];
    return action(initialObject);
  });

  commandsMap.set("$set", (initialObject, commandObject) => {
    return commandObject["$set"];
  });

  commandsMap.set("$delete", (initialObject, commandObject) => {
    let newData = {};
    let keys = Object.keys(initialObject);
    newData = keys.reduce((obj, key) => {
      if (!commandObject["$delete"].includes(key)) {
        return Object.assign({}, obj, { [key]: initialObject[key] });
      }
      return obj;
    }, {});
    return newData;
  });

  commandsMap.set("$setState", (initialObject, updateObject) => {
    return Object.assign(
      {},
      initialObject,
      iterateTroughObject(initialObject, updateObject)
    );
  });

  //case of simple update
  let command = getCommand(updateData);
  if (command) {
    return commandsMap.get(command)(initialData, updateData);
  }

  //case of complex state update
  return commandsMap.get("$setState")(initialData, updateData);

  //$setState function
  function iterateTroughObject(state, commandObject) {
    let newData = {};
    let updateDataFields = Object.keys(commandObject);

    for (let prop in state) {
      if (ownProp(commandObject, prop)) {
        updateDataFields = updateDataFields.filter(field => {
          return field !== prop;
        });
        let command = getCommand(commandObject[prop]);
        if (command) {
          return Object.assign({}, newData, {
            [prop]: commandsMap.get(command)(state[prop], commandObject[prop])
          });
        } else {
          newData = Object.assign({}, newData, {
            [prop]: iterateTroughObject(state[prop], commandObject[prop])
          });
        }
      } else {
        newData = Object.assign({}, newData, { [prop]: state[prop] });
      }
    }
    //if update has some fields that do not exist in the initial state
    updateDataFields.forEach(field => {
      let command = getCommand(commandObject[field]);
      if (command) {
        newData = Object.assign({}, newData, {
          [field]: commandsMap.get(command)({}, commandObject[field])
        });
      } else {
        newData = Object.assign({}, newData, { [field]: commandObject[field] });
      }
    });

    return newData;
  }

  //check if the field is a command and define command
  function getCommand(checkObject) {
    let key = Object.keys(checkObject);
    if (key[0].charAt(0) === "$") {
      return key[0];
    }
    return "";
  }
  //safe hasOwnProperty check
  function ownProp(obj, prop) {
    if ("hasOwnProperty" in obj) {
      return obj.hasOwnProperty(prop);
    } else {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
  }
}
