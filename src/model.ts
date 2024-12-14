// Opens the spreadsheet by ID
var ss = SpreadsheetApp.openById(
  "1O-QhQeZRuKTiXXQ05waU_eYZ0_8PoNi24-jTSVr13Iw"
);

function getUserDetails(studentID) {
  var path = "/USER/" + studentID;
  let data = fetchFromFirebase(path);
  return data;
}

function checkLogin(studentID, password) {
  console.log(studentID);
  var userDetails = getUserDetails(studentID);
  console.log(userDetails);
  if (!userDetails) {
    return false;
  } else {
    if (userDetails.Password === password) {
      console.log("Login success");
      console.log(userDetails);
      var path = "/CURRENT/" + userDetails.Name;
      var data = {
        username: userDetails.Name,
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
  let usersheet = ss.getSheetByName("USER");
  usersheet.appendRow([
    new Date(),
    username,
    studentID,
    email,
    phone,
    password,
  ]);
}

function LogOutUserNow(username) {
  let currentsheet = ss.getSheetByName("CURRENT");
  for (let i = 2; i <= currentsheet.getLastRow(); i++) {
    if (
      currentsheet
        .getRange(i, CURRENT_TABLE.TABLE_CURRENT_NAME_COL_IDX)
        .getValue() == username
    ) {
      currentsheet
        .getRange(i, CURRENT_TABLE.TABLE_CURRENT_CurrentLoginTime_COL_IDX)
        .setValue("X");
    }
  }
  for (let i = 2; i <= currentsheet.getLastRow(); i++) {
    if (
      currentsheet
        .getRange(i, CURRENT_TABLE.TABLE_CURRENT_CurrentLoginTime_COL_IDX)
        .getValue() == "X"
    ) {
      currentsheet.deleteRow(i);
    }
  }
}

function LogOutUser() {
  let currentsheet = ss.getSheetByName("CURRENT");
  let ThirtyMinutesAgo = new Date(Date.now() - 30000 * 60);
  for (let i = 2; i <= currentsheet.getLastRow(); i++) {
    if (
      currentsheet
        .getRange(i, CURRENT_TABLE.TABLE_CURRENT_CurrentLoginTime_COL_IDX)
        .getValue() < ThirtyMinutesAgo
    ) {
      currentsheet
        .getRange(i, CURRENT_TABLE.TABLE_CURRENT_CurrentLoginTime_COL_IDX)
        .setValue("X");
    }
  }
  for (let i = 2; i <= currentsheet.getLastRow(); i++) {
    if (
      currentsheet
        .getRange(i, CURRENT_TABLE.TABLE_CURRENT_CurrentLoginTime_COL_IDX)
        .getValue() == "X"
    ) {
      currentsheet.deleteRow(i);
    }
  }
}

function getPaticipateData() {
  let participateSheet = ss.getSheetByName("PARTICIPATE");
  let y_idx = PARTICIPATE_TABLE.PARTICIPATE_SHEET_START;
  let y_event = 1;
  let data = {};

  while (
    participateSheet
      .getRange(y_idx + y_event, EVENT_TABLE.TABLE_EVENT_ID_IDX)
      .getValue() != "X"
  ) {
    let eventName = participateSheet
      .getRange(
        y_idx + y_event,
        PARTICIPATE_TABLE.TABLE_PARTICIPATE_EVNET_NAME_IDX
      )
      .getValue();
    if (data[eventName] == undefined) {
      // retrive the people name from the workforce
      let workforceStr = participateSheet
        .getRange(
          y_idx + y_event,
          PARTICIPATE_TABLE.TABLE_PARTICIPATE_WORKFORCE_LIST_IDX
        )
        .getValue();
      let workforceList = workforceStr.split(" / ");
      // Insert the data into the data structure
      data[eventName] = {
        currentWorkforce: Number(
          participateSheet
            .getRange(
              y_idx + y_event,
              PARTICIPATE_TABLE.TABLE_PARTICIPATE_CURRENT_WORKFORCE_IDX
            )
            .getValue()
        ),
        workforceList: workforceList,
      };
    }
    y_idx = y_idx + y_event + 1;
    y_event = 1;
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
        "工作地點(校區-地點)": eventDetails["工作地點(校區-地點)"],
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
  let eventSheet = ss.getSheetByName("EVENT");
  let eventInfo = [];

  // Event Name
  eventInfo.push(eventName);
  for (
    let y = EVENT_TABLE.EVENT_SHEET_START;
    y <= eventSheet.getLastRow();
    y++
  ) {
    if (
      eventSheet.getRange(y, EVENT_TABLE.TABLE_EVENT_NAME_IDX).getValue() ==
      eventName
    ) {
      // 活動支援時間
      eventInfo.push(
        eventSheet.getRange(y, EVENT_TABLE.TABLE_EVENT_TIME_IDX).getValue()
      );
      // 工作地點(校區/地點)
      eventInfo.push(
        eventSheet.getRange(y, EVENT_TABLE.TABLE_EVENT_LOCATION_IDX).getValue()
      );
      // 工作時數(時)
      eventInfo.push(
        Number(
          eventSheet
            .getRange(y, EVENT_TABLE.TABLE_EVENT_WORKHOUR_IDX)
            .getValue()
        )
      );
      // 備註說明
      eventInfo.push(
        eventSheet
          .getRange(y, EVENT_TABLE.TABLE_EVENT_DESCRIPTION_IDX)
          .getValue()
      );
      break;
    }
  }
  return eventInfo;
}

function hasEvent(selectdEvent, eventName) {
  for (let i = 0; i < selectdEvent.length; i++) {
    if (selectdEvent[i] == eventName) {
      return true;
    }
  }
  return false;
}

function eventConfirmClicked(username, eventName) {
  const lock = LockService.getScriptLock();
  try {
    // Wait for up to 30 seconds to acquire the lock
    lock.waitLock(30000);

    let choiceSheet = ss.getSheetByName("CHOICE");
    let isChoiceExist = false;
    let selectdEvent;

    let participateSheet = ss.getSheetByName("PARTICIPATE");

    let eventSheet = ss.getSheetByName("EVENT");
    // Maintain the choice table
    for (
      let y = CHOICE_TABLE.CHOICE_SHEET_START;
      y <= choiceSheet.getLastRow();
      y++
    ) {
      if (
        choiceSheet
          .getRange(y, CHOICE_TABLE.TABLE_CHOICE_NAME_IDX)
          .getValue() == username
      ) {
        let finalEventCol = getRowDataLength(choiceSheet, y);
        // Check if the event is already selected
        // Get the selected event row
        selectdEvent = choiceSheet
          .getRange(y, 1, 1, finalEventCol)
          .getValues()[0];
        console.log(selectdEvent);
        if (!hasEvent(selectdEvent, eventName)) {
          choiceSheet.getRange(y, finalEventCol + 1).setValue(eventName);
        } else {
          return false;
        }
        isChoiceExist = true;
        break;
      }
    }
    if (isChoiceExist == false) {
      choiceSheet.appendRow([username, eventName]);
    }
    // Maintain the participate table
    for (
      let y = PARTICIPATE_TABLE.TABLE_PARTICIPATE_EVNET_NAME_IDX;
      y <= participateSheet.getLastRow();
      y++
    ) {
      if (
        participateSheet
          .getRange(y, PARTICIPATE_TABLE.TABLE_PARTICIPATE_EVNET_NAME_IDX)
          .getValue() == eventName
      ) {
        let workforceListRange = participateSheet.getRange(
          y,
          PARTICIPATE_TABLE.TABLE_PARTICIPATE_WORKFORCE_LIST_IDX
        );
        if (workforceListRange.getValue() != "") {
          workforceListRange.setValue(
            workforceListRange.getValue() + " / " + username
          );
        } else {
          workforceListRange.setValue(username);
        }

        // Update the current number of workforce
        let currentWorkforceBlock = participateSheet.getRange(
          y,
          PARTICIPATE_TABLE.TABLE_PARTICIPATE_CURRENT_WORKFORCE_IDX
        );
        let currentWorkforceNum = Number(currentWorkforceBlock.getValue());
        currentWorkforceBlock.setValue(currentWorkforceNum + 1);
        break;
      }
    }
    // Maintain the remain people in the event table
    for (
      let y = EVENT_TABLE.EVENT_SHEET_START;
      y <= eventSheet.getLastRow();
      y++
    ) {
      if (
        eventSheet.getRange(y, EVENT_TABLE.TABLE_EVENT_NAME_IDX).getValue() ==
        eventName
      ) {
        let remainPeopleBlock = eventSheet.getRange(
          y,
          EVENT_TABLE.TABLE_EVENT_REMAIN_PEOPLE_IDX
        );
        let remainPeopleNum = Number(remainPeopleBlock.getValue());
        if (remainPeopleNum > 0) {
          remainPeopleBlock.setValue(remainPeopleNum - 1);
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
    // Make sure the lock is always released
    lock.releaseLock();
  }
}

function getRowDataLength(sheet, rowNumber) {
  // Get the data in the specified row
  let rowData = sheet
    .getRange(rowNumber, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  // Filter out the empty cells and count the number of non-empty cells
  let dataLength = rowData.filter(String).length;

  return dataLength;
}

function getDisabledOptions() {
  let eventSheet = ss.getSheetByName("EVENT");
  let eventLastRow = eventSheet.getLastRow();
  let disableItem = [];

  for (let y = EVENT_TABLE.EVENT_SHEET_START + 1; y <= eventLastRow; y++) {
    let remainPeopleBlock = eventSheet.getRange(
      y,
      EVENT_TABLE.TABLE_EVENT_REMAIN_PEOPLE_IDX
    );
    if (Number(remainPeopleBlock.getValue()) <= 0) {
      disableItem.push(
        eventSheet.getRange(y, EVENT_TABLE.TABLE_EVENT_NAME_IDX).getValue()
      );
      remainPeopleBlock.setValue(0);
    }
  }

  return disableItem;
}

function getEnabledOptions() {
  let eventSheet = ss.getSheetByName("EVENT");
  let eventLastRow = eventSheet.getLastRow();
  let enableItem = [];

  for (let y = EVENT_TABLE.EVENT_SHEET_START + 1; y <= eventLastRow; y++) {
    let remainPeopleBlock = eventSheet.getRange(
      y,
      EVENT_TABLE.TABLE_EVENT_REMAIN_PEOPLE_IDX
    );
    if (Number(remainPeopleBlock.getValue()) > 0) {
      enableItem.push(
        eventSheet
          .getRange(y, EVENT_TABLE.TABLE_EVENT_REMAIN_PEOPLE_IDX)
          .getValue()
      );
    }
  }

  return enableItem;
}

function WriteServiceTable(username) {
  let choiceSheet = ss.getSheetByName("CHOICE");
  let eventSheet = ss.getSheetByName("EVENT");
  let eventsData = {};
  let rowLength = 0;

  let selectedEvent = [];
  // Get the selected event
  for (
    let y = CHOICE_TABLE.CHOICE_SHEET_START;
    y <= choiceSheet.getLastRow();
    y++
  ) {
    if (
      choiceSheet.getRange(y, CHOICE_TABLE.TABLE_CHOICE_NAME_IDX).getValue() ==
      username
    ) {
      rowLength = getRowDataLength(choiceSheet, y);

      for (let col = 2; col <= rowLength; col++) {
        selectedEvent.push(choiceSheet.getRange(y, col).getValue());
      }

      break;
    }
  }
  if (selectedEvent.length == 0) {
    return [];
  }

  // Collect the event data
  for (
    let y = EVENT_TABLE.EVENT_SHEET_START;
    y <= eventSheet.getLastRow();
    y++
  ) {
    let findedEventIdx = selectedEvent.indexOf(
      eventSheet.getRange(y, EVENT_TABLE.TABLE_EVENT_NAME_IDX).getValue()
    );
    // If the event is selected, which means the event is not undefined
    if (findedEventIdx > -1) {
      eventsData[selectedEvent[findedEventIdx]] = {
        time: eventSheet
          .getRange(y, EVENT_TABLE.TABLE_EVENT_TIME_IDX)
          .getValue(),
        place: eventSheet
          .getRange(y, EVENT_TABLE.TABLE_EVENT_LOCATION_IDX)
          .getValue(),
        hours: eventSheet
          .getRange(y, EVENT_TABLE.TABLE_EVENT_WORKHOUR_IDX)
          .getValue(),
        note: eventSheet
          .getRange(y, EVENT_TABLE.TABLE_EVENT_DESCRIPTION_IDX)
          .getValue(),
      };
      // Remove the selected event from the selectedEvent list
      selectedEvent.slice(findedEventIdx, 1);
      if (selectedEvent.length == 0) break;
    }
  }

  return eventsData;
}

function readPersonalInfo(username) {
  let userSheet = ss.getSheetByName("USER");
  let personalInfo = [];

  for (let y = 2; y <= userSheet.getLastRow(); y++) {
    if (userSheet.getRange(y, USER_TABLE.TABLE_USER_NAME_COL_IDX) == username) {
      personalInfo.push(
        userSheet.getRange(y, USER_TABLE.TABLE_USER_STUDENTID_COL_IDX)
      );
      personalInfo.push(
        userSheet.getRange(y, USER_TABLE.TABLE_USER_EMAIL_COL_IDX)
      );
      personalInfo.push(
        userSheet.getRange(y, USER_TABLE.TABLE_USER_PHONE_COL_IDX)
      );
    }
    break;
  }
  console.log(personalInfo);
  return personalInfo;
}

function cancelSelectedEvent(username, eventName) {
  let participateSheet = ss.getSheetByName("PARTICIPATE");
  let data = participateSheet.getDataRange().getValues();

  let choiceSheet = ss.getSheetByName("CHOICE");

  let eventSheet = ss.getSheetByName("EVENT");

  // Remove the event from the participate table
  for (let i = 1; i < data.length; i++) {
    if (
      data[i][PARTICIPATE_TABLE.TABLE_PARTICIPATE_EVNET_NAME_IDX - 1] ===
      eventName
    ) {
      // Remove the username of the workforce
      let workforceList =
        data[i][
          PARTICIPATE_TABLE.TABLE_PARTICIPATE_WORKFORCE_LIST_IDX - 1
        ].split("/");
      let index = workforceList.indexOf(username);
      if (index > -1) {
        workforceList.splice(index, 1);
        participateSheet
          .getRange(
            i + 1,
            PARTICIPATE_TABLE.TABLE_PARTICIPATE_WORKFORCE_LIST_IDX
          )
          .setValue(workforceList.join("/"));
        // Update the current number of workforce
        let currentWorkforceBlock = participateSheet.getRange(
          i + 1,
          PARTICIPATE_TABLE.TABLE_PARTICIPATE_CURRENT_WORKFORCE_IDX
        );
        let currentWorkforceNum = Number(currentWorkforceBlock.getValue());
        currentWorkforceBlock.setValue(currentWorkforceNum - 1);
      }
      break;
    }
  }

  // Remove the event from the choice table
  for (
    let y = CHOICE_TABLE.CHOICE_SHEET_START;
    y <= choiceSheet.getLastRow();
    y++
  ) {
    if (
      choiceSheet.getRange(y, CHOICE_TABLE.TABLE_CHOICE_NAME_IDX).getValue() ==
      username
    ) {
      let finalEventCol = getRowDataLength(choiceSheet, y);
      let selectdEvent = choiceSheet
        .getRange(y, 1, 1, finalEventCol)
        .getValues()[0];
      let index = selectdEvent.indexOf(eventName);
      if (index > -1) {
        // clear the selected event
        selectdEvent[index] = "";
        choiceSheet.getRange(y, 1, 1, finalEventCol).setValues([selectdEvent]);
      }
      break;
    }
  }

  // Update the remain people from the event table
  for (
    let y = EVENT_TABLE.EVENT_SHEET_START;
    y <= eventSheet.getLastRow();
    y++
  ) {
    if (
      eventSheet.getRange(y, EVENT_TABLE.TABLE_EVENT_NAME_IDX).getValue() ==
      eventName
    ) {
      let remainPeopleBlock = eventSheet.getRange(
        y,
        EVENT_TABLE.TABLE_EVENT_REMAIN_PEOPLE_IDX
      );
      let remainPeopleNum = Number(remainPeopleBlock.getValue());
      remainPeopleBlock.setValue(remainPeopleNum + 1);
      break;
    }
  }

  return "Event canceled successfully";
}
