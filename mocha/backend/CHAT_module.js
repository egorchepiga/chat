let assert = require('chai').assert;
const DB = require('../../middleware/DBcore'),
    CHAT = require('../../middleware/CHATcore.js');

describe('Нормализация текста', () => {
    before((done) => {
        done();
    });

    it('Убираем пробелы, если их более 1 подряд', (done) => {
        let text1 = "1 2    3          4",
            result1 = "1 2 3 4";
        try {
            assert.equal(CHAT.normaMessage(text1), result1);
            done();
        } catch (e) {
            console.log("Было  ", text1);
            console.log("Cтало ", result1);
            done(e);
        }
    });

    it('Убираем пробелы (No-Break Space)', (done) => {
        let text2 = "1 2     3   4",
            result2 = "1 2 3 4";
        try {
            assert.equal(CHAT.normaMessage(text2), result2);
            done();
        } catch (e) {
            console.log("Было  ", text2);
            console.log("Cтало ", result2);
            done(e);
        }
    });

    it('Убираем табы', (done) => {
        let text3 = "1   2                    3   4",
            result3 = "1 2 3 4";
        try {
            assert.equal(CHAT.normaMessage(text3), result3);
            done();
        } catch (e) {
            console.log("Было  ", text3);
            console.log("Cтало ", result3);
            done(e);
        }
    });


    it('Убираем пробелы вначале текста', (done) => {
        let text4 = "           1   2 3   4",
            result4 = "1 2 3 4";
        try {
            assert.equal(CHAT.normaMessage(text4), result4);
            done();
        } catch (e) {
            console.log("Было  ", text4);
            console.log("Cтало ", result4);
            done(e);
        }
    });

    it('Убираем пробелы в конце текста', (done) => {
        let text5 = "1   2 3   4        ",
            result5 = "1 2 3 4";
        try {
            assert.equal(CHAT.normaMessage(text5), result5);
            done();
        } catch (e) {
            console.log("Было  ", text5);
            console.log("Cтало ", result5);
            done(e);
        }

    });
});

describe('Проверка входных данных', () => {
    before((done) => {
        done();
    });
    it('Проверка на смс из пробелов', (done) => {
        let text1 = "               ";
        try {
            assert.equal(CHAT.isSpaced(text1), true);
            done();
        } catch (e) {
            console.log("Входной текст: '", text1, "'");
            console.log("Результат: ", true, " (смс из пробелов)");
            done(e);
        }
    });
    it('Проверка на смс не из пробелов', (done) => {
        let text1 = "       NotOnlyIsSpace        ";
        try {
            assert.equal(CHAT.isSpaced(text1), false);
            done();
        } catch (e) {
            console.log("Входной текст: '" + text1 + "'");
            console.log("Результат: ", false, " (смс без пробелов)");
            done(e);
        }
    });
    it('Проверка на существование входных данных', (done) => {
        let text1 = "тут есть текст";
        try {
            assert.equal(CHAT.isEmpty(text1), false);
            done();
        } catch (e) {
            console.log("Входной текст: '" + text1 + "'");
            console.log("Результат: ", false, " (входные данные существует)");
            done(e);
        }
    });
    it('Проверка на НЕ существование входных данных', (done) => {
        let text1;
        try {
            assert.equal(CHAT.isEmpty(text1), true);
            done();
        } catch (e) {
            console.log("Входной текст: '" + text1 + "'");
            console.log("Результат: ", true, " (входныx данных НЕ существует)");
            done(e);
        }
    });
    it('Проверка на НЕ существование входных данных', (done) => {
        let text1 = "";
        try {
            assert.equal(CHAT.isEmpty(text1), true);
            done();
        } catch (e) {
            console.log("Входной текст: '" + text1 + "'");
            console.log("Результат: ", true, " (входныx данных НЕ существует)");
            done(e);
        }
    });
    describe('Проверка входных данных для регистрации', () => {
        it('Заполненные входные данные', (done) => {
            let firstName, lastName, login, password,
                data = {
                    firstName: "test",
                    lastName: "test",
                    login: "test",
                    password: "test"
                };
            try {
                assert.equal(CHAT.isReadyForReg(data), true);
                done();
            } catch (e) {
                console.log("Входной текст: '" + JSON.stringify(data) + "'");
                console.log("Результат: ", true, "");
                done(e);
            }
        });
        it('Пустые входные данные', (done) => {
            let firstName, lastName, login, password,
                data = {
                    firstName: "",
                    lastName: "",
                    login: "",
                    password: ""
                };
            try {
                assert.equal(CHAT.isReadyForReg(data), false);
                done();
            } catch (e) {
                console.log("Входной текст: '" + JSON.stringify(data) + "'");
                console.log("Результат: ", false, " (входные данные пустые)");
                done(e);
            }
        });
        it('Пустые некоторые входные данные', (done) => {
            let firstName, lastName, login, password,
                data = {
                    firstName: "",
                    lastName: "",
                    login: "test",
                    password: "test"
                };
            try {
                assert.equal(CHAT.isReadyForReg(data), false);
                done();
            } catch (e) {
                console.log("Входной текст: '" + JSON.stringify(data) + "'");
                console.log("Результат: ", false, "");
                done(e);
            }
        });
        it('Данные undefined', (done) => {
            let firstName, lastName, login, password,
                data = {
                    firstName,
                    lastName,
                    login,
                    password
                };
            try {
                assert.equal(CHAT.isReadyForReg(data), false);
                done();
            } catch (e) {
                console.log("Входной текст: '" + JSON.stringify(data) + "'");
                console.log("Результат: ", false, "");
                done(e);
            }
        });
        it('Данные длинные', (done) => {
            let firstName, lastName, login, password,
                data = {
                    firstName: "111111111111111111111",
                    lastName: "111111111111111111111",
                    login: "1111111111111111111111",
                    password: "11111111111111111111111"
                };
            try {
                assert.equal(CHAT.isReadyForReg(data), false);
                done();
            } catch (e) {
                console.log("Входной текст: '" + JSON.stringify(data) + "'");
                console.log("Результат: ", false, "");
                done(e);
            }
        });
    })

});

