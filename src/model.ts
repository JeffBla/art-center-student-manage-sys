function getUserDetails(studentID) {
  var path = "/USER/" + studentID;
  let data = fetchFromFirebase(path);
  return data;
}

function checkLogin(studentID, password) {
  var userDetails = getUserDetails(studentID);
  if (!userDetails) {
    return false;
  } else {
    if (userDetails.password === password) {
      var path = "/CURRENT/" + userDetails.username;
      var data = {
        username: userDetails.username,
        studentID: studentID,
        loginTime: new Date().toISOString(),
      };
      writeToFirebase(path, data);
      return true;
    } else {
      return false;
    }
  }
}

function saveUser(username, studentID, email, phone, password) {
  var path = "/USER/" + studentID;
  var data = {
    username: username,
    studentID: studentID,
    email: email,
    phone: phone,
    password: password,
    timeStamp: new Date().toISOString(),
  };
  writeToFirebase(path, data);
}

function LogOutUserNow(username) {
  var path = "/CURRENT/" + username;
  deleteFromFirebase(path);
}

function getPaticipateData() {
  var path = "/PARTICIPATE";
  var participateData = fetchFromFirebase(path);
  var data = {};

  for (var groupName in participateData) {
    data[groupName] = {};
    var groupEvents = participateData[groupName];

    for (var eventName in groupEvents) {
      var eventDetails = groupEvents[eventName];
      data[groupName][eventName] = {
        currentWorkforce: eventDetails.當前人數,
        workforceList: eventDetails.參與名單
          ? eventDetails.參與名單.split(" / ")
          : [],
      };
    }
  }
  return data;
}

function getEventSheetData() {
  var path = "/EVENT";
  var eventsData = fetchFromFirebase(path);
  var data = {};

  for (var groupName in eventsData) {
    data[groupName] = {};
    var groupEvents = eventsData[groupName];

    for (var eventName in groupEvents) {
      var eventDetails = groupEvents[eventName];
      data[groupName][eventName] = {
        活動支援時間: eventDetails["支援時間(日期-星期-24小時制)"],
        "工作地點(校區/地點)": eventDetails["工作地點(校區-地點)"],
        "工作時數(時)": Number(eventDetails["工作時數(時)"]),
        "人數需求上限(人)": Number(eventDetails["人數需求上限(人)"]),
        目前餘額: Number(eventDetails["目前餘額"]),
        服務總時數: Number(eventDetails["服務總時數"]),
        備註說明: eventDetails["備註說明"],
      };
    }
  }
  return data;
}

function getEventInfo(eventName) {
  var path = "/EVENT";
  var eventsData = fetchFromFirebase(path);
  var eventInfo = [];

  for (var groupName in eventsData) {
    var groupEvents = eventsData[groupName];
    if (groupEvents[eventName]) {
      var eventDetails = groupEvents[eventName];
      eventInfo = [
        eventName,
        eventDetails["支援時間(日期-星期-24小時制)"],
        eventDetails["工作地點(校區-地點)"],
        Number(eventDetails["工作時數(時)"]),
        eventDetails["備註說明"],
      ];
      break;
    }
  }
  return eventInfo;
}

function hasEvent(selectdEvent, eventName) {
  if (!selectdEvent) return false;
  return selectdEvent.includes(eventName);
}

function eventConfirmClicked(username, eventName) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    // Maintain the choice table
    var choicePath = "/CHOICE/" + username;
    var userChoices = fetchFromFirebase(choicePath) || [];
    if (!hasEvent(userChoices, eventName)) {
      userChoices.push(eventName);
      writeToFirebase(choicePath, userChoices);
    } else {
      return false;
    }

    // Maintain the participate table
    var participatePath = "/PARTICIPATE";
    var participateData = fetchFromFirebase(participatePath);
    for (var groupName in participateData) {
      var groupEvents = participateData[groupName];
      if (groupEvents[eventName]) {
        var eventDetails = groupEvents[eventName];
        eventDetails.參與名單 = eventDetails.參與名單
          ? eventDetails.參與名單.concat(username)
          : [username];
        eventDetails.當前人數 += 1;
        writeToFirebase(
          participatePath + "/" + groupName + "/" + eventName,
          eventDetails
        );
        break;
      }
    }

    // Maintain the remain people in the event table
    // Maintain the remain people in the event table
    var eventPath = "/EVENT";
    var eventData = fetchFromFirebase(eventPath);
    for (var groupName in eventData) {
      var groupEvents = eventData[groupName];
      if (groupEvents[eventName]) {
        var eventDetails = groupEvents[eventName];
        if (eventDetails["目前餘額"] > 0) {
          eventDetails["目前餘額"] -= 1;
          writeToFirebase(
            eventPath + "/" + groupName + "/" + eventName,
            eventDetails
          );
        } else {
          return false;
        }
        break;
      }
    }

    return true;
  } catch (e) {
    console.error("Failed to acquire lock or error in processing:", e);
    return false;
  } finally {
    lock.releaseLock();
  }
}

