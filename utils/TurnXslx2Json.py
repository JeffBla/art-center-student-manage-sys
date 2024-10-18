import json
import pandas as pd
from datetime import datetime


def RowStrHandler(row_element):
    if pd.isna(row_element):
        return None
    elif isinstance(row_element, int):
        return row_element
    elif isinstance(row_element, str):
        if row_element.isdigit():
            return int(row_element)
        return row_element.replace('\n', '').replace("/", "-")
    elif isinstance(row_element, datetime):
        return row_element.strftime("%Y-%m-%d %H:%M:%S")


def UserTransformation(df):
    result = {}
    colName = df.keys()
    for _, row in df.iterrows():
        userId = row["Student ID"]
        result[userId] = row.to_dict()
    return result


def CurrentTransformation(df):
    result = {}
    colName = df.keys()
    for _, row in df.iterrows():
        row = list(map(RowStrHandler, row))
        userName = row[0]
        result[userName] = {
            colName[i]: row[i] if pd.notna(row[i]) else None
            for i in range(1, len(row))
        }
    return result


def EventTransformation(df):
    result = {}
    colname = [x.replace('\n', '').replace('/', '-') for x in df.iloc[0]]

    category = None
    for _, row in df.iterrows():
        row = list(map(RowStrHandler, row))
        if category is not None and pd.notna(
                row[1]) and row[1] != 'X' and isinstance(row[0], int):
            event_name = row[1]
            event_data = {
                "id": int(row[0]),
                colname[1]: event_name,
                colname[2]: row[2],
                colname[3]: row[3],
                colname[4]: row[4],
                colname[5]: row[5],
                colname[6]: row[6],
                colname[7]: row[7],
                colname[8]: row[8] if pd.notna(row[8]) else None
            }

            result[category][event_name] = event_data
        elif pd.notna(row[0]) and pd.isna(row[1]):
            # It is a category
            category = row[0]
            result[category] = {}

    return result


def ParticipateTransformation(df):
    result = {}
    colName = ["id", "活動名稱"] + list(df.iloc[0][2:])
    catagroy = None
    for _, row in df.iterrows():
        row = list(map(RowStrHandler, row))
        if pd.notna(row[1]) and row[1] != 'X':
            event_name = row[1]
            participate_data = {
                colName[0]: int(row[0]),
                colName[1]: event_name,
                colName[2]: row[2],
                colName[3]: row[3] if pd.notna(row[3]) else None,
            }

            result[catagroy][event_name] = participate_data
        elif pd.notna(row[0]) and pd.isna(row[1]):
            catagroy = row[0]
            result[catagroy] = {}
    return result


def ChoiceTransformation(df):
    result = {}
    colName = df.keys()
    for _, row in df.iterrows():
        row = list(map(RowStrHandler, row))
        userName = row[0]
        result[userName] = {colName[i]: row[i] for i in range(1, len(row))}
    return result


if __name__ == "__main__":
    raw_data = pd.read_excel("./data/refined- 藝術中心服務學習系統.xlsx",
                             sheet_name=None)
    user_data = UserTransformation(raw_data['USER'])
    current_data = CurrentTransformation(raw_data['CURRENT'])
    event_data = EventTransformation(raw_data['EVENT'])
    participate_data = ParticipateTransformation(raw_data['PARTICIPATE'])
    choice_data = ChoiceTransformation(raw_data['CHOICE'])

    # Transform the data
    transformed_data = {
        "USER": user_data,
        "CURRENT": current_data,
        "EVENT": event_data,
        "PARTICIPATE": participate_data,
        "CHOICE": choice_data,
    }

    # Write the transformed data to a new file
    with open("./data/firebase_import_data.json", "w",
              encoding="utf-8") as file:
        json.dump(transformed_data, file, ensure_ascii=False, indent=2)

    print("Data prepared for Firebase import.")
