const token = getConfig('TOKEN');
const SsId = getConfig('SS_ID');
const webAppUrl = getConfig('webAppUrl');
const DebugSheetId = getConfig('DebugSheetId')
const CommandsSheetId = getConfig('CommandsSheetId')
const QuestionsSheetId = getConfig('QuestionsSheetId')
const LastColumnIndex = getConfig('LastColumnIndex')
const formattedDateTime = Utilities.formatDate(new Date(), "GMT+4", "dd.MM.yyyy HH:mm:ss");
const nameCommandHotWatter = getConfig('nameCommandHotWatter')
const firstDay = getSheetById(CommandsSheetId).getDataRange().getDisplayValues()[1][getConfig('firstDay')];
const lastDay = getSheetById(CommandsSheetId).getDataRange().getDisplayValues()[1][getConfig('lastDay')];
const ConsentUrl = getConfig('ConsentUrl')
const ReedConsent = `📄 Для подачи показаний необходимо ознакомиться с соглашением:\n` +
    `🔗 ${ConsentUrl}\n\n` +
    `Ответьте "согласен" или "не согласен"`
const RefusalOfConsent = "❌ Вы отказались от согласия. Для подачи показаний необходимо дать согласие."
const Agree = 'согласен'
const DontArgee = 'не согласен'
const SuccessWrite = "✅ Ваши данные успешно сохранены!"
const InactivityTimeout = getSheetById(CommandsSheetId).getDataRange().getDisplayValues()[1][getConfig('TOKEN')];
const RestartCommand = "начать сначала";
const ContinnueCommand = "продолжить";
const TimeoutText = "Прошло слишком много времени с последнего ответа. Хотите продолжить заполнение или начать сначала?"


const sheetCommand = getSheetById(CommandsSheetId).getDataRange().getDisplayValues();
let text_hot_watter = sheetCommand.find(row => row.some(cell => cell === nameCommandHotWatter))[1];

let START_KEYBOARD = {
    "keyboard": [
        [{"text": text_hot_watter},]
    ],
    "resize_keyboard": true,
    "one_time_keyboard": true,
    "input_field_placeholder": text_hot_watter,
    "remove_keyboard": true
}

let AGREE_KEYBOARD = {
    "keyboard": [
        [{"text": Agree}, {"text": DontArgee}]
    ],
    "resize_keyboard": true,
    "one_time_keyboard": true,
    "remove_keyboard": true
}

let RESTART_CONTINUE_KEYBOARD = {
    "keyboard": [
        [{"text": RestartCommand}, {"text": ContinnueCommand}]
    ],
    "resize_keyboard": true,
    "one_time_keyboard": true,
    "remove_keyboard": true
}

function start() {
    let url =  `https://api.telegram.org/bot${token}/setWebhook?url=${webAppUrl}`;
    console.log(url);
    let resp = UrlFetchApp.fetch(url);
    console.log(resp.getContentText())
}

