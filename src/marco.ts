class USER_TABLE {
  static readonly TABLE_USER_TIMESTAMP_COL_IDX = 1;
  static readonly TABLE_USER_NAME_COL_IDX = 2;
  static readonly TABLE_USER_STUDENTID_COL_IDX = 3;
  static readonly TABLE_USER_PHONE_COL_IDX = 4;
  static readonly TABLE_USER_EMAIL_COL_IDX = 5;
  static readonly TABLE_USER_PASSWORD_COL_IDX = 6;
}

class CURRENT_TABLE {
  static readonly TABLE_CURRENT_NAME_COL_IDX = 1;
  static readonly TABLE_CURRENT_STUDENTID_COL_IDX = 2;
  static readonly TABLE_CURRENT_CurrentLoginTime_COL_IDX = 3;
}

class VIEW_PAGE {
  static readonly VIEW_PAGE_LOGIN = "view/Login";
  static readonly VIEW_PAGE_PROFILE = "view/Profile";
  static readonly VIEW_PAGE_HOME = "view/Home";
  static readonly VIEW_PAGE_SELECT = "view/Select";
  static readonly VIEW_PAGE_WELCOME = "view/Welcome";
}

class EVENT_TABLE {
  static readonly EVENT_SHEET_START = 8;
  static readonly TABLE_EVENT_ID_IDX = 1;
  static readonly TABLE_EVENT_NAME_IDX = 2;
  static readonly TABLE_EVENT_TIME_IDX = 3;
  static readonly TABLE_EVENT_LOCATION_IDX = 4;
  static readonly TABLE_EVENT_WORKHOUR_IDX = 5;
  static readonly TABLE_EVENT_PEOPLE_IDX = 6;
  static readonly TABLE_EVENT_REMAIN_PEOPLE_IDX = 7;
  static readonly TABLE_EVENT_TOTAL_HOUR_IDX = 8;
  static readonly TABLE_EVENT_DESCRIPTION_IDX = 9;
}
