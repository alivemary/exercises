export default function update(initialData, updateData) {
  let command = "";
  let commandsMap = new Map();

  commandsMap.set("$push", (initialArray, commandObject) => {
    return [...initialArray, commandObject["$push"][0]];
  });
  commandsMap.set("$unshift", (initialArray, commandObject) => {
    return [commandObject["$unshift"][0], ...initialArray];
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
    let mergedData = {};
    for (let prop in initialObject) {
      mergedData = Object.assign({}, mergedData, { [prop]: initialObject[prop] });
    }
    for (let prop in commandObject) {
      mergedData = Object.assign({}, mergedData, commandObject[prop]);
    }
    return mergedData;
  });
  commandsMap.set("$apply", (initialObject, commandObject) => {
    let action = commandObject["$apply"];
    return action(initialObject);
  });

  commandsMap.set("$set", (initialObject, commandObject) => {
    return commandObject["$set"];
  });

  commandsMap.set("$setState", () => {
    return Object.assign(
      {},
      initialData,
      iterateTroughObject(initialData, updateData)
    );
  });

  if (isCommand(updateData)) {
    return commandsMap.get(command)(initialData, updateData);
  }

  //$setState function
  function iterateTroughObject(state, commandObject) {
    let newData = {};
    let updateDataFields = Object.keys(commandObject);
    console.log(updateDataFields);
    for (let prop in state) {
      if (ownProp(commandObject, prop)) {
        updateDataFields = updateDataFields.filter(field => {
          return field !== prop;
        });
        console.log(updateDataFields);
        if (isCommand(commandObject[prop])) {
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
    if (updateDataFields.length) {
      updateDataFields.forEach(field => {
        if (isCommand(updateData[field])) {
          newData = Object.assign({}, newData, {
            [field]: newValue(updateData[field])
          });
        } else {
          newData = Object.assign({}, newData, { [field]: updateData[field] });
        }
        
      });
    }

    return newData;
  }

  //check if the field is a command and define command
  function isCommand(checkObject) {
    let key = Object.keys(checkObject);
    if (key[0].charAt(0) === "$") {
      setCommand(key[0]);
      return true;
    }
    return false;
  }

  function newValue(commandObject) {
    let key = Object.keys(commandObject);
    return commandObject[key[0]];
  }

  function setCommand(value) {
    command = value;
  }

  function ownProp(obj, prop) {
    if ("hasOwnProperty" in obj) {
      return obj.hasOwnProperty(prop);
    } else {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
  }

  function errorMessage(string) {
    console.log(string);
  }

  return commandsMap.get("$setState")();
}
