const MYSQL = require('mysql'),
    SHA512 = require('js-sha512'),
    CONFIG = require('../config'),
    logger = require('./logger'),
    log = require('./logger').log,
    EXPIRES = CONFIG.expires,
    OPTIONS = {
        host: CONFIG.db.clients.host,
        port: CONFIG.db.clients.port,
        user: CONFIG.db.clients.user,
        password: CONFIG.db.clients.password,
        database: CONFIG.db.clients.database
    },
    POOL = MYSQL.createPool(OPTIONS);


/**
 *
 * @param  login - логин;
 * @return возвращает токен сессии;
 * @pablic
 */
function createSessionToken(login) {
    return SHA512(new Date() + SHA512(login) + CONFIG.secret);
}

/**
 *
 * @param  sql - sql запрос. В местах подстановке параметров пишется ? (знак "вопрос");
 * @param  params - вставляемый параметр в запрос (массив [ ] параметров по порядку);
 * @return возвращает ответ от БД;
 * @pablic
 */
function query(sql, params) {
    return new Promise(resolve => {
        POOL.getConnection((error, connection) => {
            (error) ? resolve({error: error}) :
                connection.query(sql, params, (error, rows) => {
                    connection.release();
                    resolve({error, rows});
                });
        })
    });
}

/**
 *
 * @param  login - логин;
 * @param  pass - пароль;
 * @param  salt - соль;
 * @return возвращает хэш пароля;
 * @pablic
 */
function hash(login, pass, salt) {
    return SHA512(pass + SHA512(login) + salt);
}

module.exports = {
    showRoom: showRoom,                         //+
    showMessage: showMessage,                   //+
    addFile: addFile,                           //+
    addImage: addImage,                         //+
    showFriends: showFriends,                   //+
    addMessage: addMessage,                     //+
    register: register,                         //+
    createRoom: createRoom,                     //+
    authorization: authorization,               //+
    deleteUser: deleteUser,                     //+
    addInRoom: addInRoom,                       //+
    deleteFromRoom: deleteFromRoom,             //+
    deleteUsersFromRoom: deleteUsersFromRoom,   //+
    deleteRoom: deleteRoom,                     //+
    deleteMessage: deleteMessage,               //+
    addFriend: addFriend,                       //+
    deleteFriend: deleteFriend,                 //+
    query: query,                               //+
    setToken: setToken,                         //+
    getUserInfo: getUserInfo                    //+
};

/**
 *
 * @param   login - логин клиента;
 * @param  pass - пароль клиента;
 * @return возвращает токен в случае успешной регистрации, в противном случае - 0(false);
 * @public
 */
async function authorization(login, pass) {
    let sql = 'CALL `GetSalt`(?)',
        c1, c2, c3, token = 0,
        sql2 = 'CALL `AuthUsers`(?, ?)';
    c1 = await query(sql, login);
    let salt = c1.rows[0][0].salt;
    if (c1.error) {
        return (c1.error)
    } else {
        c2 = await query(sql2, [login, hash(login, pass, salt)])
    }
    if (!c2.rows[0][0].result) {
        return (token)
    }

    else {
        token = createSessionToken(login);
        c3 = await setToken(login, token, EXPIRES);
        if (c3.error) {
            return (0)
        } else {
            return (token);
        }
    }

}


/**
 *
 * @param token - токен клиента;
 * @param friend - логин друга;
 * @return возвращает 1(true) при успешном добавлении, 0(false) - при ошибке;
 * @public
 */
async function addFriend(token, friend) {
    let sql = 'CALL `AddFriend`(?, ?)', cb1, cb2;
    cb1 = await  getUserInfo(token);
    if (cb1.login != friend) {
        cb2 = await query(sql, [cb1.id, friend])
    } else {
        return (false)
    }
    if (!cb2 || !cb2.rows) {
        return (false)
    } else {
        return (cb2.rows.affectedRows > 0)
    }
}

/**
 *
 * @param token - токен клиента;
 * @param friend - логин друга;
 * @return возвращает 1(true) при успешном удаление, 0(false) - при ошибке;
 * @public
 */
async function deleteFriend(token, friend) {
    let sql = 'CALL `DeleteFriend`(?,?)', cb1, cb2;
    cb1 = await  getUserInfo(token);
    cb2 = await query(sql, [cb1.id, friend]);
    if (cb2.error) {
        return (cb2.error);
    } else {
        return (cb2.rows.affectedRows > 0);
    }
}


/**
 *
 * @param token - токен автора;
 * @param idRoom - id комнаты;
 * @param text - текст сообщения;
 * @return возвращает id сообщения, date сообщения;
 * @public
 */
