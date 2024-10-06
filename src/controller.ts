import { Include } from "./util";

function doGet(e) {
  let page = e.parameter.page || VIEW_PAGE.VIEW_PAGE_LOGIN;
  let template = HtmlService.createTemplateFromFile(page);
  template.message = "";
  // Add the Include css/js function to the template
  template.include = Include;
  return template
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  Logger.log(JSON.stringify(e));

  if (e.parameter.SignUpButton === "SignUp") {
    return SignUp(e);
  }

  if (e.parameter.LoginButton === "Login") {
    return Login(e);
  }

  if (e.parameter.LogoutButton === "Logout") {
    return Logout(e);
  }

  if (e.parameter.HomeButton === "Home") {
    return Home(e);
  }

  if (e.parameter.ProfileButton === "Profile") {
    return Profile(e);
  }

  if (e.parameter.SelectLearningButton === "SelectService") {
    return SelectService(e);
  }
}

function SignUp(e) {
  let {
    name: username,
    studentid: studentID,
    email,
    phone,
    password,
  } = e.parameter;

  saveUser(username, studentID, email, phone, password);

  // Redirect to login page with success message
  let htmlOutput = HtmlService.createTemplateFromFile(
    VIEW_PAGE.VIEW_PAGE_LOGIN
  );
  htmlOutput.message = "Account created successfully. Please log in.";
  htmlOutput.include = Include;
  return htmlOutput.evaluate();
}

function Login(e) {
  let htmlOutput;
  let { studentid: studentID, password } = e.parameter;

  if (checkLogin(studentID, password)) {
    let userDetails = getUserDetails(studentID);
    htmlOutput = HtmlService.createTemplateFromFile(
      VIEW_PAGE.VIEW_PAGE_WELCOME
    );
    Object.assign(htmlOutput, {
      username: userDetails.username,
      studentid: userDetails.studentID,
      email: userDetails.email,
      phone: userDetails.phone,
      message: "",
    });
    htmlOutput.include = Include;
    return htmlOutput.evaluate();
  } else {
    htmlOutput = HtmlService.createTemplateFromFile(VIEW_PAGE.VIEW_PAGE_LOGIN);
    htmlOutput.message = "Incorrect username or password.";
    htmlOutput.include = Include;
    return htmlOutput.evaluate();
  }
}

function Logout(e) {
  LogOutUserNow(e.parameter.username);
  let htmlOutput = HtmlService.createTemplateFromFile(
    VIEW_PAGE.VIEW_PAGE_LOGIN
  );
  htmlOutput.message = "You are logged out.";
  htmlOutput.include = Include;
  return htmlOutput.evaluate();
}

function Home(e) {
  let htmlOutput = HtmlService.createTemplateFromFile(
    VIEW_PAGE.VIEW_PAGE_WELCOME
  );
  Object.assign(htmlOutput, {
    username: e.parameter.username,
    studentid: e.parameter.studentid,
    message: "",
  });
  htmlOutput.include = Include;
  return htmlOutput.evaluate();
}

function Profile(e) {
  let userDetails = getUserDetails(e.parameter.studentid);
  let htmlOutput = HtmlService.createTemplateFromFile(
    VIEW_PAGE.VIEW_PAGE_PROFILE
  );
  Object.assign(htmlOutput, {
    username: e.parameter.username,
    studentid: e.parameter.studentid,
    email: userDetails.email,
    phone: userDetails.phone,
  });
  htmlOutput.include = Include;
  return htmlOutput.evaluate();
}

function SelectService(e) {
  let htmlOutput = HtmlService.createTemplateFromFile(
    VIEW_PAGE.VIEW_PAGE_SELECT
  );
  Object.assign(htmlOutput, {
    username: e.parameter.username,
    studentid: e.parameter.studentid,
    message: "",
  });
  htmlOutput.include = Include;
  return htmlOutput.evaluate();
}

function getUrl() {
  var url = ScriptApp.getService().getUrl();
  return url;
}
