// Opens the spreadsheet by ID
var ss = SpreadsheetApp.openById(
  "1O-QhQeZRuKTiXXQ05waU_eYZ0_8PoNi24-jTSVr13Iw"
);

function getUserDetails(studentID) {
  let usersheet = ss.getSheetByName("USER");
  let data = usersheet.getDataRange().getValues();

  // Since the getDataRange() method returns a 2D array, we need to subtract 1 from the column index
  let TABLE_USER_STUDENTID_COL_IDX =
    USER_TABLE.TABLE_USER_STUDENTID_COL_IDX - 1;
  let TABLE_USER_NAME_COL_IDX = USER_TABLE.TABLE_USER_NAME_COL_IDX - 1;
  let TABLE_USER_PHONE_COL_IDX = USER_TABLE.TABLE_USER_PHONE_COL_IDX - 1;
  let TABLE_USER_EMAIL_COL_IDX = USER_TABLE.TABLE_USER_EMAIL_COL_IDX - 1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][TABLE_USER_STUDENTID_COL_IDX] == studentID) {
      return {
        username: data[i][TABLE_USER_NAME_COL_IDX],
        studentID: data[i][TABLE_USER_STUDENTID_COL_IDX],
        phone: data[i][TABLE_USER_PHONE_COL_IDX],
        email: data[i][TABLE_USER_EMAIL_COL_IDX],
      };
    }
  }
  return null;
}

function checkLogin(studentID, password) {
  let usersheet = ss.getSheetByName("USER");
  // Need to update the date of login in Current sheet
  let currentsheet = ss.getSheetByName("CURRENT");

  if (studentID == "" || password == "") {
    return false;
  }

  // login validation
  let isFound = false;
  let username = "";
  for (let i = 2; i <= usersheet.getLastRow(); i++) {
    let studentID_usersheet = usersheet
      .getRange(i, USER_TABLE.TABLE_USER_STUDENTID_COL_IDX)
      .getValue();
    let password_usersheet = usersheet
      .getRange(i, USER_TABLE.TABLE_USER_PASSWORD_COL_IDX)
      .getValue();
    if (studentID_usersheet == studentID && password_usersheet == password) {
      isFound = true;
      username = usersheet
        .getRange(i, USER_TABLE.TABLE_USER_NAME_COL_IDX)
        .getValue();
      break;
    }
  }
  // update the login time in the current sheet
  if (isFound) {
    for (let i = 2; i <= currentsheet.getLastRow(); i++) {
      if (
        currentsheet
          .getRange(i, CURRENT_TABLE.TABLE_CURRENT_STUDENTID_COL_IDX)
          .getValue() == studentID
      ) {
        currentsheet
          .getRange(i, CURRENT_TABLE.TABLE_CURRENT_CurrentLoginTime_COL_IDX)
          .setValue(new Date());
      } else {
        currentsheet.appendRow([username, studentID, new Date()]);
      }
      break;
    }
  }

  return isFound;
}

function userSignup(userData) {
  if (
    !userData.userName ||
    !userData.userStudentID ||
    !userData.userEmail ||
    !userData.userPhone ||
    !userData.userPassword
  ) {
    return "Some field is empty.";
  }

  let usersheet = ss.getSheetByName("USER");
  for (let i = 2; i <= usersheet.getLastRow(); i++) {
    let studentID = usersheet
      .getRange(i, USER_TABLE.TABLE_USER_STUDENTID_COL_IDX)
      .getValue();
    if (studentID == userData.userStudentID) {
      return false;
    }
  }

  saveUser(
    userData.userName,
    userData.userStudentID,
    userData.userEmail,
    userData.userPhone,
    userData.userPassword
  );

  return true;
}

