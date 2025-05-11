const HotWaterService = {

    headers: {
        apikey: Config.SUPABASE_API_KEY,
        Authorization: 'Bearer ' + Config.SUPABASE_API_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
    },

    create(user, watterData) {
        const url = `${Config.SUPABASE_URL}/rest/v1/hot_watter`;
        const dataToCreate = {
            ...watterData,
            user_profile_id: user.id
        };

        const options = {
            method: 'post',
            headers: this.headers,
            payload: JSON.stringify(dataToCreate),
            muteHttpExceptions: true
        };

        const response = UrlFetchApp.fetch(url, options);
        let result = JSON.parse(response.getContentText());
        return result[0]
    },

    // Обновляет запись о горячей воде по id записи
    update(id, updates) {
        const url = `${Config.SUPABASE_URL}/rest/v1/hot_watter?id=eq.${id}`;
        const options = {
            method: 'patch',
            headers: this.headers,
            payload: JSON.stringify(updates),
            muteHttpExceptions: true
        };
        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    },

    // Удаляет запись о горячей воде по id записи
    delete(id) {
        const url = `${Config.SUPABASE_URL}/rest/v1/hot_watter?id=eq.${id}`;
        const options = {
            method: 'delete',
            headers: this.headers,
            muteHttpExceptions: true
        };
        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    },

    // Получает все записи о горячей воде для конкретного пользователя по chat_id
    getByChatId(chatId) {
        // Сначала находим пользователя
        const user = UserService.getByChatId(chatId);
        if (user.length === 0) {
            return [];
        }

        const url = `${Config.SUPABASE_URL}/rest/v1/hot_watter?user_profile_id=eq.${user[0].id}`;
        const options = {
            method: 'get',
            headers: this.headers
        };
        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    },

    // Получает конкретную запись о горячей воде по id
    getById(id) {
        const url = `${Config.SUPABASE_URL}/rest/v1/hot_watter?id=eq.${id}`;
        const options = {
            method: 'get',
            headers: this.headers
        };
        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    },

    // Получает записи о горячей воде по месяцу и году для конкретного пользователя
    getByMonthAndYear(user_id, month, year) {
        const url = `${Config.SUPABASE_URL}/rest/v1/hot_watter?user_profile_id=eq.${user_id}&month=eq.${month}&year=eq.${year}`;
        const options = {
            method: 'get',
            headers: this.headers
        };
        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    },

    // Проверка что показание за прошлый месяц не больше текущего
    checkDiffLastMonth(user, message) {
        const currentDate = new Date();
        let todayMonth = currentDate.getMonth() + 1;
        let todayYear = currentDate.getFullYear();
        let prevMonth = (todayMonth === 1) ? 12 : todayMonth - 1;
        let prevYear = (prevMonth === 12) ? todayYear - 1 : todayYear;

        // Получаем данные за предыдущий месяц
        const lastMonthData = this.getByMonthAndYear(user.id, prevMonth, prevYear);

        // Если данных за прошлый месяц нет - считаем проверку пройденной
        if (lastMonthData.length === 0) {
            return true;
        }

        // Парсим текущее значение из message (предполагаем, что message содержит число)
        const currentValue = parseInt(message);

        // Получаем значение за прошлый месяц
        const lastMonthValue = parseInt(lastMonthData[0].hot_watter);

        // Сравниваем значения
        return currentValue >= lastMonthValue;
    },

    checkExistCurrentMonth(user) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        const currentMonthData = this.getByMonthAndYear(user.id, currentMonth, currentYear);

        return currentMonthData.length > 0;

    },

    /**
     * Получает все записи для конкретного пользователя
     * @private
     */
    getAllRecordsForUser(userId) {
        const url = `${Config.SUPABASE_URL}/rest/v1/hot_watter?user_profile_id=eq.${userId}&select=*`;
        const options = {
            method: 'get',
            headers: this.headers
        };

        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    },

    /**
     * Получает все записи за указанный период
     * @private
     */
    getAllRecordsForPeriod: function(month, year) {
        // Используем JOIN для получения данных из связанной таблицы users
        const url = `${Config.SUPABASE_URL}/rest/v1/hot_watter?` +
            `month=eq.${month}&year=eq.${year}` +
            `&select=*,user:user_profile_id(full_name,flat_number)`;

        const options = {
            method: 'get',
            headers: this.headers
        };

        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    },

    /**
     * Получает все записи для конкретной квартиры
     * @private
     */
    getAllRecordsForFlat: function(userId) {
        const url = `${Config.SUPABASE_URL}/rest/v1/hot_watter?user_profile_id=eq.${userId}&select=*`;
        const options = {
            method: 'get',
            headers: this.headers
        };

        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    },
};
