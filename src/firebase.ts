var FIREBASE_PROJECT_ID = "art-center-service-learning";
var FIREBASE_API_KEY = "AIzaSyB7XRmpSvHD6eZ0gYRzN7IoNp4I7XL7o_E";
var FIREBASE_URL =
  "https://art-center-service-learning-default-rtdb.asia-southeast1.firebasedatabase.app/";

function getFirebaseUrl(path) {
  return FIREBASE_URL + path + ".json?auth=" + FIREBASE_API_KEY;
}

function fetchFromFirebase(path) {
  var url = getFirebaseUrl(path);
  var response = UrlFetchApp.fetch(url);
  return JSON.parse(response.getContentText());
}

function writeToFirebase(path, data) {
  var url = getFirebaseUrl(path);
  var options = {
    method: "put",
    contentType: "application/json",
    payload: JSON.stringify(data),
  };
  UrlFetchApp.fetch(url, options);
}

function updateFirebase(path, data) {
  var url = getFirebaseUrl(path);
  var options = {
    method: "patch",
    contentType: "application/json",
    payload: JSON.stringify(data),
  };
  UrlFetchApp.fetch(url, options);
}

function deleteFromFirebase(path) {
  var url = getFirebaseUrl(path);
  var options = {
    method: "delete",
  };
  UrlFetchApp.fetch(url, options);
}
