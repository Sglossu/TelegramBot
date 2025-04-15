const token = '7166027587:AAFa6dtouQxmSof0-pgqj-Mp_Dp56baQbFU';
const SsId = '14rkiyGpd8fA7iQCrOw2W99AUn9Pf5BE9CpSEHkBBYUU';
const DebugSheetId = 547900033
const CommandsSheetId = 778712225
const ConsentSheetId = 1620595856
const QuestionsSheetId = 0
const LastColumnIndex = 8
const formattedDateTime = Utilities.formatDate(new Date(), "GMT+4", "dd.MM.yyyy HH:mm:ss");
const nameCommandHotWatter = '/hot_watter'
const firstDay = getSheetById(CommandsSheetId).getDataRange().getDisplayValues()[1][5];
const lastDay = getSheetById(CommandsSheetId).getDataRange().getDisplayValues()[1][6];
const ConsentUrl = 'https://drive.google.com/file/d/1Zf8rNxUyN2qJvYDJjmaCrFe2YqUnIM5s/view?usp=sharing'
const ChangeConsentOpinion = `Вы хотите изменить ответ на соглашение? Ознакомьтесь с документом: ${ConsentUrl}`
const ReedConsent = `📄 Для подачи показаний ГВС необходимо ознакомиться с соглашением:\n` +
    `🔗 ${ConsentUrl}\n\n` +
    `Ответьте "согласен" или "не согласен"`
const RefusalOfConsent = "❌ Вы отказались от согласия. Для подачи показаний ГВС необходимо дать согласие."
const Agree = 'согласен'
const DontArgee = 'не согласен'
const IndexColumnConsent = 3
const SuccessWrite = "✅ Ваши данные успешно сохранены!"
const InactivityTimeout = getSheetById(CommandsSheetId).getDataRange().getDisplayValues()[1][7];
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
    let webAppUrl = 'https://script.google.com/macros/s/AKfycbziCvrQ2UcOFtesaNwjYmCjTZ4nIc6FoaI1a_mHHxM1Iyb_FkvcvLEHl7jfcr7uyFRcPA/exec';
    let url =  `https://api.telegram.org/bot${token}/setWebhook?url=${webAppUrl}`;
    console.log(url);
    let resp = UrlFetchApp.fetch(url);
    console.log(resp.getContentText())
}

