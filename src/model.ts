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

  // login
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
        currentsheet.appendRow([username, studentID, new Date()]);
        break;
      }
    }
  }

  return isFound ? true : false;
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

function getSheetData() {
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
