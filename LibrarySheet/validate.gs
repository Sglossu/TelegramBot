const Validate = {

    isValidString(value) {
        return typeof value === "string" && value.trim() !== "";
    },


    isValidInteger(value) {
        const num = Number(value);
        return (!isNaN(num) && Number.isInteger(num) && num >= 1 && num <= 440);
    },


    isValidPhone(value) {
        if (typeof value !== "string") return false;

        // Удаляем все нецифровые символы (кроме +, если он в начале)
        const digitsOnly = value.replace(/\D/g, '');

        // для формата +79XXXXXXXXX (12 символов с + или 11 цифр без +)
        // для формата 89XXXXXXXXX (ровно 11 цифр)
        // вторая цифра (после +7/8) должна быть 9
        const withPlus = value.startsWith('+');

        return (
            (withPlus && digitsOnly.length === 11 && digitsOnly.startsWith('79')) ||
            (!withPlus && digitsOnly.length === 11 && digitsOnly.startsWith('89'))
        );
    },


    isValidEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return typeof value === "string" && emailRegex.test(value);
    },


    isValidFloat(value) {
        if (typeof value === 'string') {
            value = value.replace(',', '.');
        }

        // пробуем преобразовать в число
        const floatValue = parseFloat(value);
        if (isNaN(floatValue)) return false;

        // проверка количество знаков после запятой
        const parts = String(value).split(/[.,]/);
        if (parts.length > 1) {
            const decimalPart = parts[1];
            if (decimalPart.length > 2) return false;
        }

        return true;
    },


    // validateMessage(columnIndex, message, chat_id) {

    //   let isValid = false;
    //   let errorMessage = "";

    //   // Проверка в зависимости от столбца
    //   switch (columnIndex) {
    //     case 4: // Столбец E (ФИО, String)
    //       isValid = isValidString(message);
    //       errorMessage = "Ошибка: значение должно быть строкой";
    //       break;
    //     case 5: // Столбец F (Номер квартиры, Integer)
    //       isValid = isValidInteger(message);
    //       errorMessage = "Ошибка: значение должно быть целым числом";
    //       break;
    //     case 6: // Столбец G (Телефон)
    //       isValid = isValidPhone(message);
    //       errorMessage = "Ошибка: неверный формат телефона";
    //       break;
    //     case 7: // Столбец H (Email)
    //       isValid = isValidEmail(message);
    //       errorMessage = "Ошибка: неверный формат email";
    //       break;
    //     case 8: // Столбец I (Показания ГВС, Float, 2 знака)
    //       isValid = isValidFloat(message);
    //       errorMessage = "Ошибка: должно быть числом с максимум 2 знаками после запятой";
    //       break;
    //     default:
    //       isValid = true;
    //   }

    //   if (isValid) {
    //     return true;
    //   } else {
    //     sendText(chat_id, errorMessage);
    //     return false;
    //   }
    // },


    validateHotWatterDate() {
        const today = new Date();
        const currentDay = today.getDate();

        if (currentDay >= FIRST_DAY && currentDay <= LAST_DAY) {
            return true;
        }
        else {
            return `Подача показаний доступна только с ${FIRST_DAY} по ${LAST_DAY} число каждого месяца`;
        }
    },

    /**
     * Валидирует строку с месяцем и годом
     * @param {string} input - Входная строка формата "месяц год" (например "5 2024")
     * @returns {boolean|string} true если валидно, сообщение об ошибке если нет
     */
    validateMonthYear(input) {
        // Проверяем общий формат строки
        if (!/^\d+\s+\d+$/.test(input)) {
            return "Неверный формат. Введите месяц и год через пробел (например '5 2025')";
        }

        // Разбиваем на части
        const [monthStr, yearStr] = input.trim().split(/\s+/);
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);

        // Проверяем месяц
        if (isNaN(month) || month < 1 || month > 12) {
            return "Месяц должен быть числом от 1 до 12";
        }

        // Проверяем год
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 2025 || year > currentYear + 1) {
            return `Год должен быть числом от 2025 до ${currentYear + 1}`;
        }

        // Проверяем, чтобы период не был в будущем
        const currentMonth = new Date().getMonth() + 1;
        if (year === currentYear + 1 && month > currentMonth) {
            return "Нельзя указывать период в будущем";
        }
        if (year === currentYear && month > currentMonth) {
            return "Нельзя указать месяц в будущем для текущего года";
        }

        return true;
    }

}



