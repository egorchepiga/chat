const log = require('./logger').log,
    CONFIG = require('../config'),
    SHA512 = require('js-sha512'),
    DOWNLOAD = require('image-downloader'),
    PATH = require('path'),
    DB = require('./DBcore');

module.exports = {
    getUserInfo: getUserInfo,
    normaMessage: normaMessage,           //
    downloadImage: downloadImage,         //
    isReadyForLog: isReadyForLog,         //
    isReadyForReg: isReadyForReg,         //
    accessText: accessText,               //
    isSpaced: isSpaced,                   //
    isEmpty: isEmpty,                     //
    addFriends: addFriends,               //
    deleteRoom: deleteRoom,               //
    deleteUsersFromRoom: deleteUsersFromRoom,//
    deleteUser: deleteUser,               //
    createRoom: createRoom,               //
    addInRoom: addInRoom,                 //
    deleteFromRoom: deleteFromRoom,       //
    deleteMessage: deleteMessage,         //
    register: register,                   //
    login: login,                         //
    showFriends: showFriends,             //+
    deleteFriend: deleteFriend,           //
    addMessage: addMessage,               //
    showMessage: showMessage,             //
    showRoom: showRoom                    //
};

/**
 * Удаление из списка друзей
 * @param data data.token - токен пользователя, data.friend - логин друга, которого надо удалить
 * @return {Promise}
 */
async function deleteFriend(data) {
    if (isEmpty(data.token) || isEmpty(data.friend)) {
        return ({success: false, info: "Ошибка входных данных"})
    } else {
        let cb = await DB.deleteFriend(data.token, data.friend);
        return ({success: cb});
    }
}

/**
 * Выгрузка списка друзей
 * @param data data.token - токен пользователя
 * @return возвращает массив из списка друзей {success: true, friendlist}
 */
async function showFriends(data) {
    if (!data.token) {
        return ({success: false, info: "Ошибка подписи"})
    } else {
        let res = await DB.showFriends(data.token);
        return ({success: true, friendlist: res});
    }
}

/**
 * Добавление в список друзей
 * @param data - data.token - токен, data.friend - логин друга
 * @return возвращает {success: true/false}
 */

async function getUserInfo(data) {
    if (isEmpty(data.token)) {
        return ({success: false, info: "Токен отсутсвует"})
    } else {
        let info = await DB.getUserInfo(data.token);
        if (!info.login) {
            return ({success: false, info: "Ошибка токена"});
        }
        else {
            return ({success: true, data: info});
        }
    }
}

async function addFriends(data) {
    if (isEmpty(data.token) || isEmpty(data.friend)) {
        return ({success: false, info: "Ошибка входных данных"})
    } else {
        let res = await DB.addFriend(data.token, data.friend);
        return ({success: res});
    }
}

/**
 * Нормализация текста
 * @param text - исходный текст
 * @return возвращает нормалезованный текст
 */
function normaMessage(text) {
    return text
        .replace(/\u0020+/gim, " ")
        .replace(/\u0009+/gim, " ")
        .replace(/\u000A+/gim, '\n')
        .replace(/\xa0/gim, ' ')
        .replace(/([\u0020]*$)/gim, '')
        .replace(/(^[\u0020]+)/gim, '');
}

/**
 * Загрузка изображений на сервер
 * @param url
 * @param type
 * @return {Promise}
 */
async function downloadImage(url, type) {
    let date = Date.parse(new Date) + new Date().getMilliseconds(),
        name = SHA512(url + SHA512(date + "")),
        pathImg = `/images/${name}.${type}`,
        options = {
            url: url,
            dest: PATH.join(__dirname, "../public/" + pathImg)
        },
        res = await  DOWNLOAD.image(options);
    if (!res.error) {
        return ({pathImg})
    } else {
        return ({error: res.error})
    }
}

/**
 * проверка на ссылки картинок
 * @param room - id комнаты
 * @param message - текст для проверки на ссылку на картинки
 * @param token - токен пользователя
 * @return {Promise} впадлу уже писать. лол
 */
