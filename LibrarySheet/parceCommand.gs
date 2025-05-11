function answerCommand(command, username, contents) {
    const chat_id = contents.message.chat.id;
    const telegram_nick = contents.message.chat.username;

    let user = UserService.createIfNotExists(chat_id, telegram_nick, null);


    switch (command) {
        case '/start':
            fillLastCommandTable(user, command);
            handleStartCommand(user, username);
            break;

        case '/hot_watter':
        case TEXT_HOT_WATTER:
            fillLastCommandTable(user, '/hot_watter');
            handleHotWaterCommand(user, telegram_nick, contents);
            break;

        case '/profile_data':
        case TEXT_FILL_OR_CHANGE_PROFILE:
            fillLastCommandTable(user, "/profile_data");
            handleProfileDataCommand(user, chat_id);
            break;

        case Config.ADMIN_COMMAND_GET_ALL_MONTH_DATA:
            handleGetAllMonthDataCommand(user);
            break;

        case Config.ADMIN_COMMAND_GET_FLAT_DATA:
            handleGetFlatDataCommand(user);
            break;

        default:
            sendText(chat_id, `Команда ${command} не поддерживается`);
    }
};

function fillLastCommandTable(user, command) {
    LastCommandService.updateLastCommand(user.id, command);
};


// Пользователь написал команду /start
function handleStartCommand(user, username) {
    if (UserService.isAdmin(user)) {

    }
    keyboard = UserService.isAdmin(user) ? ADMIN_START_KEYBOARD : START_KEYBOARD
    const text = `Здравствуйте, ${username}!\n\n${TEXT_START}`;
    sendText(user.chat_id, text, keyboard);
}


// Пользователь написал команду /hot_watter
function handleHotWaterCommand(user, telegram_nick, contents) {
    // Проверка даты
    let validationResult = Validate.validateHotWatterDate();
    if (validationResult !== true) {
        sendText(user.chat_id, validationResult);
        return;
    }

    // Проверка заполненности профиля
    let profile = UserService.checkFillProfile(user);
    if (!profile) {
        sendText(user.chat_id, "Для подачи показаний нужно сначала заполнить данные профиля");
        UserService.createProfileDate(user);
        return;
    }
    if (HotWaterService.checkExistCurrentMonth(user)) {
        sendText(user.chat_id, `Вы уже подавали показания в этом месяце.`);
        LastCommandService.updateLastCommand(user.id, null);
        return;
    }
    sendText(user.chat_id, "Напишите показание ГВС целым числом на сегодняшний день. Показание должно быть не меньше чем в прошлом месяце.");
}


// Пользователь написал команду /profile_data
function handleProfileDataCommand(user, chat_id) {
    let profile = UserService.checkFillProfile(user);
    if (!profile) {
        UserService.createProfileDate(user);
    } else {
        sendText(chat_id, 'Данные полностью заполнены, какое поле ты хочешь изменить?', PROFILE_DATA_KEYBOARD);
    }
}








