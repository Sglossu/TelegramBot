function parceAnswer(contents) {
    let message = contents.message.text;
    let chat_id = contents.message.chat.id;
    let telegram_nick = contents.message.chat.username;

    let user = UserService.getByChatId(chat_id);
    // Пользователь пишет нам первый раз, ещё не было ни одной команды
    if (!user) {
        user = UserService.create({chat_id: chat_id, telegram_nick: telegram_nick}, null);
        let text = `Здравствуйте, ${username}!\n\n${TEXT_START}`;
        sendText(chat_id, text, START_KEYBOARD);
        return;
    };

    // Какая-то команда уже есть, ищем какая последняя:
    let lastCommand = LastCommandService.getByUserId(user.id);

    switch (lastCommand) {
        case '/start':
            handleStartLastCommand(chat_id, user, message);
            break;

        case '/hot_watter':
            handleHotWaterLastCommand(chat_id, user, message);
            break;

        case '/profile_data':
            handleProfileDataLastCommand(chat_id, user, message);
            break;

        case '/get_all_month_data':
            handleGetAllMonthDataLastCommand(user, message);
            break;

        case '/get_hot_watter_by_flat':
            handleGetFlatDataLastCommand(user, message);
            break;

        case 'ФИО':
            LastCommandService.updateLastCommand(user.id, 'full_name')
            sendText(chat_id, `Введите новое ФИО`);
            break;

        case 'Номер квартиры':
            LastCommandService.updateLastCommand(user.id, 'flat_number')
            sendText(chat_id, `Введите новый номер квартиры`);
            break;

        case 'Номер телефона':
            LastCommandService.updateLastCommand(user.id, 'phone_number')
            sendText(chat_id, `Введите новый номер телефона`);
            break;

        case 'Электронная почта':
            LastCommandService.updateLastCommand(user.id, 'email')
            sendText(chat_id, `Введите новую электронную почту`);
            break;

        case 'full_name':
            handleFullNameLastCommand(chat_id, user, message);
            break;

        case 'flat_number':
            handleFlatNumberLastCommand(chat_id, user, message);
            break;

        case 'phone_number':
            handlePhoneNumberLastCommand(chat_id, user, message);
            break;

        case 'email':
            handleEmailLastCommand(chat_id, user, message);
            break;

        case 'consent':
            handleConsentLastCommand(chat_id, user, message);
            break;

        default:
            keyboard = UserService.isAdmin(user) ? ADMIN_START_KEYBOARD : START_KEYBOARD
            sendText(chat_id, `Смотри что я могу:`, keyboard);
            return;
    }
}


// Если до этого была команда /start и сейчас пользователь что-то пишет.
// Валидное - TEXT_HOT_WATTER. Остальное - команды
function handleStartLastCommand(chat_id, user, message) {
    switch (message) {
        case TEXT_HOT_WATTER: {
            fillLastCommandTable(usesr, '/hot_watter');
            sendText(chat_id, "Написать для hot watter бл");
        }

        default:
            sendText(chat_id, `Выберите в меню команду для взаимодействия`);
    }
}


// Если до этого была команда /hot_watter, значит сейчас человек подаёт одно число - показание
function handleHotWaterLastCommand(chat_id, user, message) {
    if (!Validate.isValidInteger(message)) {
        sendText(chat_id, `Введите корректное целое число для сдачи показания ГВС`);
        return;
    }

    // Если всё ок, проверяем есть ли показание за прошлый месяц и если есть, что оно меньше текущего
    if (!HotWaterService.checkDiffLastMonth(user, message)) {
        sendText(chat_id, `Показание за текущий период не может быть меньше чем за предыдущий. Попробуйте ввести ещё раз.`);
        return;
    }

    // Если всё ок, проверяем есть ли уже показание за текущий месяц
    if (HotWaterService.checkExistCurrentMonth(user)) {
        sendText(chat_id, `Вы уже подавали показания в этом месяце.`);
        LastCommandService.updateLastCommand(user.id, null);
        return;
    }

    // Если всё ок, записываем показание за текущий месяц
    let hotWatter = HotWaterService.create(user, {hot_watter: message});
    LastCommandService.updateLastCommand(user.id, null);
    sendText(chat_id, `Показание ГВС ${message} принято!`);
}


function handleProfileDataLastCommand(chat_id, user, message) {
    switch (message) {
        case 'ФИО':
            LastCommandService.updateLastCommand(user.id, 'full_name')
            sendText(chat_id, `Введите новое ФИО`);
            break;

        case 'Номер квартиры':
            LastCommandService.updateLastCommand(user.id, 'flat_number')
            sendText(chat_id, `Введите новый номер квартиры`);
            break;

        case 'Номер телефона':
            LastCommandService.updateLastCommand(user.id, 'phone_number')
            sendText(chat_id, `Введите новый номер телефона`);
            break;

        case 'Электронная почта':
            LastCommandService.updateLastCommand(user.id, 'email')
            sendText(chat_id, `Введите новую электронную почту`);
            break;
    }
}


