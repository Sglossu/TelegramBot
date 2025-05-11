// Главная функция обработки показаний ГВС
function fillTable(contents) {
    const userData = extractUserData(contents);
    const sheet = getSheetById(QUESTIONS_SHEET_ID);
    const allData = sheet.getDataRange().getDisplayValues();

    // Проверяем команду "начать сначала" и "продолжить" в самом начале
    if (userData.message === RESTART_COMMAND) {
        return handleRestartCommand(sheet, userData.chat_id);
    }
    if (userData.message === CONTINUE_COMMAND) {
        return handleContinueCommand(sheet, userData.chat_id);
    }

    // Находим или создаём запись пользователя в бд
    let user = UserService.createIfNotExists(userData.chat_id, userData);

    // 2. Проверяем время последнего ответа (только если это не команда "продолжить")
    if (![CONTINUE_COMMAND, RESTART_COMMAND].includes(userData.message)) {
        // const timeCheck = checkLastResponseTime(sheet, userRecordInSheet, userData);
        const timeCheck = checkLastResponseTime(user);
        if (timeCheck !== true) return timeCheck;
    }

    // 3. Если это команда "продолжить" - просто дублируем последний вопрос
    if (userData.message === CONTINUE_COMMAND) {
        // return continueLastQuestion(sheet, userRecordInSheet, userData.chat_id);
        return continueLastQuestion(sheet, user);
    }

    // 4. Проверяем согласие
    const consentResult = handleInitialConsent(sheet, userRecordInSheet, userData, allData);
    if (consentResult === "consent_processed") return userRecordInSheet;
    if (consentResult === false) return false;

    // 5. Заполняем данные пользователя
    return fillUserData(sheet, userRecordInSheet, userData, allData);
}


function checkLastResponseTime(user) {
    const lastResponseTime = new Date(user.updated);
    const currentTime = new Date();

    if (currentTime - lastResponseTime > INACTIVITY_TIMEOUT) {
        // Обновляем время
        UserService.update(user.chat_id, {"updated": currentTime});
        // Предлагаем варианты только если это не команда "начать сначала"
        if (userData.message !== RESTART_COMMAND) {
            sendText(user.chat_id,
                TIMEOUT_TEXT,
                RESTART_CONTINUE_KEYBOARD
            );
            return false;
        }
    }

    return true;
}


// Обработка команды "продолжить" с проверкой согласия
function handleContinueCommand(sheet, chatId) {
    const allData = sheet.getDataRange().getDisplayValues();
    let userRowIndex = null;
    let hasConsent = false;

    // Находим запись пользователя
    for (let i = 1; i < allData.length; i++) {
        if (allData[i][0] == chatId) {
            userRowIndex = i + 1;
            hasConsent = allData[i][3] === "TRUE"; // Проверяем согласие (колонка D)
            break;
        }
    }

    // Если пользователь не найден или нет согласия
    if (!userRowIndex || !hasConsent) {
        if (!hasConsent) {
            sendConsentRequest(chatId);
        }
        return false;
    }

    // Обновляем время
    sheet.getRange(userRowIndex, 2).setValue(new Date());

    // Продолжаем с последнего вопроса
    return continueLastQuestion(sheet, {rowIndex: userRowIndex}, chatId);
}


// Обработка команды "начать сначала" с проверкой согласия
function handleRestartCommand(sheet, chatId) {
    const allData = sheet.getDataRange().getDisplayValues();
    let userRowIndex = null;
    let hasConsent = false;

    // Находим запись пользователя
    for (let i = 1; i < allData.length; i++) {
        if (allData[i][0] == chatId) {
            userRowIndex = i + 1;
            hasConsent = allData[i][3] === "TRUE"; // Проверяем согласие (колонка D)
            break;
        }
    }

    // Если пользователь не найден - создаем новую запись
    if (!userRowIndex) {
        const username = "unknown";
        sheet.appendRow([chatId, formattedDateTime, username, ""]);
        userRowIndex = sheet.getLastRow();
        hasConsent = false;
    }

    // Очищаем все колонки, кроме первых 4 (A-D)
    const rangeToClear = sheet.getRange(
        userRowIndex,
        5, // Колонка E (ФИО)
        1,
        sheet.getLastColumn() - 4
    );
    rangeToClear.clearContent();

    // Обновляем время
    sheet.getRange(userRowIndex, 2).setValue(new Date());

    // Если согласия нет - запрашиваем его
    if (!hasConsent) {
        sendConsentRequest(chatId);
        return false;
    }

    // Если согласие есть - начинаем с ФИО
    const headers = allData[0];
    sendText(chatId, `Введите ${headers[4]}`);
    return false;
}


