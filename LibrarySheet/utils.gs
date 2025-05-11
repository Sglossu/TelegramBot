// заменить на SHEET_ID
function getSheetById(id) {
    return SpreadsheetApp.openById(SsId).getSheets().filter(
        function(s) {return s.getSheetId() === id }
    )[0]
}


function sendText(chat_id, text, keyBoard) {
    let data = {
        method: "post",
        payload: {
            method: "sendMessage",
            chat_id: String(chat_id),
            text: text,
            parse_mode: "HTML",
            reply_markup: JSON.stringify(keyBoard),
            link_preview_options: JSON.stringify({is_disabled: true})
        },
        muteHttpExceptions: true
    };
    return JSON.parse(UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data));
}