// Если последнее что указал пользователь - изменении ФИО
function handleFullNameLastCommand(chat_id, user, message) {
    if (!Validate.isValidString(message)) {
        sendText(chat_id, `Некорректное ФИО, попробуй ещё раз`);
        return;
    }
    UserService.update(chat_id, {full_name: message});
    let profile = UserService.checkFillProfile(user);
    if (!profile) {
        sendText(chat_id, `ФИО принято ✅`);
        LastCommandService.updateLastCommand(user.id, "flat_number");
        sendText(chat_id, `Введите номер квартиры`);
        return;
    }

    LastCommandService.updateLastCommand(user.id, null)
    sendText(chat_id, `ФИО принято ✅`);
}

// Если последнее что указал пользователь - изменении номера квартиры
function handleFlatNumberLastCommand(chat_id, user, message) {
    if (!Validate.isValidInteger(message)) {
        sendText(chat_id, `Некорректный номер квартиры, попробуй ещё раз`);
        return;
    }
    UserService.update(chat_id, {flat_number: message});
    let profile = UserService.checkFillProfile(user);
    if (!profile) {
        sendText(chat_id, `Номер квартиры принят ✅`);
        LastCommandService.updateLastCommand(user.id, "phone_number");
        sendText(chat_id, `Введите номер телефона`);
        return;
    }
    LastCommandService.updateLastCommand(user.id, null);
    sendText(chat_id, `Номер квартиры принят ✅`);
}

// Если последнее что указал пользователь - изменении телефона
function handlePhoneNumberLastCommand(chat_id, user, message) {
    if (!Validate.isValidPhone(message)) {
        sendText(chat_id, `Некорректный номер телефона, попробуй ещё раз`);
        return;
    }
    UserService.update(chat_id, {phone_number: message});
    let profile = UserService.checkFillProfile(user);
    if (!profile) {
        sendText(chat_id, ` Номер телефона принят ✅`);
        LastCommandService.updateLastCommand(user.id, "email");
        sendText(chat_id, `Введите электронную почту`);
        return;
    }
    LastCommandService.updateLastCommand(user.id, null);
    sendText(chat_id, ` Номер телефона принят ✅`);
}

// Если последнее что указал пользователь - изменении email
function handleEmailLastCommand(chat_id, user, message) {
    if (!Validate.isValidEmail(message)) {
        sendText(chat_id, `Некорректный email, попробуй ещё раз`);
        return;
    }
    UserService.update(chat_id, {email: message});
    LastCommandService.updateLastCommand(user.id, null);
    sendText(chat_id, `Электронная почта принята ✅`);
}


// Если пользователь отетил CHANGE_PROFILE_DATA ("Да, хочу изменить данные")
function handleYesChangeProfileDataLastCommand(chat_id, user, message) {
    sendText(chat_id, 'Какие данные ты хочешь изменить?', PROFILE_DATA_KEYBOARD);
}

// Если пользователь отетил DONT_CHANGE_PROFILE_DATA ("Нет, больше ничего не менять")
function handleYesChangeProfileDataLastCommand(chat_id, user, message) {
    sendText(chat_id, 'Хорошо, все изменения сохранены.');
}

// Пользователь отвечает на предложение согласия (Согласен или нет)
function handleConsentLastCommand(chat_id, user, message) {
    message = message.toLowerCase()
    switch (message) {
        case Config.AGREE_COMMAND:
            handleAgreeConsentLastCommand(chat_id, user, message);
            break;
        case Config.DONT_AGREE_COMMAND:
            handleDontAgreeConsentLastCommand(chat_id, user, message);
            break;
    }
}


// Если пользователь ответил ARGEE ("Согласен (на обработку данных)")
function handleAgreeConsentLastCommand(chat_id, user, message) {
    UserService.update(chat_id, {consent: true});
    LastCommandService.updateLastCommand(user.id, "full_name");
    sendText(chat_id, `Введите ФИО`);
}

// Если пользователь ответил DONT_AGREE ("Не Согласен (на обработку данных)")
function handleDontAgreeConsentLastCommand(chat_id, user, message) {
    UserService.update(chat_id, {consent: false});
    sendText(chat_id, Config.REFUSAL_OF_CONSENT + '\n' + Config.TEXT_ANSWER_AGREE_OR_NOT, AGREE_KEYBOARD);
}















