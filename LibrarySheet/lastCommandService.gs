const LastCommandService = {
  headers: {
    apikey: Config.SUPABASE_API_KEY,
    Authorization: 'Bearer ' + Config.SUPABASE_API_KEY,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  },


  create(chatId, command) {
    const user = UserService.getByChatId(chatId);
    if (user.length === 0) {
      throw new Error('Пользователь не найден');
    }

    const url = `${Config.SUPABASE_URL}/rest/v1/last_command`;
    const dataToCreate = {
      user_id: user[0].id,
      last_command: command
    };

    const options = {
      method: 'post',
      headers: this.headers,
      payload: JSON.stringify(dataToCreate),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.getContentText());
  },


  update(id, command) {
    const url = `${Config.SUPABASE_URL}/rest/v1/last_command?id=eq.${id}`;
    const options = {
      method: 'patch',
      headers: this.headers,
      payload: JSON.stringify({last_command: command}),
      muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.getContentText());
  },


  createIfNotExist(chatId, command) {
    const user = UserService.getByChatId(chatId);
    if (user.length === 0) {
      throw new Error('Пользователь не найден');
    }

    // Пытаемся найти существующую запись
    const existing = this.getByUserId(user[0].id);
    if (existing.length > 0) {
      return existing[0];
    }

    // Если записи нет - создаем новую
    return this.create(chatId, command);
  },


  getByUserId(userId) {
    const url = `${Config.SUPABASE_URL}/rest/v1/last_command?user_id=eq.${userId}`;
    const options = {
      method: 'get',
      headers: this.headers
    };
    const response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.getContentText())[0].last_command;
  },


  getByChatId(chatId) {
    const user = UserService.getByChatId(chatId);
    if (user.length === 0) {
      return [];
    }
    return this.getByUserId(user[0].id);
  },


  softDelete(id) {
    return this.update(id, { deleted: true });
  },


  updateLastCommand(user_id, command) {
    const url = `${Config.SUPABASE_URL}/rest/v1/last_command?user_id=eq.${user_id}`;

    const options = {
      method: 'patch',
      headers: {
      ...this.headers
      },
      payload: JSON.stringify({user_id: user_id, last_command: command}),
      muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(url, options);

    let result = JSON.parse(response.getContentText());
    console.log(result);
    return result;
  },
};


