function doGet(e) {
  if (!e.parameter.page) {
    var x = HtmlService.createTemplateFromFile("Login");
    x.message = "";
    var y = x.evaluate();
    var z = y.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return z;
  }
  return HtmlService.createTemplateFromFile(e.parameter["page"])
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  Logger.log(JSON.stringify(e));

  if (e.parameter.SignUpButton == "SignUp") {
    var username = e.parameter.name;
    var studentID = e.parameter.studentid;
    var email = e.parameter.email;
    var phone = e.parameter.phone;
    var password = e.parameter.password;

    // Save these details in Google Sheet "NEW" and "USER"
    // var newSheet = ss.getSheetByName("NEW");
    // var userSheet = ss.getSheetByName("USER");
    // newSheet.appendRow([new Date(), username, studentID, email, phone, password]);
    // userSheet.appendRow([username, studentID, password]);

    // Redirect to login page with success message
    var htmlOutput = HtmlService.createTemplateFromFile("Login");
    htmlOutput.message = "Account created successfully. Please log in.";
    return htmlOutput.evaluate();
  }

  if (e.parameter.LoginButton == "Login") {
    var username = e.parameter.username;
    var password = e.parameter.password;
    var studentID = e.parameter.studentid;

    var checkanswer = checkLogin(username, studentID, password);
    if (checkanswer == "TRUE") {
      var userDetails = getUserDetails(username, studentID);
      var htmlOutput = HtmlService.createTemplateFromFile("Welcome");
      htmlOutput.username = username;
      htmlOutput.studentid = studentID;
      htmlOutput.email = userDetails.email;
      htmlOutput.phone = userDetails.phone;
      htmlOutput.message = "";
      return htmlOutput.evaluate();
    } else {
      var htmlOutput = HtmlService.createTemplateFromFile("Login");
      htmlOutput.message = "Enter the wrong username or password.";
      return htmlOutput.evaluate();
    }
  }

  if (e.parameter.LogoutButton == "Logout") {
    LogOutUserNow(e.parameter.username);
    var htmlOutput = HtmlService.createTemplateFromFile("Login");
    htmlOutput.message = "You are logged out";
    return htmlOutput.evaluate();
  }

  if (e.parameter.HomeButton == "Home") {
    var htmlOutput = HtmlService.createTemplateFromFile("Welcome");
    htmlOutput.username = e.parameter.username;
    htmlOutput.studentid = e.parameter.studentid;
    htmlOutput.message = "";
    return htmlOutput.evaluate();
  }

  if (e.parameter.ProfileButton == "Profile") {
    var userDetails = getUserDetails(
      e.parameter.username,
      e.parameter.studentid
    );
    var htmlOutput = HtmlService.createTemplateFromFile("Profile");
    htmlOutput.username = e.parameter.username;
    htmlOutput.studentid = e.parameter.studentid;
    htmlOutput.email = userDetails.email;
    htmlOutput.phone = userDetails.phone;
    return htmlOutput.evaluate();
  }

  if (e.parameter.SelectLearningButton == "SelectService") {
    var htmlOutput = HtmlService.createTemplateFromFile("Select");
    htmlOutput.username = e.parameter.username;
    htmlOutput.studentid = e.parameter.studentid;
    htmlOutput.message = "";
    return htmlOutput.evaluate();
  }
}

// Retrieve user details from NEW sheet
function getUserDetails(username, studentID) {
  var sheet = ss.getSheetByName("NEW");
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][1] == username && data[i][2] == studentID) {
      return {
        email: data[i][3],
        phone: data[i][4],
      };
    }
  }
  return null; // If no match is found
}

function getUrl() {
  var url = ScriptApp.getService().getUrl();
  return url;
}

var ss = SpreadsheetApp.openById(
  "1hCvdfplDCTa25tP7MfRDAIKYWKjEwjCqPVwDqKJC8Q0"
);

function checkLogin(username, studentID, password) {
  var usernamesheet = ss.getSheetByName("USER");
  var currentsheet = ss.getSheetByName("CURRENT");
  var usernameLastRow = usernamesheet.getLastRow();
  var currentLastRow = currentsheet.getLastRow();
  var found_record = "";

  // Prevent empty login
  if (username == "" || studentID == "" || password == "") {
    return "FALSE";
  }

  for (var y = 2; y <= currentLastRow; y++) {
    if (currentsheet.getRange(y, 1).getValue() == username) {
      found_record = "TRUE";
      var d = new Date();
      currentsheet.getRange(y, 2).setValue(d);
    }
  }
  if (found_record == "") {
    for (var i = 2; i <= usernameLastRow; i++) {
      if (
        usernamesheet.getRange(i, 1).getValue() == username &&
        usernamesheet.getRange(i, 2).getValue() == studentID &&
        usernamesheet.getRange(i, 3).getValue() == password
      ) {
        found_record = "TRUE";
        currentsheet.appendRow([username, new Date()]);
      }
    }
  }
  if (found_record == "") {
    found_record = "FALSE";
  }
  return found_record;
}

