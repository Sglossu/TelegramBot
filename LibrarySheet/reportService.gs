const reportService = {
    headers: {
        apikey: Config.SUPABASE_API_KEY,
        Authorization: 'Bearer ' + Config.SUPABASE_API_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
    },

    generateAndSendReportMonthData: function(month, year, chat_id, sheetId) {
        try {
            // 1. Получаем и сортируем данные
            const allRecords = HotWaterService.getAllRecordsForPeriod(month, year);
            const sortedData = this._prepareAndSortReportData(allRecords);

            // 2. Обновляем лист в главной таблице
            const sheetName =  `Отчет ГВС ${Config.MONTH_NAMES[month-1]} ${year}`;
            const sheetUrl = this._updateReportMonthSheet(sortedData, sheetName, sheetId);

            // 3. Отправляем ссылку на таблицу пользователю
            const message = `📊 *${sheetName}*\n\n` +
                `Отчет по показаниям ГВС доступен по ссылке:\n` +
                `${sheetUrl}`;

            sendText(chat_id, message);

        } catch (error) {
            console.error('Ошибка при генерации отчета:', error);
            return false;
        }
    },

    generateAndSendReportOneFlatData: function(flatNumber, chat_id, sheetId) {
        try {
            // 1. Находим всех пользователей квартиры
            const users = UserService.getUserByFlatNumber(flatNumber);
            if (users.length === 0) {
                sendText(chat_id, `❌ Квартира ${flatNumber} не найдена`);
                return false;
            }

            // 2. Собираем данные всех пользователей
            const allUserRecords = [];
            for (const user of users) {
                const records = HotWaterService.getAllRecordsForUser(user.id);
                if (records.length > 0) {
                    allUserRecords.push({
                        fullName: user.full_name,
                        records: this._groupRecordsByMonthYear(records)
                    });
                }
            }

            if (allUserRecords.length === 0) {
                sendText(chat_id, `❌ Нет данных по квартире ${flatNumber}. Введите другой номер квартиры.`);
                return false;
            }

            // 3. Обновляем лист в таблице
            const sheetName = `История ГВС кв.${flatNumber}`;
            const sheetUrl = this._updateFlatReportSheet(allUserRecords, sheetName, sheetId, flatNumber);

            // 4. Отправляем ссылку пользователю
            const message = `📊 *${sheetName}*\n\n` +
                `История показаний ГВС доступна по ссылке:\n` +
                `${sheetUrl}`;

            sendText(chat_id, message);
            return true;

        } catch (error) {
            console.error('Ошибка при генерации отчета по квартире:', error);
            sendText(chat_id, '❌ Произошла ошибка при формировании отчета');
            return false;
        }
    },


    /**
     * Подготавливает и сортирует данные для отчета
     * @private
     */
    _prepareAndSortReportData: function(records) {
        // Сначала преобразуем каждую запись в плоскую структуру с нужными данными
        const preparedRecords = records.map(record => ({
            flatNumber: record.user?.flat_number || '999',
            flatNumberNum: parseInt(record.user?.flat_number) || Infinity,
            fullName: record.user?.full_name || 'Не указано',
            value: record.hot_watter,
            userId: record.user_profile_id,
            date: new Date(record.year, record.month - 1, 1) // Используем 1-е число месяца для даты
        }));

        // Сортируем сначала по номеру квартиры, затем по дате
        return preparedRecords.sort((a, b) => {
            // Сначала сравниваем номера квартир
            if (a.flatNumberNum !== b.flatNumberNum) {
                return a.flatNumberNum - b.flatNumberNum;
            }

            // Если квартиры одинаковые, сравниваем как строки (для "12A" и т.п.)
            const flatA = String(a.flatNumber);
            const flatB = String(b.flatNumber);
            const flatCompare = flatA.localeCompare(flatB, undefined, {numeric: true});
            if (flatCompare !== 0) return flatCompare;

            // Если это одна и та же квартира, сортируем по дате
            return a.date - b.date;
        });
    },

    /**
     * Группирует записи по месяцам и годам
     * @private
     */
    _groupRecordsByMonthYear: function(records) {
        const grouped = {};

        records.forEach(record => {
            const key = `${record.month}-${record.year}`;
            if (!grouped[key]) {
                grouped[key] = {
                    month: record.month,
                    year: record.year,
                    value: record.hot_watter
                };
            }
        });

        // Сортируем по дате (сначала старые)
        return Object.values(grouped).sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });
    },

    /**
     * Обновляет лист с отчетом по месяцу в главной таблице
     * @private
     */
    _updateReportMonthSheet: function(sortedRecords, sheetName, sheetId) {
        const spreadsheet = SpreadsheetApp.openById(Config.SHEET_ID);

        // Получаем или создаем лист
        let sheet = spreadsheet.getSheetById(sheetId);
        if (!sheet) {
            sheet = spreadsheet.insertSheet(sheetName);
        } else {
            sheet.clear();
            sheet.setName(sheetName);
        }

        // Устанавливаем заголовки
        const headers = ['№', 'Квартира', 'ФИО', 'Показание', 'Дата внесения'];
        sheet.getRange('A1:E1')
            .setValues([headers])
            .setFontWeight('bold')
            .setBackground('#dddddd');

        // Подготавливаем данные
        const rows = sortedRecords.map((record, index) => [
            index + 1,
            record.flatNumber,
            record.fullName,
            record.value,
            Utilities.formatDate(record.date, Session.getScriptTimeZone(), 'dd.MM.yyyy')
        ]);

        // Записываем данные
        if (rows.length > 0) {
            sheet.getRange(2, 1, rows.length, headers.length)
                .setValues(rows)
                .setNumberFormat('0');
        }

        // Форматирование
        sheet.autoResizeColumns(1, headers.length);
        sheet.setFrozenRows(1);

        return `https://docs.google.com/spreadsheets/d/${Config.SHEET_ID}/edit#gid=${sheet.getSheetId()}`;
    },


    /**
     * Обновляет лист с отчетом по одной квартире
     * @private
     */
    _updateFlatReportSheet: function(usersData, sheetName, sheetId, flatNumber) {
        const spreadsheet = SpreadsheetApp.openById(Config.SHEET_ID);

        // Получаем или создаем лист
        let sheet = spreadsheet.getSheetById(sheetId);
        if (!sheet) {
            sheet = spreadsheet.insertSheet(sheetName);
        } else {
            sheet.clear();
            sheet.setName(sheetName);
        }

        // Собираем все уникальные месяцы/годы для заголовков
        const allMonths = [];
        usersData.forEach(userData => {
            userData.records.forEach(record => {
                const key = `${record.month}-${record.year}`;
                if (!allMonths.includes(key)) {
                    allMonths.push(key);
                }
            });
        });

        // Сортируем месяцы по дате
        allMonths.sort((a, b) => {
            const [aMonth, aYear] = a.split('-').map(Number);
            const [bMonth, bYear] = b.split('-').map(Number);
            if (aYear !== bYear) return aYear - bYear;
            return aMonth - bMonth;
        });

        // Подготавливаем заголовки
        // const headers = ['№', 'ФИО', 'Квартира', ...];
        const headers = ['ФИО', 'Квартира',
            ...allMonths.map(key => {
                const [month, year] = key.split('-');
                return `${Config.MONTH_NAMES[month-1]} ${year}`;
            })
        ];

        // Подготавливаем данные
        const values = usersData.map(userData => {
            const row = [userData.fullName, flatNumber];

            allMonths.forEach(key => {
                const [month, year] = key.split('-').map(Number);
                const record = userData.records.find(r =>
                    r.month == month && r.year == year
                );
                row.push(record ? record.value : '');
            });

            return row;
        });

        // Записываем данные
        sheet.getRange(1, 1, 1, headers.length)
            .setValues([headers])
            .setFontWeight('bold')
            .setBackground('#dddddd');

        if (values.length > 0) {
            sheet.getRange(2, 1, values.length, values[0].length)
                .setValues(values)
                .setNumberFormat('0');
        }

        // Форматирование
        sheet.autoResizeColumns(1, headers.length);
        sheet.setFrozenRows(1);

        return `https://docs.google.com/spreadsheets/d/${Config.SHEET_ID}/edit#gid=${sheet.getSheetId()}`;
    }
}
