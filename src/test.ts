var ss = SpreadsheetApp.openById(
  "1O-QhQeZRuKTiXXQ05waU_eYZ0_8PoNi24-jTSVr13Iw"
);

function TestFunc() {
  let usersheet = ss.getSheetByName("CURRENT");
  let data = usersheet.getDataRange().getValues();
  console.log(data[1][1]);
}