function LogOutUserNow(username) {
  var currentsheet = ss.getSheetByName("CURRENT");
  var currentLastRow = currentsheet.getLastRow();
  for (var y = 2; y <= currentLastRow; y++) {
    if (currentsheet.getRange(y, 1).getValue() == username) {
      currentsheet.getRange(y, 3).setValue("X");
    }
  }
  for (var y = 2; y <= currentLastRow; y++) {
    if (currentsheet.getRange(y, 3).getValue() == "X") {
      currentsheet.deleteRow(y);
    }
  }
}

function LogOutUser() {
  var currentsheet = ss.getSheetByName("CURRENT");
  var currentLastRow = currentsheet.getLastRow();
  var ThirtyMinutesAgo = new Date(Date.now() - 30000 * 60);
  for (var y = 2; y <= currentLastRow; y++) {
    if (currentsheet.getRange(y, 2).getValue() < ThirtyMinutesAgo) {
      currentsheet.getRange(y, 3).setValue("X");
    }
  }
  for (var y = 2; y <= currentLastRow; y++) {
    if (currentsheet.getRange(y, 3).getValue() == "X") {
      currentsheet.deleteRow(y);
    }
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function userClicked(userData) {
  var ws = ss.getSheetByName("NEW");
  var usernamesheet = ss.getSheetByName("USER");

  if (
    userData.userName == "" ||
    userData.userStudentID == "" ||
    userData.userEmail == "" ||
    userData.userPhone == "" ||
    userData.userPassword == ""
  ) {
    return "Some field is empty.";
  }

  for (var y = 2; y <= usernamesheet.getLastRow(); y++) {
    if (usernamesheet.getRange(y, 2).getValue() == userData.userStudentID) {
      return "FALSE";
    }
  }

  ws.appendRow([
    new Date(),
    userData.userName,
    userData.userStudentID,
    userData.userEmail,
    userData.userPhone,
    userData.userPassword,
  ]);
  usernamesheet.appendRow([
    userData.userName,
    userData.userStudentID,
    userData.userPassword,
  ]);

  return "TRUE";
}

function getSheetData() {
  var eventSheet = ss.getSheetByName("EVENT");
  var eventLastRow = eventSheet.getLastRow();
  var y_group = 8;
  var y_events = 1;
  var data = {};

  while (y_group < eventLastRow) {
    if (eventSheet.getRange(y_group, 1).getValue() == "X") {
      data[eventSheet.getRange(y_group + 1, 1).getValue()] = {};
    }

    while (eventSheet.getRange(y_group + y_events + 1, 1).getValue() != "X") {
      var tmp_ct = y_group + y_events + 1;
      var eventName = eventSheet.getRange(tmp_ct, 2).getValue();

      data[eventSheet.getRange(y_group + 1, 1).getValue()][eventName] = {
        活動支援時間: eventSheet.getRange(tmp_ct, 3).getValue(),
        "工作地點(校區/地點)": eventSheet.getRange(tmp_ct, 4).getValue(),
        "工作時數(時)": Number(eventSheet.getRange(tmp_ct, 5).getValue()),
        "人數需求上限(人)": Number(eventSheet.getRange(tmp_ct, 6).getValue()),
        目前餘額: Number(eventSheet.getRange(tmp_ct, 7).getValue()),
        服務總時數: Number(eventSheet.getRange(tmp_ct, 8).getValue()),
        備註說明: eventSheet.getRange(tmp_ct, 9).getValue(),
      };
      y_events++;
    }
    y_group = y_group + y_events + 1;
    y_events = 1;
  }
  console.log(data);
  return data;
}

function readPersonalInfo(username) {
  var newSheet = ss.getSheetByName("NEW");
  var newLastRow = newSheet.getLastRow();
  var personalInfo = [];

  for (var y = 2; y <= newLastRow; y++) {
    if (newSheet.getRange(y, 2) == username) {
      personalInfo.push(newSheet.getRange(y, 3));
      personalInfo.push(newSheet.getRange(y, 4));
      personalInfo.push(newSheet.getRange(y, 5));
    }
    break;
  }
  console.log(personalInfo);
  return personalInfo;
}

function getEventInfo(eventName) {
  var eventSheet = ss.getSheetByName("EVENT");
  var eventLastRow = eventSheet.getLastRow();
  var eventInfo = [];

  // 活動名稱
  eventInfo.push(eventName);
  for (var y = 10; y <= eventLastRow; y++) {
    if (eventSheet.getRange(y, 2).getValue() == eventName) {
      // 活動支援時間
      eventInfo.push(eventSheet.getRange(y, 3).getValue());
      // 工作地點(校區/地點)
      eventInfo.push(eventSheet.getRange(y, 4).getValue());
      // 工作時數(時)
      eventInfo.push(Number(eventSheet.getRange(y, 5).getValue()));
      // 備註說明
      eventInfo.push(eventSheet.getRange(y, 9).getValue());
      break;
    }
  }
  return eventInfo;
}

function eventConfirmClicked(username, eventName) {
  var choiceSheet = ss.getSheetByName("CHOICE");
  var appendCol = 0;
  var exist = "FALSE";

  var choiceSheet2 = ss.getSheetByName("CHOICE2");
  var choice2LastRow = choiceSheet2.getLastRow();

  var eventSheet = ss.getSheetByName("EVENT");
  var eventLastRow = eventSheet.getLastRow();

  for (var y = 2; y <= choiceSheet.getLastRow(); y++) {
    if (choiceSheet.getRange(y, 1).getValue() == username) {
      appendCol = getRowDataLength(choiceSheet, y) + 1;
      choiceSheet.getRange(y, appendCol).setValue(eventName);
      exist = "TRUE";
      break;
    }
  }
  if (exist == "FALSE") {
    choiceSheet.appendRow([username, eventName]);
  }

  for (var y = 3; y <= choice2LastRow; y++) {
    if (choiceSheet2.getRange(y, 2).getValue() == eventName) {
      if (choiceSheet2.getRange(y, 7).getValue() != "") {
        choiceSheet2
          .getRange(y, 7)
          .setValue(choiceSheet2.getRange(y, 7).getValue() + " / " + username);
      } else {
        choiceSheet2.getRange(y, 7).setValue(username);
      }
      break;
    }
  }

  for (var y = 10; y <= eventLastRow; y++) {
    if (eventSheet.getRange(y, 2).getValue() == eventName) {
      eventSheet
        .getRange(y, 7)
        .setValue(Number(eventSheet.getRange(y, 7).getValue()) - 1);
    }
  }
}

function getRowDataLength(sheet, rowNumber) {
  // Get the data in the specified row
  var rowData = sheet
    .getRange(rowNumber, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  // Filter out the empty cells and count the number of non-empty cells
  var dataLength = rowData.filter(String).length;

  return dataLength;
}

function getDisabledOptions() {
  var eventSheet = ss.getSheetByName("EVENT");
  var eventLastRow = eventSheet.getLastRow();
  let disableItem = [];

  for (var y = 10; y <= eventLastRow; y++) {
    if (eventSheet.getRange(y, 7).getValue() == "0") {
      disableItem.push(eventSheet.getRange(y, 2).getValue());
    }
  }

  return disableItem;
}

function getEnabledOptions() {
  var eventSheet = ss.getSheetByName("EVENT");
  var eventLastRow = eventSheet.getLastRow();
  let enableItem = [];

  for (var y = 10; y <= eventLastRow; y++) {
    if (eventSheet.getRange(y, 7).getValue() != "0") {
      enableItem.push(eventSheet.getRange(y, 2).getValue());
    }
  }

  return enableItem;
}

function WriteServiceTable(username) {
  var choiceSheet = ss.getSheetByName("CHOICE");
  var eventSheet = ss.getSheetByName("EVENT");
  let eventsData = {};
  var rowLength = 0;

  for (var y = 2; y <= choiceSheet.getLastRow(); y++) {
    if (choiceSheet.getRange(y, 1).getValue() == username) {
      rowLength = getRowDataLength(choiceSheet, y);

      for (var col = 2; col <= rowLength; col++) {
        for (var y2 = 10; y2 <= eventSheet.getLastRow(); y2++) {
          if (
            eventSheet.getRange(y2, 2).getValue() ==
            choiceSheet.getRange(y, col).getValue()
          ) {
            eventsData[choiceSheet.getRange(y, col).getValue()] = {
              time: eventSheet.getRange(y2, 3).getValue(),
              place: eventSheet.getRange(y2, 4).getValue(),
              hours: eventSheet.getRange(y2, 5).getValue(),
              note: eventSheet.getRange(y2, 9).getValue(),
            };
            break;
          }
        }
      }

      break;
    }
  }

  return eventsData;
}
