const UserService = {
    headers: {
        apikey: Config.SUPABASE_API_KEY,
        Authorization: 'Bearer ' + Config.SUPABASE_API_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
    },

    create(userData, messageText) {
        const url = `${Config.SUPABASE_URL}/rest/v1/user_profile`;
        const options = {
            method: 'post',
            headers: this.headers,
            payload: JSON.stringify(userData),
            muteHttpExceptions: true
        };
        const response = UrlFetchApp.fetch(url, options);
        let user = JSON.parse(response.getContentText())[0];
        this.createLastCommand(user.id, messageText);
        return user
    },

    createLastCommand(user_id, messageText) {
        const url = `${Config.SUPABASE_URL}/rest/v1/last_command?user_id=eq.${user_id}`;
        const options = {
            method: 'post',
            headers: {
                ...this.headers
            },
            payload: JSON.stringify({user_id: user_id, last_command: messageText}),
            muteHttpExceptions: true
        };
        const response = UrlFetchApp.fetch(url, options);

        let result = JSON.parse(response.getContentText());
        console.log(result);
        return result;
    },

    update(chatId, updates) {
        const url = `${Config.SUPABASE_URL}/rest/v1/user_profile?chat_id=eq.${chatId}`;
        const options = {
            method: 'patch',
            headers: this.headers,
            payload: JSON.stringify(updates),
            muteHttpExceptions: true
        };
        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    },

    getAll() {
        const url = `${Config.SUPABASE_URL}/rest/v1/user_profile?deleted=eq.false`;
        const options = {
            method: 'get',
            headers: this.headers
        };
        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    },

    getByChatId(chatId) {
        const url = `${Config.SUPABASE_URL}/rest/v1/user_profile?chat_id=eq.${chatId}&deleted=eq.false`;
        const options = {
            method: 'get',
            headers: this.headers
        };
        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText())[0];
    },

    exists(chatId) {
        const user = this.getByChatId(chatId);
        return user.length > 0;
    },

    softDelete(chatId) {
        return this.update(chatId, { deleted: true});
    },

    createIfNotExists(chat_id, telegram_nick, messageText) {

        const user = this.getByChatId(chat_id);
        if (user) {
            console.log('Пользователь существует');
            return user
        } else {
            let userData = {telegram_nick: telegram_nick, chat_id: chat_id};
            return this.create(userData, messageText);
        }
    },

    upsert(chat_id, userData) {
        const existing = this.getByChatId(chat_id);
        if (existing.length > 0) {
            return this.update(chat_id, userData);
        } else {
            return this.create(userData);
        }
    },

    createProfileDate(user) {
        let chat_id = user.chat_id

        if (!user.consent) {
            fillLastCommandTable(user, "consent");
            sendText(chat_id, Config.REED_CONSENT_TEXT + Config.CONSENT_URL + '\n' + Config.TEXT_ANSWER_AGREE_OR_NOT, AGREE_KEYBOARD);
            return
        }
        else if (!user.full_name) {
            fillLastCommandTable(user, "full_name");
            sendText(chat_id, Config.PROFILE_DATA_FIELD["full_name"]);
            return false;
        }
        else if (!user.flat_number) {
            fillLastCommandTable(user, "flat_number");
            sendText(chat_id, Config.PROFILE_DATA_FIELD["flat_number"]);
            return false;
        }
        else if (!user.phone_number) {
            fillLastCommandTable(user, "phone_number");
            sendText(chat_id, Config.PROFILE_DATA_FIELD["phone_number"]);
            return false;
        }
        else if (!user.email) {
            fillLastCommandTable(user, "email");
            sendText(chat_id, Config.PROFILE_DATA_FIELD["email"]);
            return false;
        }
        else {
            sendText(chat_id, "Все поля заполнены.", );
            return true;
        }
    },

    checkFillProfile(user) {
        if (
            user.consent === null || user.full_name === null || user.flat_number === null || user.phone_number === null || user.email === null
        ) {
            return false;
        }

        return true;
    },

    isAdmin(user) {
        return user.admin;
    },

    getUserByFlatNumber(flatNumber) {
        const url = `${Config.SUPABASE_URL}/rest/v1/user_profile?flat_number=eq.${flatNumber}&select=id,flat_number,full_name`;
        const options = {
            method: 'get',
            headers: this.headers
        };

        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText()); // Возвращаем массив всех пользователей, которые указали эту квартиру
    }
};
