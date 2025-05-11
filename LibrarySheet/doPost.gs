function doPost(e) {
    let contents = JSON.parse(e.postData.contents);
    let text = contents.message.text;
    let username = contents.message.chat.first_name;
    let chat_id = contents.message.chat.id;

    if (text === '/hot_watter' || text === 'Подать показания ГВС') {
        let resultValidate = Validate.validateHotWatterDate();
        if (resultValidate !== true) {
            sendText(chat_id, resultValidate);
            return;
        }
    }


    try {
        if (Config.COMMANDS.includes(text)) {
            answerCommand(text, username, contents);
        }
        else {
            parceAnswer(contents)
        }
    }
    catch (err) {
        Logger = BetterLog.useSpreadsheet(SHEET_ID);
        err = (typeof err === 'string') ? new error(err) : err;
        Logger.log('%s: %s (line %s, file "%s"). Stack: "%s" . While processing %s.', err.name || '',
            err.message || '', err.lineNumber || '', err.fullName || '', '');
    }
}







