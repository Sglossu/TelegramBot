
const TOKEN = Config.TOKEN;
const SHEET_ID = Config.SHEET_ID;
const WEBAPP_URL = Config.WEBAPP_URL;
const DEBUG_SHEET_ID = Config.DEBUG_SHEET_ID
const COMMANDS_SHEET_ID = Config.COMMANDS_SHEET_ID
const QUESTIONS_SHEET_ID = Config.QUESTIONS_SHEET_ID
const LAST_COLOUMN_INDEX = Config.LAST_COLOUMN_INDEX
const NAME_COMMAND_HOT_WATTER = Config.NAME_COMMAND_HOT_WATTER
const NAME_COMMAND_PROFILE_DATA = Config.NAME_COMMAND_PROFILE_DATA
const CONSENT_URL = Config.CONSENT_URL
const REED_CONSENT_TEXT = Config.REED_CONSENT_TEXT + `${CONSENT_URL}\n\n` + Config.TEXT_ANSWER_AGREE_OR_NOT
const REFUSAL_OF_CONSENT = Config.REFUSAL_OF_CONSENT
const AGREE_COMMAND = Config.AGREE_COMMAND
const DONT_AGREE_COMMAND = Config.DONT_AGREE_COMMAND
const SUCCESS_WRITE = Config.SUCCESS_WRITE
const RESTART_COMMAND = Config.RESTART_COMMAND;
const CONTINUE_COMMAND = Config.CONTINUE_COMMAND;
const TIMEOUT_TEXT = "Прошло слишком много времени с последнего ответа. Хотите продолжить заполнение или начать сначала?"

const LAST_DAY = getSheetById(COMMANDS_SHEET_ID).getDataRange().getDisplayValues()[1][Config.LAST_DAY_COLOUMN];
const FIRST_DAY = getSheetById(COMMANDS_SHEET_ID).getDataRange().getDisplayValues()[1][Config.FIRST_DAY_COLOUMN];
const INACTIVITY_TIMEOUT = getSheetById(COMMANDS_SHEET_ID).getDataRange().getDisplayValues()[1][Config.INACTIVITY_TIMEOUT_CLOUMN];

const formattedDateTime = Utilities.formatDate(new Date(), "GMT+4", "dd.MM.yyyy HH:mm:ss");
const sheetCommand = getSheetById(COMMANDS_SHEET_ID).getDataRange().getDisplayValues();
let TEXT_HOT_WATTER = sheetCommand.find(row => row.some(cell => cell === NAME_COMMAND_HOT_WATTER))[1];
let TEXT_FILL_OR_CHANGE_PROFILE = sheetCommand.find(row => row.some(cell => cell === NAME_COMMAND_PROFILE_DATA))[1];
let TEXT_START = sheetCommand.find(row => row.some(cell => cell === Config.NAME_COMMAND_START))[1];



let START_KEYBOARD = {
    "keyboard": [
        [{"text": TEXT_HOT_WATTER},],
        [{"text": TEXT_FILL_OR_CHANGE_PROFILE},]
    ],
    "resize_keyboard": true,
    "one_time_keyboard": true,
    // "input_field_placeholder": TEXT_HOT_WATTER,
    "remove_keyboard": true
}

let ADMIN_START_KEYBOARD = {
    "keyboard": [
        [{"text": TEXT_HOT_WATTER},],
        [{"text": TEXT_FILL_OR_CHANGE_PROFILE},],
        [{"text": Config.ADMIN_COMMAND_GET_ALL_MONTH_DATA},],
        [{"text": Config.ADMIN_COMMAND_GET_FLAT_DATA},],
    ],
    "resize_keyboard": true,
    "one_time_keyboard": true,
    // "input_field_placeholder": TEXT_HOT_WATTER,
    "remove_keyboard": true
}

let AGREE_KEYBOARD = {
    "keyboard": [
        [{"text": AGREE_COMMAND}, {"text": DONT_AGREE_COMMAND}]
    ],
    "resize_keyboard": true,
    "one_time_keyboard": true,
    "remove_keyboard": true
}

let RESTART_CONTINUE_KEYBOARD = {
    "keyboard": [
        [{"text": RESTART_COMMAND}, {"text": CONTINUE_COMMAND}]
    ],
    "resize_keyboard": true,
    "one_time_keyboard": true,
    "remove_keyboard": true
}

let PROFILE_DATA_KEYBOARD = {
    "keyboard": [
        [{"text": "ФИО"}, {"text": "Номер квартиры"}],
        [{"text": "Номер телефона"}, {"text": "Электронная почта"}]
    ],
    "resize_keyboard": true,
    "one_time_keyboard": true,
    "remove_keyboard": true
}

let YES_NO_KEYBOARD = {
    "keyboard": [
        [{"text": Config.CHANGE_PROFILE_DATA}, {"text": Config.DONT_CHANGE_PROFILE_DATA}],
    ],
    "resize_keyboard": true,
    "one_time_keyboard": true,
    "remove_keyboard": true
}

function start() {
    let url =  `https://api.telegram.org/bot${TOKEN}/setWebhook?url=${WEBAPP_URL}`;
    console.log(url);

    const payload = {
        url: url,
        allowed_updates: ["message", "callback_query", "my_chat_member"]
    };

    let resp = UrlFetchApp.fetch(url, {
        method: "post",
        payload: payload
    });
    console.log(resp.getContentText())
}