function saveUser(username, studentID, email, phone, password) {
  let usersheet = ss.getSheetByName("USER");
  usersheet.appendRow([
    new Date(),
    username,
    studentID,
    phone,
    email,
    password,
  ]);
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
  let eventSheet = ss.getSheetByName("EVENT");
  let eventLastRow = eventSheet.getLastRow();
  // Stand for the row index of the event table
  let y_idx = EVENT_TABLE.EVENT_SHEET_START;
  // Stand for the event in the group
  let y_events = 1;
  let data = {};

  while (y_idx < eventLastRow) {
    let groupNameIdx = y_idx;
    // Creat a new group by the name
    data[
      eventSheet
        .getRange(groupNameIdx, EVENT_TABLE.TABLE_EVENT_ID_IDX)
        .getValue()
    ] = {};

    // "X" stand for the end of the group
    while (
      eventSheet
        .getRange(y_idx + y_events, EVENT_TABLE.TABLE_EVENT_ID_IDX)
        .getValue() != "X"
    ) {
      let evnet_cnt = y_idx + y_events;
      let eventName = eventSheet
        .getRange(evnet_cnt, EVENT_TABLE.TABLE_EVENT_NAME_IDX)
        .getValue();

      // Push event data structure
      data[
        eventSheet
          .getRange(groupNameIdx, EVENT_TABLE.TABLE_EVENT_ID_IDX)
          .getValue()
      ][eventName] = {
        活動支援時間: eventSheet
          .getRange(evnet_cnt, EVENT_TABLE.TABLE_EVENT_TIME_IDX)
          .getValue(),
        "工作地點(校區/地點)": eventSheet
          .getRange(evnet_cnt, EVENT_TABLE.TABLE_EVENT_LOCATION_IDX)
          .getValue(),
        "工作時數(時)": Number(
          eventSheet
            .getRange(evnet_cnt, EVENT_TABLE.TABLE_EVENT_WORKHOUR_IDX)
            .getValue()
        ),
        "人數需求上限(人)": Number(
          eventSheet
            .getRange(evnet_cnt, EVENT_TABLE.TABLE_EVENT_PEOPLE_IDX)
            .getValue()
        ),
        目前餘額: Number(
          eventSheet
            .getRange(evnet_cnt, EVENT_TABLE.TABLE_EVENT_REMAIN_PEOPLE_IDX)
            .getValue()
        ),
        服務總時數: Number(
          eventSheet
            .getRange(evnet_cnt, EVENT_TABLE.TABLE_EVENT_TOTAL_HOUR_IDX)
            .getValue()
        ),
        備註說明: eventSheet
          .getRange(evnet_cnt, EVENT_TABLE.TABLE_EVENT_DESCRIPTION_IDX)
          .getValue(),
      };
      y_events++;
    }
    // y_idx + y_events == "X"
    y_idx = y_idx + y_events + 1;
    y_events = 1;
  }
  return data;
}