async function addMessage(token, idRoom, text) {
    let sql = "CALL `AddMessage` (?,?,?)", cb1, cb2;
    cb1 = await  getUserInfo(token);
    cb2 = await query(sql, [cb1.id, idRoom, text]);
    if (cb2.error) {
        return (cb2.error);
    } else {
        return (cb2.rows[0][0]);
    }
}

/**
 *
 * @param token - токен автора комнаты;
 * @param idRoom - id комнаты, которую нужно удалить;
 * @param path - текст сообщения;
 * @return Promise id сообщения и date сообщения;
 * @public
 */
async function addImage(token, idRoom, path) {
    let sql = "CALL `AddImage` (?,?,?)", cb1, cb2;
    cb1 = await  getUserInfo(token);
    cb2 = await query(sql, [cb1.id, idRoom, path]);
    if (cb2.error) {
        return (cb2.error);
    } else {
        return (cb2.rows[0][0]);
    }

}

/**
 *
 * @param token - токен пользователя;
 * @return возвращает массив доступных комнат(чатов);
 * @public
 */
async function showRoom(token) {
    let sql = 'CALL `ShowRoom`(?);', cb1, cb2;
    cb1 = await getUserInfo(token);
    cb2 = await query(sql, [cb1.id]);
    if (cb2.error) {
        return (cb2.error);
    } else {
        return (cb2.rows[0]);
    }
}

/**
 *
 * @param token - токен пользователя;
 * @param idRoom - id комнаты(чата);
 * @param limit - лимит выгрузки смс;
 * @return возвращает массив сообщений;
 * @public
 */
async function showMessage(token, idRoom, limit) {
    let sql1 = "CALL `BeInRoom`(?,?)",
        sql2 = "CALL `ShowMessage` (?,?)",
        cb1, cb2, cb3;
    cb1 = await getUserInfo(token);
    cb2 = await query(sql1, [cb1.id, idRoom]);
    if (cb2.rows[0][0].result) {
        cb3 = await query(sql2, [idRoom, limit])
    } else {
        return ('Ошибка доступа к комнате');
    }
    if (cb3.error) {
        return (cb3.error)
    } else {
        return (cb3.rows[0]);
    }
}


/**
 *
 * @param login - логин клиента;
 * @param pass - пароль клиента;
 * @param fn - имя клиента;
 * @param ln - фамилия клиента;
 * @param salt - соль;
 * @return возвращает 1(true) - успешно, 0(false) - не удалось зарегистрироваться;
 * @public
 */
async function register(login, pass, fn, ln, salt) {
    let sql = 'CALL `Registration`(?,?,?,?,?);';
    let cb = await query(sql, [login, hash(login, pass, salt), fn, ln, salt]);
    if (cb.error) {
        return (cb.error)
    } else {
        return (cb.rows[0][0].result);
    }
}

/**
 *
 * @param token - токен клиента;
 * @param idRoom - id комнаты;
 * @param fileName - имя файла;
 * @param path - путь к файлу;
 * @return возвращает id сообщения с добавленным файлом и date сообщения;
 * @public
 */
async function addFile(token, idRoom, fileName, path) {
    let sql = 'CALL `AddFile` (?,?,?,?)', cb1, cb2;
    cb1 = await getUserInfo(token);
    cb2 = await query(sql, [cb1.id, idRoom, fileName, path]);
    if (cb2.error) {
        return (cb2.error);
    } else {
        return (cb2.rows[0][0]);
    }
}

/**
 *
 * @param token - токен пользователя;
 * @return возвращает массив доступных друзей;
 * @public
 */
async function showFriends(token) {
    let sql = 'CALL `ShowFriendList`(?)', cb1, cb2;
    cb1 = await getUserInfo(token);
    cb2 = await query(sql, cb1.id);
    if (cb2.error) {
        return (cb2.error)
    } else {
        return (cb2.rows[0]);
    }
}

/**
 *
 * @param users - массив пользователей, который нужно добавить (login);
 * @param idRoom - пароль клиента;
 * @return возвращает 1(true) в случае успешного добавления, в противном случае - 0(false);
 * @public
 */
async function addInRoom(token, users, idRoom) {
    let sql = 'CALL `AddInRoom`(?,?,?)', cb1, cb2;
    for (let user of users) {
        cb1 = await query(sql, [token, user, idRoom]);
    }
    return (true);
}

/**
 *
 * @param tokenSession - токен клиента;
 * @param nameRoom - название комнаты(чата);
 * @param users - массив(login) добавляемых пользователей в комнату(чат);
 * @return возвращает id комнаты - при успешном создании и добавлении;
 * @public
 */