function continueLastQuestion(sheet, user) {
    const allData = sheet.getDataRange().getDisplayValues();
    const userRow = allData[userRecord.rowIndex - 1];
    const headers = allData[0];

    // Находим первую пустую колонку после согласия
    let columnToFill = 4; // Начинаем с ФИО (колонка E)

    // Ищем первую пустую ячейку начиная с колонки E
    while (columnToFill < userRow.length && userRow[columnToFill] !== '') {
        columnToFill++;
    }

    // Определяем индекс вопроса, который нужно задать
    const questionColumn = columnToFill > 4 ? columnToFill - 1 : 4;

    // Дублируем вопрос
    if (questionColumn < LAST_COLOUMN_INDEX) {
        sendText(chatId, `Введите ${headers[questionColumn + 1]}`);
    } else {
        sendText(chatId, SUCCESS_WRITE);
    }

    return false;
}


// Извлекаем данные пользователя из сообщения
function extractUserData(contents) {
    return {
        chat_id: contents.message.chat.id,
        message: contents.message.text.toLowerCase(),
        username: contents.message.chat.username,
        first_name: contents.message.chat.first_name
    };
}


// Находим или создаем запись пользователя
function findOrCreateUserRecord(sheet, allData, userData) {
    for (let i = 1; i < allData.length; i++) {
        if (allData[i][0] == userData.chat_id) {
            return {
                rowIndex: i + 1, // +1 потому что в Sheets нумерация с 1
                existingRecord: true,
                consentGiven: allData[i][3] === "TRUE"
            };
        }
    }

    // Создаем новую запись для нового пользователя
    sheet.appendRow([
        userData.chat_id,
        new Date(),
        userData.username,
        "" // Поле согласия пока пустое
    ]);

    return {
        rowIndex: sheet.getLastRow(),
        existingRecord: false,
        consentGiven: false
    };
}


// Обработка согласия (только перед первым вопросом)
function handleInitialConsent(sheet, userRecord, userData, allData) {
    // Для новых пользователей сразу запрашиваем согласие
    if (!userRecord.existingRecord) {
        sendConsentRequest(userData.chat_id);
        return false;
    }

    // Для существующих пользователей получаем их строку
    const userRow = allData[userRecord.rowIndex - 1];

    // Если уже есть заполненные данные после согласия - пропускаем проверку
    if (userRow.slice(4).some(cell => cell !== '')) return true;

    // Если согласие уже получено - пропускаем
    if (userRecord.consentGiven) return true;

    // Обрабатываем ответ пользователя на согласие
    if (userData.message === AGREE_COMMAND || userData.message === DONT_AGREE_COMMAND) {
        const consentValue = userData.message === "согласен";
        sheet.getRange(userRecord.rowIndex, 4).setValue(consentValue);

        if (!consentValue) {
            sendText(userData.chat_id, REFUSAL_OF_CONSENT, AGREE_KEYBOARD);
            return false;
        }
        // После согласия запрашиваем ФИО и прерываем выполнение
        const headers = allData[0];
        sendText(userData.chat_id, `Введите ${headers[4]}`); // Колонка E (ФИО)
        return "consent_processed";
    }

    // Запрашиваем согласие только если это первый вопрос
    sendConsentRequest(userData.chat_id);
    return false;
}

// Отправка запроса на согласие
function sendConsentRequest(chat_id) {
    sendText(chat_id, REED_CONSENT_TEXT, AGREE_KEYBOARD);
}


// Заполнение данных пользователя
function fillUserData(sheet, userRecord, userData, allData) {
    const headers = allData[0];
    const userRow = allData[userRecord.rowIndex - 1];

    // Начинаем проверку с колонки E (ФИО)
    let columnToFill = 4;
    while (columnToFill < userRow.length && userRow[columnToFill] !== '') {
        columnToFill++;
    }

    // Пропускаем колонку согласия (D)
    if (columnToFill === 3) columnToFill = 4;

    // Если все данные заполнены
    if (columnToFill > LAST_COLOUMN_INDEX) {
        sendText(userData.chat_id, SUCCESS_WRITE);
        return true;
    }

    // Валидация введенных данных
    if (!validateMessage(columnToFill, userData.message, userData.chat_id)) {
        return false;
    }

    // Записываем данные
    sheet.getRange(userRecord.rowIndex, columnToFill + 1).setValue(userData.message);

    // Отправляем следующий вопрос или подтверждение
    if (columnToFill < LAST_COLOUMN_INDEX) {
        sendText(userData.chat_id, `Введите ${headers[columnToFill + 1]}`);
    } else {
        sendText(userData.chat_id, SUCCESS_WRITE);
    }

    return true;
}