function hasEvent(selectdEvent, eventName) {
  for (let i = 0; i < selectdEvent.length; i++) {
    if (selectdEvent[i] == eventName) {
      return true;
    }
  }
  return false;
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

function isUserAvailable(username: string, eventName: string): boolean {
  let choiceSheet = ss.getSheetByName("CHOICE");
  let eventSheet = ss.getSheetByName("EVENT");

  // Check the choice table
  for (let i = 1; i <= choiceSheet.getLastRow(); i++) {
    if (
      choiceSheet.getRange(i, CHOICE_TABLE.TABLE_CHOICE_NAME_IDX).getValue() ===
      username
    ) {
      let rowLength = getRowDataLength(choiceSheet, i);
      let selectedEvents = choiceSheet
        .getRange(i, 1, 1, rowLength)
        .getValues()[0];
      if (selectedEvents.includes(eventName)) {
        return false;
      }
    }
  }

  // Check the event table for empty spaces
  for (
    let i = EVENT_TABLE.EVENT_SHEET_START;
    i <= eventSheet.getLastRow();
    i++
  ) {
    if (
      eventSheet.getRange(i, EVENT_TABLE.TABLE_EVENT_NAME_IDX).getValue() ===
      eventName
    ) {
      let remainPeopleBlock = eventSheet.getRange(
        i,
        EVENT_TABLE.TABLE_EVENT_REMAIN_PEOPLE_IDX
      );
      let remainPeopleNum = Number(remainPeopleBlock.getValue());
      if (remainPeopleNum <= 0) {
        return false;
      }
    }
  }

  return true;
}

function eventConfirmClicked(username, eventName) {
  const lock = LockService.getScriptLock();
  try {
    // Wait for up to 30 seconds to acquire the lock
    lock.waitLock(30000);

    if (!isUserAvailable(username, eventName)) {
      let alert_str = `User ${username} is not available for the event ${eventName}`;
      console.log(alert_str);
      let warning_str =
        "The event is full or you have already selected the event.";
      return warning_str;
    }

    updateChoiceTable(username, eventName);

    updateParticipateTable(username, eventName);

    updateEventTable(eventName);

    return true;
  } catch (e) {
    console.error("Failed to acquire lock or error in processing:", e);
    return false;
  } finally {
    lock.releaseLock();
  }
}

function updateChoiceTable(username, eventName) {
  let choiceSheet = ss.getSheetByName("CHOICE");
  let isChoiceExist = false;
  let target_choice_row = 0;

  // Check the choice table
  for (
    let y = CHOICE_TABLE.CHOICE_SHEET_START;
    y <= choiceSheet.getLastRow();
    y++
  ) {
    if (
      choiceSheet.getRange(y, CHOICE_TABLE.TABLE_CHOICE_NAME_IDX).getValue() ==
      username
    ) {
      target_choice_row = y;
      isChoiceExist = true;
      break;
    }
  }

  if (!isChoiceExist) {
    choiceSheet.appendRow([username, eventName]);
  } else {
    let target_choice_col = getRowDataLength(choiceSheet, target_choice_row);
    choiceSheet
      .getRange(target_choice_row, target_choice_col + 1)
      .setValue(eventName);
  }
}

function updateParticipateTable(username, eventName) {
  let participateSheet = ss.getSheetByName("PARTICIPATE");

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
}

function updateEventTable(eventName) {
  let eventSheet = ss.getSheetByName("EVENT");

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
        throw new Error(`No remaining spots for event ${eventName}`);
      }
      break;
    }
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
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // wait 30 seconds for others to finish

    removeEventFromChoiceTable(username, eventName);

    removeUserFromParticipateTable(username, eventName);

    updateEventTableOnCancel(eventName);

    return true;
  } catch (e) {
    console.error("Failed to acquire lock or error in processing:", e);
    return false;
  } finally {
    lock.releaseLock();
  }
}

function removeEventFromChoiceTable(username, eventName) {
  let choiceSheet = ss.getSheetByName("CHOICE");

  for (
    let y = CHOICE_TABLE.CHOICE_SHEET_START;
    y <= choiceSheet.getLastRow();
    y++
  ) {
    if (
      choiceSheet.getRange(y, CHOICE_TABLE.TABLE_CHOICE_NAME_IDX).getValue() ==
      username
    ) {
      let target_choice_col = getRowDataLength(choiceSheet, y);
      let selectedEvents = choiceSheet
        .getRange(y, 1, 1, target_choice_col)
        .getValues()[0];
      let updatedEvents = selectedEvents.filter((event) => event !== eventName);
      choiceSheet.getRange(y, 1, 1, target_choice_col).clearContent();
      choiceSheet
        .getRange(y, 1, 1, updatedEvents.length)
        .setValues([updatedEvents]);
      break;
    }
  }
}

function removeUserFromParticipateTable(username, eventName) {
  let participateSheet = ss.getSheetByName("PARTICIPATE");

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
      let workforceList = workforceListRange.getValue().split(" / ");
      let updatedWorkforceList = workforceList.filter(
        (user) => user !== username
      );
      workforceListRange.setValue(updatedWorkforceList.join(" / "));

      // Update the current number of workforce
      let currentWorkforceBlock = participateSheet.getRange(
        y,
        PARTICIPATE_TABLE.TABLE_PARTICIPATE_CURRENT_WORKFORCE_IDX
      );
      let currentWorkforceNum = Number(currentWorkforceBlock.getValue());
      currentWorkforceBlock.setValue(currentWorkforceNum - 1);
      break;
    }
  }
}

function updateEventTableOnCancel(eventName) {
  let eventSheet = ss.getSheetByName("EVENT");

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
}
