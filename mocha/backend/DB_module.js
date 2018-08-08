const DB = require('../../middleware/DBcore'),
    assert = require('chai').assert;


describe('register', () => {

    const rand = new Date().getMilliseconds(),
        USER = "ReGtEsTiNg" + rand,
        USER_SYMB = "[~#&];,:" + rand;

    after((done) => {
        DB.deleteUser(USER, USER)
            .then(() => {
                return DB.deleteUser(USER_SYMB, USER_SYMB)
            })
            .then(() => {
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });


    it('Нормальная регистрация', (done) => {
        DB.register(USER, USER, USER, USER, USER)
            .then(data => {
                assert.equal(data, true);
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    it('Нормальная регистрация (спецсимольный)', (done) => {
        DB.register(USER_SYMB, USER_SYMB, USER_SYMB, USER_SYMB, USER)
            .then(data => {
                assert.equal(data, true);
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    it('Регистрация созданного пользователя', (done) => {
        DB.register(USER, USER, USER, USER, USER)
            .then(data => {
                assert.equal(data, false);
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });


});

describe('authorization', () => {

    const rand = new Date().getMilliseconds(),
        USER = "AuThTeStInG" + rand,
        USER_SYMB = "[~#&];,:1" + rand;

    before((done) => {
        DB.register(USER, USER, USER, USER, USER)
            .then(() => {
                return DB.register(USER_SYMB, USER_SYMB, USER_SYMB, USER_SYMB, USER_SYMB);
            })
            .then(() => {
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    after((done) => {
        DB.deleteUser(USER, USER)
            .then((t) => {
                return DB.deleteUser(USER_SYMB, USER_SYMB);
            })
            .then((t) => {
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    it('Нормальная авторизация', (done) => {
        DB.authorization(USER, USER)
            .then(result => {
                assert.notEqual(result, 0);
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    it('Нормальная авторизация (символьный)', (done) => {
        DB.authorization(USER_SYMB, USER_SYMB)
            .then(result => {
                assert.notEqual(result, 0);
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    it('Неверный login/password', (done) => {
        DB.authorization(USER, "0000")
            .then(result => {
                assert.equal(result, 0);
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });


});

describe('room', () => {
    const rand = new Date().getMilliseconds(),
        USER = "RoOmTeStInG" + rand,
        USER_SYMB = "[~#&];,:2" + rand,
        NAME1 = "1testRoom" + rand,
        USER2 = "2test" + rand;
    let token1 = "",
        token2 = "",
        idRoom = 0;

    before((done) => {
        DB.register(USER, USER, USER, USER, USER)
            .then(() => {
                return DB.register(USER_SYMB, USER_SYMB, USER_SYMB, USER_SYMB, USER_SYMB);
            })
            .then(() => {
                return DB.register(USER2, USER2, USER2, USER2, USER2);
            })
            .then(() => {
                return DB.authorization(USER, USER);
            })
            .then((t) => {
                if (t !== 0) token1 = t;
                return DB.authorization(USER_SYMB, USER_SYMB);
            })
            .then((t) => {
                if (t !== 0) token2 = t;
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    after((done) => {
        DB.deleteUser(USER, USER)
            .then((r) => {
                return DB.deleteUser(USER_SYMB, USER_SYMB);
            })
            .then((r) => {
                return DB.deleteUser(USER2, USER2);
            })
            .then((r) => {
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    it('Создание комнаты', (done) => {
        DB.createRoom(token1, NAME1, [USER_SYMB])
            .then(id => {
                assert.equal(id > 0, true);
                idRoom = id;
                done()
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });
    it('Добавление участников', (done) => {
        DB.addInRoom(token1, [USER2], idRoom)
            .then(res => {
                assert.equal(res, true);
                done()
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    it('Выход из комнаты', (done) => {
        DB.deleteFromRoom(token2, idRoom)
            .then(res => {

                assert.equal(res, true);
                done()
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    it('Загрузка доступных комнат', (done) => {
        DB.showRoom(token1)
            .then(res => {
                assert.equal(res.length > 0, true);
                done()
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    it('Удаление из комнаты', (done) => {
        DB.deleteUsersFromRoom(token1, USER2, idRoom)
            .then(res => {
                assert.equal(res, true);
                done()
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })

    });

    it('Удаление комнаты', (done) => {
        DB.deleteRoom(token1, idRoom)
            .then(res => {
                assert.equal(res, true);
                done()
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

});

describe('message', () => {

    const rand = new Date().getMilliseconds(),
        USER = "MeSsAgEtEsTiNg" + rand;
    let token1 = "",
        idMessage,
        idRoom;

    before((done) => {
        DB.register(USER, USER, USER, USER, USER)
            .then(() => {
                return DB.authorization(USER, USER);
            })
            .then((t) => {
                if (t !== 0) token1 = t;
                return DB.createRoom(token1, "testRoomMessage", [USER]);
            })
            .then((id) => {
                idRoom = id;
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    after((done) => {
        DB.deleteUser(USER, USER)
            .then((r) => {
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });


    it('Создание простого смс', (done) => {
        DB.addMessage(token1, idRoom, "test text")
            .then(res => {
                idMessage = res;
                assert.equal(res.id > 0, true);
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    it('Отправка файла', (done) => {
        DB.addFile(token1, idRoom, "test Name File", rand)
            .then(res => {
                assert.equal(res.id > 0, true);
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    it('Отправка картинки', (done) => {
        DB.addImage(token1, idRoom, rand)
            .then(res => {
                assert.equal(res.id > 0, true);
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    it('Загрузка смс из базы', (done) => {
        DB.showMessage(token1, idRoom, 10)
            .then(res => {
                idMessage = res[0].id;
                assert.equal(res.length > 0, true);
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    it('Удаление смс', (done) => {
        DB.deleteMessage(token1, idMessage)
            .then(res => {
                assert.equal(res, true);
                done()
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });


});

describe('friendList', () => {
    const assert = require('chai').assert,
        rand = new Date().getMilliseconds(),
        USER = "FrIeNdTeStIng" + rand,
        USER_SYMB = "[~#&];/\,:2" + rand;
    let token1 = "",
        token2 = "",
        idRoom = 0;

    before((done) => {
        DB.register(USER, USER, USER, USER, USER)
            .then(() => {
                return DB.register(USER_SYMB, USER_SYMB, USER_SYMB, USER_SYMB, USER_SYMB);
            })
            .then(() => {
                return DB.authorization(USER, USER);
            })
            .then((t) => {
                if (t !== 0) token1 = t;
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    after((done) => {
        DB.deleteUser(USER, USER)
            .then((r) => {
                return DB.deleteUser(USER_SYMB, USER_SYMB);
            })
            .then((r) => {
                done();
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })


    });


    it('Добавление в список друзей', (done) => {
        DB.addFriend(token1, USER_SYMB)
            .then(res => {
                assert.equal(res, true);
                done()
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });


    it('Вывод списка друзей', (done) => {
        DB.showFriends(token1)
            .then(res => {
                assert.equal(res.length > 0, true);
                done()
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });

    it('Удаление из списка друзей', (done) => {
        DB.deleteFriend(token1, USER_SYMB)
            .then(res => {
                assert.equal(res, true);
                done()
            })
            .catch(error => {
                console.log("ERROR", error);
                done();
            })
    });


});