async function checkURL(room, message, token) {
    let path;
    let match = message.match(/((http(s)?)|(www\.))([^\.]+)\.([^\s]+(jpg|png))/);
    if (!match) {
        return ({message: message})
    } else {
        message = message.replace(match[7], "");
        let di = await downloadImage(match[0], match[7]);
        let path = di.pathImg;
        if (token && room && path) {
            let addImg = await DB.addImage(token, room, path);
            let ret = {
                path: path,
                id: addImg.id,
                date: addImg.date,
                message: message
            };
            return (ret);
        }
    }
}

/**
 * Проверка входных данных (Логин, Пароль)
 * @param data - структура входящих данных должна содержать: data.login, data.password;
 * @return {boolean} true - если все хорошо, false - если входные данные не подходят;
 */
function isReadyForLog(data) {
    return (data.login === undefined || data.login.length < CONFIG.length.min.login || data.login.length > CONFIG.length.max.login) ? false :
        (!(data.password === undefined || data.password.length < CONFIG.length.min.password || data.password.length > CONFIG.length.max.password));
}

/**
 * Проверка входных данных (Имя, Фамилия)
 * @param data - структура входящих данных должна содержать: data.firstName, data.lastName;
 * @return {boolean} - true - если все хорошо, false - если входные данные не подходят;
 */
function isReadyForReg(data) {
    return (!isReadyForLog(data)) ? false :
        (data.firstName === undefined || data.firstName.length < CONFIG.length.min.firstName|| data.firstName.length > CONFIG.length.max.firstName) ? false :
            (!(data.lastName === undefined || data.lastName.length < CONFIG.length.min.lastName || data.lastName.length >CONFIG.length.max.lastName));
}

/**
 * Экранирование стрелочек, для защиты от XSS атак
 * @param text - текст;
 * @return {string} - текст с экранированными спецсимволами < >;
 */
function accessText(text) {
    return text
        .replace(/[<>]/gim, function (i) {
            return (i.charCodeAt(0) === 60) ? '&lt;' : '&gt;';
        })
}

/**
 * проверка текста
 * @param text - текст проверки
 * @return {boolean} - true - если текст пустой (состоит из пробелов), fulse - в противном случае.
 */
function isSpaced(text) {
    return (text.replace(/ /g, "").length < 1);
}

/**
 * проверка текста
 * @param text - текст для прверки
 * @return true - если undefined или пустой текст
 */
function isEmpty(text) {
    return (text === undefined || text.length < 1);
}

/**
 * Добавления сообщения
 * @param data - data.token - токен, data.idRoom - id комнаты(чата), data.message - текст сообщения
 * @return {success: true, data: {message,from,idRoom,date,id,attachment}} attachment - вложения, в данный момент
 * может быть image{id,from,imgPath,date}
 */
async function addMessage(data) {
    let message = normaMessage(data.text) || "",
        token = data.token || "",
        idRoom = data.idRoom || "",
        image = {};
    if (!message || isSpaced(message)) {
        return ({success: false, info: "Ошибка. Пустой текст."})
    } else if (!idRoom) {
        return ({success: false, info: "Ошибка. Не выбран диалог."})
    } else if (!token) {
        return ({success: false, info: "Ошибка. Токен."})
    } else if (message.length === 0) {
        return ({success: false, info: "Ошибка. Пустое сообщение."})
    } else {
        let getUserInfo = await DB.getUserInfo(token);
        const login = getUserInfo.login;
        let chckURL = await checkURL(idRoom, message, token);
        message = chckURL.message;
        if (!isEmpty(chckURL.path))
            image = {
                id: chckURL.id,
                from: login,
                imgPath: chckURL.path,
                date: chckURL.date
            };
        let addMsg = await DB.addMessage(token, idRoom, accessText(message));
        return ({
            success: true,
            data: {
                message: accessText(message),
                from: login,
                idRoom: idRoom,
                date: addMsg.date,
                id: addMsg.id,
                attachment: image
            },
            info: "Done"
        });
    }
}