async function createRoom(tokenSession, nameRoom, users = []) {
    let sql = 'CALL `CreateRoom` (?,?)', cb1, cb2, cb3, idRoom;
    cb1 = await getUserInfo(tokenSession);
    cb2 = await query(sql, [cb1.id, nameRoom]);
    if (cb2.error) {
        return (cb2.error)
    } else {
        if (!cb2.rows[0]) {
            return (false)
        }
        else {
            idRoom = cb2.rows[0][0].id;
        }
    }
    users.push(cb1.login);
    cb3 = await addInRoom(tokenSession, users, idRoom);
    return (idRoom);
}

/**
 *
 * @param token - токен автора комнаты;
 * @param idRoom - id комнаты, которую нужно удалить;
 * @return возвращает 1(true) при успешном удалении, 0(false) - при ошибке;
 * @public
 */
async function deleteRoom(token, idRoom) {
    let sql = 'CALL `DeleteRoom`(?,?)', cb1;
    cb1 = await query(sql, [token, idRoom]);
    if (cb1.error) {
        return (cb1.error)
    } else {
        return (cb1.rows.affectedRows > 0);
    }
}

/**
 *
 * @param token - токен пользователя;
 * @param idRoom - id комнаты, которую нужно покинуть;
 * @return возвращает 1(true) при успешном выходе из чата, 0(false) - при ошибке;
 * @public
 */
async function deleteFromRoom(token, idRoom) {
    let sql = 'CALL `DeleteFromRoom`(?,?)', cb1;
    cb1 = await query(sql, [token, idRoom]);
    if (cb1.error) {
        return (cb1.error)
    } else {
        return (cb1.rows.affectedRows > 0);
    }

}

/**
 *
 * @param token - токен автора комнаты;
 * @param login - id пользователя, которого нужно исключить;
 * @param idRoom - id комнаты, из которой исключить;
 * @return возвращает 1(true) при успешном выходе из чата, 0(false) - при ошибке;
 * @public
 */
async function deleteUsersFromRoom(token, login, idRoom) {
    let sql = 'CALL `DeleteUsersFromRoom`(?,?,?)', cb1;
    cb1 = await query(sql, [token, login, idRoom]);
    if (cb1.error) {
        return (cb1.error)
    } else {
        return (cb1.rows.affectedRows > 0);
    }
}

/**
 *
 * @param token - токен автора сообщения;
 * @param idMessage - id сообщения, которого нужно исключить;
 * @return возвращает 1(true) при успешном выходе из чата, 0(false) - при ошибке;
 * @public
 */
async function deleteMessage(token, idMessage) {
    let sql = "CALL `DeleteMessage` (?,?)", cb1, cb2;
    cb1 = await getUserInfo(token);
    cb2 = await query(sql, [cb1.id, idMessage]);
    if (cb2.error) {
        return (cb2.error)
    } else {
        return (cb2.rows.affectedRows > 0);
    }

}

/**
 *
 * @param login - логин пользователя;
 * @param token - токен пользователя на сессию;
 * @param expires - число месяцев действия токена;
 * @return возвращает 1(true) при успешном сохранении токена;
 * @public
 */
async function setToken(login, token, expires) {
    let sql = 'CALL `SetToken`(?,?,?)', cb1;
    cb1 = await query(sql, [login, token, expires]);
    if (cb1.error) {
        return (cb1.error)
    } else {
        return (true);
    }
}

/**
 *
 * @param token - токен пользователя;
 * @return возвращает id, login fn,ln пользователя;
 * @public
 */
async function getUserInfo(token) {
    let sql = 'CALL `GetUserInfo`(?)', cb1;
    cb1 = await query(sql, token);
    if (cb1.error) {
        return (cb1.error)
    } else {
        return (cb1.rows[0][0]);
    }

}

async function getUserInfoByLogin(Login) {
    let sql = 'CALL `GetUserInfoByLogin`(?)', cb1;
    cb1 = await query(sql, Login);
    if (cb1.error) {
        return (cb1.error)
    } else {
        return (cb1.rows[0][0]);
    }
}


/**
 *
 * @param login - логин пользователя;
 * @param pass - пароль пользователя;
 * @return возвращает true при успешном удалении;
 * @public
 */
async function deleteUser(login, pass) {
    let sql = 'CALL `DeleteUser`(?)', cb1, cb2;
    cb1 = await authorization(login, pass);
    if (cb1 !== 0) cb2 = await query(sql, login)
    if (cb2.error) {
        return (cb2.error)
    } else {
        return (cb2.rows.affectedRows > 0);
    }
}