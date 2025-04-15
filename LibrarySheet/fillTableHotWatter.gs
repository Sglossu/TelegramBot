// Главная функция обработки сообщений
function fillTable(contents) {
    const userData = extractUserData(contents);
    const sheet = getSheetById(QuestionsSheetId);
    const allData = sheet.getDataRange().getDisplayValues();

    // Проверяем команду "начать сначала" и "продолжить" в самом начале
    if (userData.message === RestartCommand) {
        return handleRestartCommand(sheet, userData.chat_id);
    }
    if (userData.message === ContinnueCommand) {
        return handleContinueCommand(sheet, userData.chat_id);
    }

    // 1. Находим или создаем запись пользователя
    const userRecord = findOrCreateUserRecord(sheet, allData, userData);
    if (!userRecord) return false;

    // 2. Проверяем время последнего ответа (только если это не команда "продолжить")
    if (![ContinnueCommand, RestartCommand].includes(userData.message)) {
        const timeCheck = checkLastResponseTime(sheet, userRecord, userData);
        if (timeCheck !== true) return timeCheck;
    }

    // 3. Если это команда "продолжить" - просто дублируем последний вопрос
    if (userData.message === ContinnueCommand) {
        return continueLastQuestion(sheet, userRecord, userData.chat_id);
    }

    // 4. Проверяем согласие
    const consentResult = handleInitialConsent(sheet, userRecord, userData, allData);
    if (consentResult === "consent_processed") return false;
    if (consentResult === false) return false;

    // 5. Заполняем данные пользователя
    return fillUserData(sheet, userRecord, userData, allData);
}

// Проверка времени последнего ответа (упрощенная версия)
function checkLastResponseTime(sheet, userRecord, userData) {
    const lastResponseTime = sheet.getRange(userRecord.rowIndex, 2).getValue();
    const currentTime = new Date();

    if (currentTime - lastResponseTime > InactivityTimeout) {
        // Обновляем время
        sheet.getRange(userRecord.rowIndex, 2).setValue(currentTime);

        // Предлагаем варианты только если это не команда "начать сначала"
        if (userData.message !== RestartCommand) {
            sendText(userData.chat_id,
                TimeoutText,
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
        sheet.appendRow([chatId, new Date(), username, ""]);
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

// Продолжить заполнение (дублируем последний незаполненный вопрос)
function continueLastQuestion(sheet, userRecord, chatId) {
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
    if (questionColumn < LastColumnIndex) {
        sendText(chatId, `Введите ${headers[questionColumn + 1]}`);
    } else {
        sendText(chatId, SuccessWrite);
    }

    return false;
}

// Начать заполнение заново
function restartFilling(sheet, chatId) {
    // Находим запись пользователя
    const allData = sheet.getDataRange().getDisplayValues();
    let userRowIndex = null;

    for (let i = 1; i < allData.length; i++) {
        if (allData[i][0] == chatId) {
            userRowIndex = i + 1;
            break;
        }
    }

    // Если пользователь не найден - создаем новую запись
    if (!userRowIndex) {
        const username = "unknown"; // Можно получить из базы данных
        sheet.appendRow([chatId, new Date(), username, ""]);
        userRowIndex = sheet.getLastRow();
    }

    // Очищаем все колонки, кроме первых 4 (A-D)
    const rangeToClear = sheet.getRange(
        userRowIndex,
        5, // Колонка E (ФИО)
        1,
        sheet.getLastColumn() - 4 // Все остальные колонки
    );
    rangeToClear.clearContent();

    // Обновляем время
    sheet.getRange(userRowIndex, 2).setValue(new Date());

    // Запрашиваем ФИО
    const headers = allData[0];
    sendText(chatId, `Введите ${headers[4]}`);
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
    if (userData.message === Agree || userData.message === DontArgee) {
        const consentValue = userData.message === "согласен";
        sheet.getRange(userRecord.rowIndex, 4).setValue(consentValue);

        if (!consentValue) {
            sendText(userData.chat_id, RefusalOfConsent, AGREE_KEYBOARD);
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
    sendText(chat_id, ReedConsent, AGREE_KEYBOARD);
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
    if (columnToFill > LastColumnIndex) {
        sendText(userData.chat_id, SuccessWrite);
        return true;
    }

    // Валидация введенных данных
    if (!validateMessage(columnToFill, userData.message, userData.chat_id)) {
        return false;
    }

    // Записываем данные
    sheet.getRange(userRecord.rowIndex, columnToFill + 1).setValue(userData.message);

    // Отправляем следующий вопрос или подтверждение
    if (columnToFill < LastColumnIndex) {
        sendText(userData.chat_id, `Введите ${headers[columnToFill + 1]}`);
    } else {
        sendText(userData.chat_id, SuccessWrite);
    }

    return true;
}