describe('регистрация', () => {
    const USER = "test";

    it('Заполненные входные данные', (done) => {
        let login, password, lastName, firstName;
        data = {
            login: USER,
            password: USER,
            lastName: USER,
            firstName: USER
        };
        CHAT.register(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });
    it('Удаление пользователя', (done) => {
        let login, password;
        data = {
            login: USER,
            password: USER
        };
        CHAT.deleteUser(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });
    it('Ошибка при пустом логине', (done) => {
        let login, password, lastName, firstName;
        data = {
            login: "",
            password: USER,
            lastName: USER,
            firstName: USER
        };
        CHAT.register(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });

    });
    it('Ошибка при пустом пароле', (done) => {
        let login, password, lastName, firstName;
        data = {
            login: USER,
            password: "",
            lastName: USER,
            firstName: USER
        };
        CHAT.register(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });

    });
    it('Ошибка при пустом имени', (done) => {
        let login, password, lastName, firstName;
        data = {
            login: USER,
            password: USER,
            lastName: "",
            firstName: USER
        };
        CHAT.register(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка при пустой фамилии', (done) => {
        let login, password, lastName, firstName;
        data = {
            login: USER,
            password: USER,
            lastName: USER,
            firstName: ""
        };
        CHAT.register(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка при undefined логине', (done) => {
        let login, password, lastName, firstName;
        data = {
            login,
            password: USER,
            lastName: USER,
            firstName: USER
        };
        CHAT.register(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка при undefined пароле', (done) => {
        let login, password, lastName, firstName;
        data = {
            login: USER,
            password,
            lastName: USER,
            firstName: USER
        };
        CHAT.register(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка при undefined имени', (done) => {
        let login, password, lastName, firstName;
        data = {
            login: USER,
            password: USER,
            lastName,
            firstName: USER
        };
        CHAT.register(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка при undefined фамилии', (done) => {
        let login, password, lastName, firstName;
        data = {
            login: USER,
            password: USER,
            lastName: USER,
            firstName
        };
        CHAT.register(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка при длинном логине', (done) => {
        let login, password, lastName, firstName;
        data = {
            login: USER + USER + USER + USER + USER + USER + USER + USER + USER + USER + USER,
            password: USER,
            lastName: USER,
            firstName: USER
        };
        CHAT.register(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка при длинном пароле', (done) => {
        let login, password, lastName, firstName;
        data = {
            login: USER,
            password: USER + USER + USER + USER + USER + USER + USER + USER + USER + USER + USER,
            lastName: USER,
            firstName: USER
        };
        CHAT.register(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка при длинном имени', (done) => {
        let login, password, lastName, firstName;
        data = {
            login: USER,
            password: USER,
            lastName: USER + USER + USER + USER + USER + USER + USER + USER + USER + USER + USER,
            firstName: USER
        };
        CHAT.register(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка при длинном фамилии', (done) => {
        let login, password, lastName, firstName;
        data = {
            login: USER,
            password: USER,
            lastName: USER,
            firstName: USER + USER + USER + USER + USER + USER + USER + USER + USER + USER + USER
        };
        CHAT.register(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
});

describe('авторизация', () => {
    const USER = "test";
    let token;
    before((done) => {
        DB.register(USER, USER, USER, USER, USER)
            .then(()=>{
            return DB.authorization(USER, USER);
            })
            .then((t) => {
                if(t!==0) token=t;
                done();
            })
    });
    after((done) => {
        DB.deleteUser(USER, USER)
            .then((r) => {
                done();
            })
    });

    it('Заполненные входные данные', (done) => {
        let login, password,
            data = {
                login: USER,
                password: USER
            };
        CHAT.login(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });

    it('Получение информации по токену', (done) => {
        let data = {
            token
        };
        CHAT.getUserInfo(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });

    it('Ошибка undefined в логине', (done) => {
        let login, password,
            data = {
                login,
                password: USER
            };
        CHAT.login(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка undefined в пароле', (done) => {
        let login, password,
            data = {
                login: USER,
                password
            };
        CHAT.login(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка пустой пароль', (done) => {
        let login, password,
            data = {
                login: USER,
                password: ""
            };
        CHAT.login(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка длинный логин', (done) => {
        let login, password,
            data = {
                login: USER + USER + USER + USER + USER + USER + USER + USER + USER + USER,
                password: USER
            };
        CHAT.login(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка длинный пароль', (done) => {
        let login, password,
            data = {
                login: USER,
                password: USER + USER + USER + USER + USER + USER + USER + USER + USER + USER
            };
        CHAT.login(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
});

describe('комнаты(чаты)', () => {
    const USER = "test",
        USER2 = "test2";
    let token, idRoom;

    before((done) => {
        DB.register(USER, USER, USER, USER, USER)
            .then(() => {
                return DB.register(USER2, USER2, USER2, USER2, USER2);
            })
            .then(() => {
                return DB.authorization(USER, USER);
            })
            .then((t) => {
                if (t !== 0) token = t;
                done();
            })
    });
    after((done) => {
        DB.deleteUser(USER, USER)
            .then((r) => {
                return DB.deleteUser(USER2, USER2)
            })
            .then((r) => {
                done();
            })
    });

    it('Создание комнаты(чата) сам с собой', (done) => {
        let data = {
            token: token,
            name: "testRoom",
            users: []
        };
        CHAT.createRoom(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });
    it('Создание комнаты(чата) ', (done) => {
        let data = {
            token: token,
            name: "testRoom",
            users: [USER2]
        };
        CHAT.createRoom(data)
            .then(res => {
                assert.equal(res.success, true);
                idRoom = res.data.idRoom;
                done();
            });
    });
    it('Создание. Отсутствует users', (done) => {
        let data = {
            token: token,
            name: "name"
        };
        CHAT.createRoom(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });
    it('Выгрузка комнат(чатов)', (done) => {
        let data = {
            token: token
        };
        CHAT.showRoom(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });
    it('Ошибка. Пустое название беседы', (done) => {
        let data = {
            token: token,
            name: "",
            users: [USER2]
        };
        CHAT.createRoom(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка. Токен undefined', (done) => {
        let data = {
            token: undefined,
            name: "2134",
            users: [USER2]
        };
        CHAT.createRoom(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка. Название undefined', (done) => {
        let data = {
            token: token,
            name: undefined,
            users: [USER2]
        };
        CHAT.createRoom(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка. Отсутствуе название', (done) => {
        let data = {
            token: token,
            users: [USER2]
        };
        CHAT.createRoom(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Ошибка. Отсутствует токен', (done) => {
        let data = {
            name: "23",
            users: [USER2]
        };
        CHAT.createRoom(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });
    it('Добавление в комнату(чат)', (done) => {
        let data = {
            token: token,
            users: [USER2],
            idRoom: idRoom
        };
        CHAT.addInRoom(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });
    it('Выход из чата', (done) => {
        let data = {
            token: token,
            idRoom: idRoom
        };
        CHAT.deleteFromRoom(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });
    it('Удаление чата', (done) => {
        let data = {
            token: token,
            idRoom: idRoom
        };
        CHAT.deleteRoom(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });
});

describe('список друзей', () => {
    const USER = "test",
        USER2 = "test2";
    let token;
    before((done) => {
        DB.register(USER, USER, USER, USER, USER)
            .then(() => {
                return DB.register(USER2, USER2, USER2, USER2, USER2);
            })
            .then(() => {
                return DB.authorization(USER, USER);
            })
            .then((t) => {
                if (t !== 0) token = t;
                done();
            })
    });
    after((done) => {
        DB.deleteUser(USER, USER)
            .then((r) => {
                return DB.deleteUser(USER2, USER2)
            })
            .then((r) => {
                done();
            })
    });

    it('Дабавление в список друзей', (done) => {
        let data = {
            token: token,
            friend: USER2
        };
        CHAT.addFriends(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });

    it('Выгрузка списка друзей', (done) => {
        let data = {
            token: token
        };
        CHAT.showFriends(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });
    it('Удаление из списка друзей', (done) => {
        let data = {
            token: token,
            friend: USER2
        };
        CHAT.deleteFriend(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });
});

describe('Сообщения', () => {
    const USER = "test",
        USER2 = "test2";
    let token, idMes, idRoom;
    before((done) => {
        DB.register(USER, USER, USER, USER, USER)
            .then(() => {
                return DB.authorization(USER, USER);
            })
            .then((t) => {
                if (t !== 0) token = t;
                return DB.createRoom(token, "test", []);
            })
            .then((id) => {
                idRoom = id;
                done();
            })
    });
    after((done) => {
        DB.deleteUser(USER, USER)
            .then(() => {
                return DB.deleteRoom(token, idRoom)
            })
            .then(() => {
                done();
            })
    });

    it('Обычное сообщение', (done) => {
        let data = {
            token: token,
            text: "testing message",
            idRoom: idRoom
        };
        CHAT.addMessage(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });

    it('Ссылка на картинку', (done) => {
        let data = {
            token: token,
            text: "https://www.google.ru/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
            idRoom: idRoom
        };
        CHAT.addMessage(data)
            .then(res => {
                assert.equal(res.data.attachment !== undefined, true);
                idMes = res.data.id;
                done();
            })
    });

    it('Ошибка. Пустое смс', (done) => {
        let data = {
            token: token,
            text: "          ",
            idRoom: idRoom
        };
        CHAT.addMessage(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });

    it('Ошибка. Отсутствует токен', (done) => {
        let data = {
            token: "",
            text: "12",
            idRoom: idRoom
        };
        CHAT.addMessage(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });

    it('Ошибка. Отсутствует id комнаты', (done) => {
        let data = {
            token: token,
            text: "12",
            idRoom: ""
        };
        CHAT.addMessage(data)
            .then(res => {
                assert.equal(res.success, false);
                done();
            });
    });

    it('Выгрузка смс', (done) => {
        let data = {
            token: token,
            idRoom: idRoom,
            limit: 10
        };
        CHAT.showMessage(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });

    it('Удаление смс', (done) => {
        let data = {
            token: token,
            idMessage: idMes,
            idRoom: idRoom
        };
        CHAT.deleteMessage(data)
            .then(res => {
                assert.equal(res.success, true);
                done();
            });
    });
});

