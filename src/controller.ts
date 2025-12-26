// import { Include, TemplateWithNavBar } from "./util";

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
    let data = {
      username: userDetails.username,
      studentid: userDetails.studentID,
      email: userDetails.email,
      phone: userDetails.phone,
    };
    let navbar_data = {
      username: userDetails.username,
      studentid: userDetails.studentID,
    };
    let template = TemplateWithNavBar(
      VIEW_PAGE.VIEW_PAGE_WELCOME,
      data,
      navbar_data
    );

    return template.evaluate();
  } else {
    htmlOutput = HtmlService.createTemplateFromFile(VIEW_PAGE.VIEW_PAGE_LOGIN);
    htmlOutput.message = "Incorrect username or password.";
    htmlOutput.include = Include;
    return htmlOutput.evaluate();
  }
}

function Logout(e) {
  let htmlOutput = HtmlService.createTemplateFromFile(
    VIEW_PAGE.VIEW_PAGE_LOGIN
  );
  htmlOutput.message = "You are logged out.";
  htmlOutput.include = Include;
  return htmlOutput.evaluate();
}

function Home(e) {
  let data = {
    username: e.parameter.username,
    studentid: e.parameter.studentid,
  };
  let navbar_data = {
    username: e.parameter.username,
    studentid: e.parameter.studentid,
  };
  let template = TemplateWithNavBar(
    VIEW_PAGE.VIEW_PAGE_WELCOME,
    data,
    navbar_data
  );
  return template.evaluate();
}

function Profile(e) {
  let userDetails = getUserDetails(e.parameter.studentid);
  let data = {
    username: e.parameter.username,
    studentid: e.parameter.studentid,
    email: userDetails.email,
    phone: userDetails.phone,
  };
  let navbar_data = {
    username: e.parameter.username,
    studentid: e.parameter.studentid,
  };
  let template = TemplateWithNavBar(
    VIEW_PAGE.VIEW_PAGE_PROFILE,
    data,
    navbar_data
  );
  return template.evaluate();
}

function SelectService(e) {
  let template;
  if (canChooseCourse()) {
    let data = {
      username: e.parameter.username,
    };
    let navbar_data = {
      username: e.parameter.username,
      studentid: e.parameter.studentid,
    };
    template = TemplateWithNavBar(
      VIEW_PAGE.VIEW_PAGE_SELECT,
      data,
      navbar_data
    );
  }else{
    let data = {
      username: e.parameter.username,
    };
    let navbar_data = {
      username: e.parameter.username,
      studentid: e.parameter.studentid,
    };
    template = TemplateWithNavBar(
      VIEW_PAGE.VIEW_PAGE_WELCOME,
      data,
      navbar_data
  }
  return template.evaluate();
}
