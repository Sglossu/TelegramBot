function getSheetById(id) {
    return SpreadsheetApp.openById(SHEET_ID).getSheets().filter(
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


function answerCommand(command, username, contents) {
    let sheetCommand = getSheetById(COMMANDS_SHEET_ID).getDataRange().getDisplayValues();
    let row = SHEET_COMMAND.find(row => row.some(cell => cell === command));
    let chat_id = contents.message.chat.id;

    if (row == undefined) {
        sendText(chat_id, `Команда ${command} не найдена`);
        return;
    }

    if (command === '/start') {
        let textStart = row[1];
        let answer = `Здравствуйте, ${username}!\n\n${textStart}`;
        sendText(chat_id, answer, START_KEYBOARD);
        return
    }
    else if (command === '/hot_watter') {
        let resultValidate = validateHotWatterDate();
        if (resultValidate !== true) {
            sendText(chat_id, resultValidate);
            return;
        }

        let lastRow = sheetCommand.length;
        if (lastRow > 2) {
            fillTable(contents);
        }
        else {
            return false;
        }
    }
}