/**
 * Аутентицикация
 * @param data - структура объекта data: data.login, data.password;
 * @return callback - структура объекта callback: .success true/false, .data{rooms - массив комнат(чатов), login - логин пользователя, token - токен сессии}, .info - информация об ошибке (success=false);
 */
async function login(data) {
    if (!isReadyForLog(data)) {
        return ({
            success: false,
            info: "входные данные отсутствуют или привышают допустимую длинну"
        })
    } else {
        let token = await DB.authorization(data.login, data.password);
        if (token === 0) return ({success: false, info: "wrong login/password"});
        else {
            return ({success: true, data: {login: data.login, token}});
        }
    }
}

/**
 * генерация соли
 * @param login - логин пользователя;
 * @return соль из 20 символов;
 */
function salt(login) {
    return SHA512(new Date() + SHA512(login) + CONFIG.secret).substring(17, 37);
}

/**
 * Регистрация
 * @param data - data.login - логин, data.password - пароль, data.firstName - имя, data.lastName - фамилия;
 * @param callback - success: true/false, data: {login, token} , info - описание ошибки.
 */
async function register(data) {
    if (!isReadyForReg(data)) {
        return ({success: false, info: "Входные данные не соответствуют спецификации"})
    } else {
        let res = await DB.register(data.login, data.password, data.firstName, data.lastName, salt(data.login));
        if (res === 0) {
            return ({success: false, info: "Пользователь уже существует"})
        } else {
            let token = await DB.authorization(data.login, data.password);
            if (token === 0) return ({success: false, info: "wrong login/password"});
            else {
                return ({success: true, data: {login: data.login, token}});
            }
        }
    }

}

/**
 * Удаление сообщения
 * @param data data.token - токен пользователя, data.idRoom - id комнаты(чата), data.idMessage - id сообщения
 * @return возвращает true в успешном случае
 */
async function deleteMessage(data) {
    if (!data.token) {
        return ({success: false, info: "Ошибка подписи"})
    } else if (!data.idMessage) {
        return ({success: false, info: "Ошибка"})
    } else if (!data.idRoom) {
        return ({success: false, info: "Ошибка"})
    } else {
        let res = await DB.deleteMessage(data.token, data.idMessage);
        //socket.broadcast.to(data.idRoom).emit('delete', {id: data.idMessage, idRoom: data.idRoom});
        return ({success: res});
    }


}

/**
 * Создание комнаты(чата)
 * @param data - data.token - токен сессии, data.name - название комнаты(чата), data.users - массив добавляемых пользователей (или разделитель - запятая)
 * @param callback { success: true, data: { idRoom, roomName:} } or {success: false, info: "Ошибка. ..."}
 */
async function createRoom(data) {
    let users;
    if (!data.name) {
        return ({
            success: false,
            info: "Ошибка. Не выбрано название"
        })
    } else if (isEmpty(data.name)) {
        return ({
            success: false,
            info: "Ошибка. Не выбрано название"
        })
    } else if (!data.token) {
        return ({
            success: false,
            info: "Ошибка. Отсутствует токен"
        })
    } else if (isEmpty(data.token)) {
        return ({
            success: false,
            info: "Ошибка. Отсутствует токен"
        })
    } else {
        if (typeof(data.users) === "string") {
            users = data.users.split(",")
        } else {
            users = data.users
        }
        let id = await DB.createRoom(data.token, data.name, users);
        if (id !== undefined)
            return ({
                success: true, data: {
                    idRoom: id,
                    roomName: data.name
                }
            });
        else {
            return ({success: false, info: "Dialog is already created"});
        }
    }
}

/**
 * Добавление в уже существующий чат
 * @param data - data.token - токен автора комнаты, data.users - массив логинов, data.idRoom - id комнаты(чата)
 * @return callback - true - в положительном случае, false - при ошибке.
 * @public
 */
