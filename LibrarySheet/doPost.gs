function doPost(e) {
    let contents = JSON.parse(e.postData.contents);
    let text = contents.message.text;
    let username = contents.message.chat.first_name;
    let chat_id = contents.message.chat.id;

    if (text !== '/start') {
        let resultValidate = validateHotWatterDate();
        if (resultValidate !== true) {
            sendText(chat_id, resultValidate);
            return;
        }
    }


    try {
        if ((/^\//.exec(text))) {
            answerCommand(text, username, contents);
        }
        else {
            fillTable(contents)
        }
    }
    catch (err) {
        Logger = BetterLog.useSpreadsheet(SsId);
        err = (typeof err === 'string') ? new error(err) : err;
        Logger.log('%s: %s (line %s, file "%s"). Stack: "%s" . While processing %s.', err.name || '',
            err.message || '', err.lineNumber || '', err.fullName || '', '');
    }
}