function getDisabledOptions() {
  var path = "/EVENT";
  var eventsData = fetchFromFirebase(path);
  var disableItem = [];

  for (var groupName in eventsData) {
    var groupEvents = eventsData[groupName];
    for (var eventName in groupEvents) {
      if (groupEvents[eventName]["目前餘額"] <= 0) {
        disableItem.push(eventName);
      }
    }
  }

  return disableItem;
}

function WriteServiceTable(username) {
  var choicePath = "/CHOICE/" + username;
  var selectedEvents = fetchFromFirebase(choicePath) || [];
  var eventsData = {};

  if (selectedEvents.length === 0) {
    return eventsData;
  }

  var eventPath = "/EVENT";
  var eventData = fetchFromFirebase(eventPath);

  for (var i = 0; i < selectedEvents.length; i++) {
    var eventName = selectedEvents[i];
    for (var groupName in eventData) {
      var groupEvents = eventData[groupName];
      if (groupEvents[eventName]) {
        var eventDetails = groupEvents[eventName];
        eventsData[eventName] = {
          time: eventDetails["支援時間(日期-星期-24小時制)"],
          place: eventDetails["工作地點(校區-地點)"],
          hours: eventDetails["工作時數(時)"],
          note: eventDetails["備註說明"],
        };
        break;
      }
    }
  }

  return eventsData;
}

function readPersonalInfo(username) {
  var path = "/USER";
  var usersData = fetchFromFirebase(path);
  var personalInfo = [];

  for (var studentID in usersData) {
    if (usersData[studentID].Name === username) {
      personalInfo = [
        usersData[studentID].StudentID,
        usersData[studentID].Email,
        usersData[studentID].Phone,
      ];
      break;
    }
  }
  console.log(personalInfo);
  return personalInfo;
}

function cancelSelectedEvent(username, eventName) {
  // Remove the event from the participate table
  var participatePath = "/PARTICIPATE";
  var participateData = fetchFromFirebase(participatePath);
  for (var groupName in participateData) {
    var groupEvents = participateData[groupName];
    if (groupEvents[eventName]) {
      var eventDetails = groupEvents[eventName];
      var workforceList = eventDetails.參與名單 || [];
      var index = workforceList.indexOf(username);
      if (index > -1) {
        workforceList.splice(index, 1);
        eventDetails.參與名單 = workforceList;
        eventDetails.當前人數 -= 1;
        writeToFirebase(
          participatePath + "/" + groupName + "/" + eventName,
          eventDetails
        );
        break;
      }
    }
  }

  // Remove the event from the choice table
  var choicePath = "/CHOICE/" + username;
  var userChoices = fetchFromFirebase(choicePath) || [];
  var index = userChoices.indexOf(eventName);
  if (index > -1) {
    userChoices.splice(index, 1);
    writeToFirebase(choicePath, userChoices);
  }

  // Update the remaining people in the event table
  var eventPath = "/EVENT";
  var eventData = fetchFromFirebase(eventPath);
  for (var groupName in eventData) {
    var groupEvents = eventData[groupName];
    if (groupEvents[eventName]) {
      var eventDetails = groupEvents[eventName];
      eventDetails["目前餘額"] += 1;
      writeToFirebase(
        eventPath + "/" + groupName + "/" + eventName,
        eventDetails
      );
      break;
    }
  }

  return "Event canceled successfully";
}