async function addInRoom(data, callback) {
    let users;
    if (!data.token || isEmpty(data.token)) {
        return ({
            success: false,
            info: "Ошибка в поле token"
        })
    } else if (!data.users || isEmpty(data.users)) {
        return ({
            success: false,
            info: "Ошибка в поле user"
        })
    } else if (!data.idRoom || isEmpty(data.idRoom)) {
        return ({
            success: false,
            info: "Ошибка в поле idRoom"
        })
    } else {
        if (typeof(data.users) === "string") {
            users = data.users.split(",")
        } else {
            users = data.users
        }
        let res = await DB.addInRoom(data.token, users, data.idRoom);
        return ({success: res})
    }
}

/**
 * Выход из комнаты(чата)
 * @param data - data.token - токен пользователя, data.idRoom - id комнаты
 * @return возвращает {success: true/false, info: "info message about error(if success = false) "}
 */
async function deleteFromRoom(data) {
    if (!data.token || isEmpty(data.token)) {
        return ({
            success: false,
            info: "Ошибка в поле token"
        })
    } else if (!data.idRoom || isEmpty(data.idRoom)) {
        return ({
            success: false,
            info: "Ошибка в поле idRoom"
        })
    } else {
        let res = await DB.deleteFromRoom(data.token, data.idRoom);
        return ({success: res})
    }
}

/**
 * Удаление из комнаты(чата)
 * @param data - data.token - токен автора комнаты,data.login - логин удаляемого пользователя, data.idRoom - id комнаты
 * @return возвращает {success: true/false, info: "info message about error(if success = false) "}
 */
async function deleteUsersFromRoom(data) {
    if (!data.token || isEmpty(data.token)) {
        return ({
            success: false,
            info: "Ошибка в поле token"
        });
    } else if (!data.idRoom || isEmpty(data.idRoom)) {
        return ({
            success: false,
            info: "Ошибка в поле idRoom"
        });
    } else if (!data.login || isEmpty(data.login)) {
        return ({
            success: false,
            info: "Ошибка в поле login"
        });
    } else {
        let res = await DB.deleteUsersFromRoom(data.token, data.login, data.idRoom);
        return ({success: res});
    }

}

/**
 * Удаление комнаты(чата)
 * @param data - data - data.token - токен пользователя, data.idRoom - id комнаты
 * @return возвращает {success: true/false, info: "info message about error(if success = false) "}
 */
async function deleteRoom(data) {
    if (!data.token || isEmpty(data.token)) {
        return ({
            success: false,
            info: "Ошибка в поле token"
        });
    } else if (!data.idRoom || isEmpty(data.idRoom)) {
        return ({
            success: false,
            info: "Ошибка в поле idRoom"
        });
    } else {
        let res = await DB.deleteRoom(data.token, data.idRoom);
        return ({success: res});
    }
}

/**
 * Удаление пользователя
 * @param data - data.login - логин пользователя, data.password - пароль.
 * @return возвращает true в случае успеха
 */
async function deleteUser(data) {
    if (!data.login) {
        return ({success: false, info: "Ошибка в поле логин"})
    } else if
    (!data.password) {
        return ({success: false, info: "Ошибка в поле пароля"})
    } else {
        let res = await DB.deleteUser(data.login, data.password);
        return ({success: res});
    }
}

/**
 * Выгрузка сообщений
 * @param data - data.token - токен пользователя, data.idRoom - id комнаты(чата), data.limit - лимит выгрузки
 * @return возвращает массив последних сообщений в количестве limit штук.
 */
async function showMessage(data) {
    if (!data.idRoom) {
        return ({success: false, info: "Ошибка. Не выбрана комната"})
    } else if
    (!data.limit) {
        return ({success: false, info: "Ошибка. Не выбран лимит"})
    } else {
        let res = DB.showMessage(data.token, data.idRoom, data.limit);
        return ({success: true, rows: res});
    }
}

/**
 * Выгрузка комнат(чатов)
 * @param data data.token - токен пользователя
 * @return возвращает массив комнат (чатов)
 */
async function showRoom(data) {
    if (isEmpty(data.token)) {
        return ({success: false, info: "Ошибка подписи при загрузке диалогов"})
    } else if
    (!data.token) {
        return ({success: false, info: "Ошибка подписи при загрузке диалогов"})
    } else {
        let res = await DB.showRoom(data.token);
        return ({success: true, rooms: res});
    }
}

