function handleGetAllMonthDataCommand(user) {
    if (!UserService.isAdmin(user)) {
        sendText(user.chat_id, Config.TEXT_NOT_PERMISSION);
        return;
    }

    fillLastCommandTable(user, "/get_all_month_data");
    sendText(user.chat_id, "Введите месяц в числовом формате и год полностью");
}

function handleGetAllMonthDataLastCommand(user, message) {
    if (!UserService.isAdmin(user)) {
        sendText(user.chat_id, Config.TEXT_NOT_PERMISSION);
        return;
    }

    let validate = Validate.validateMonthYear(message);
    if (validate !== true) {
        sendText(user.chat_id, validate);
        return;
    }

    let [month, year] = message.split(' ');
    month = parseInt(month);
    year = parseInt(year);
    if (reportService.generateAndSendReportMonthData(month, year, user.chat_id, Config.ALL_MONTH_DATA_SHEET_ID)) {
        fillLastCommandTable(user, null);
    };
}

function handleGetFlatDataCommand(user) {
    if (!UserService.isAdmin(user)) {
        sendText(user.chat_id, Config.TEXT_NOT_PERMISSION);
        return;
    }

    fillLastCommandTable(user, "/get_hot_watter_by_flat");
    sendText(user.chat_id, "Введите номер квартиры");
}

function handleGetFlatDataLastCommand(user, message) {
    if (!UserService.isAdmin(user)) {
        sendText(user.chat_id, Config.TEXT_NOT_PERMISSION);
        return;
    }

    let validate = Validate.isValidInteger(message);
    if (validate !== true) {
        sendText(user.chat_id, "Ошибка: значение должно быть целым числом");
        return;
    }

    if (reportService.generateAndSendReportOneFlatData(message, user.chat_id, Config.HOT_WATTER_BY_FLAT_SHEET_ID)) {
        fillLastCommandTable(user, null);
    };

}
