const CHAT = require('./CHATcore'),
    DB = require('./DBcore');

module.exports = (httpServer, SSLserver) => {
    let io = require('socket.io').listen(httpServer)/*.listen(SSLserver)*/;
    io.on('connection', (socket) => {


            /******ПОЧИНИТЬ!!!!!!*******/
            /*socket.on('sessionInfo', (data, callback) => {
                if (data.token) {
                    /!**добавляем информаци о друзья, для информировании их на онлайн/офлайн**!/
                    CHAT.showFriendList(data)
                        .then(result => {
                            let ar = [];
                            for (i in result.friendlist) {
                                ar.push(result.friendlist[i]);
                            }
                            DB.query("select `id` from `users` where `login`=?", CHAT.checkUser(data.token))
                                .then(res => {
                                    socket.session = {
                                        id: res.rows[0].id,
                                        login: DB.getUserInfo(data.token),
                                        friends: ar
                                    };
                                    return DB.query('select `session` from `access` WHERE `user`=?', CHAT.checkUser(data.token))
                                }).then((r) => {
                                let sessions = [];
                                r.rows.forEach((v, i) => {
                                    sessions.push(v.session);
                                    if (i === r.rows.length - 1) {
                                        socket.session.sessions = sessions;
                                    }
                                });
                                callback(ar);
                            });
                        })
                }*!/
            });*/
            /******ПОЧИНИТЬ!!!!!!*******/
            socket.on('online', () => {
                /*for (let id in io.sockets.sockets) {
                    if (io.sockets.sockets[id].session)
                        if (io.sockets.sockets[id].session.login !== socket.session.login) {
                            io.sockets.sockets[id].session.friends.forEach((value, index, ar) => {
                                if (socket.session.login === value.login) {
                                    socket.emit('online', {
                                        id: io.sockets.sockets[id].session.id,
                                        login: io.sockets.sockets[id].session.login
                                    });
                                    socket.to(id).emit('online',
                                        {
                                            id: value.id,
                                            login: socket.session.login
                                        });
                                }
                            })
                        }
                }*/
            });

            socket.on('disconnect', () => {  //Добавить удаление сессии сокета из таблицы access
                /* for (let id in io.sockets.sockets) {
                     if (io.sockets.sockets[id].session) {
                         if (socket.session)
                             io.sockets.sockets[id].session.friends.forEach((value, index, ar) => {
                                 if (socket.session.UserName === value.login) {
                                     socket.to(id).emit('offline', {
                                         id: socket.session.id,
                                         UserName: socket.session.UserName
                                     });
                                 }
                             })
                     }
                 }*/
            });

            /*+*/
            socket.on('login', async (data, callback) => {
                let result = await CHAT.login(data);
                if (result.success) socket.session = {token: result.data.token, login: result.data.login};

                callback(result);
            });

            /*+*/
            socket.on('register', async (data, callback) => {
                let result = await CHAT.register(data);
                callback(result);
            });

            socket.on('getUserInfo', async (data, callback) => {
                let result = await CHAT.getUserInfo(data);
                callback(result);
            });

            /*+*/
            socket.on('addMessage', async (data, callback) => {
                let result = await CHAT.addMessage(data);
                if (result.success) socket.broadcast.to(data.idRoom).emit('NEW', result);
                callback(result);
            });

            /*+*/
            socket.on('deleteMessage', async (data, callback) => {
                let result = await CHAT.deleteMessage(data);
                callback(result);
            });

            /*+*/
            socket.on('createRoom', async (data, callback) => {
                let result = await CHAT.createRoom(data);
                let users = [];
                users = data.users;
                /*if (result.success !== undefined && result.success !== false)
                    for (let id in io.sockets.sockets) {
                        if (io.sockets.sockets[id].session)
                            if (users.find((i, v, a) => {
                                    if ((io.sockets.sockets[id].session.login) === i) {
                                        socket.to(id).emit('addInRoom', {
                                                text: "вас добавил в чат  пользователь ",
                                                user: socket.session.login,
                                                data: result.data
                                            }
                                        )
                                    }
                                })) {
                            }
                    }*/
                callback(result);

            });

            socket.on('addFriend', async (data, callback) => {
                let res = await CHAT.addFriends(data);
                if (res.success) {
                    callback({
                        success: true,
                        data: {
                            loginFriend: data.login
                        }
                    });
                    let loginFriend = data.friend;
                    /*for (let id in io.sockets.sockets) {
                        if (io.sockets.sockets[id].session)
                            if (io.sockets.sockets[id].session.login === loginFriend) {
                                socket.to(id).emit('addInFriend', {
                                    text: "вас добавил в друзья пользователь ",
                                    user: socket.session.login
                                });
                                callback({
                                    success: true,
                                    data: {
                                        loginFriend
                                    },
                                    info: "Done"
                                })
                            }
                    }*/
                } else {
                    callback({success: false, info: "Ошибка добавления пользователя"})
                }
            });

            socket.on('showFriendList', async (data, callback) => {
                let result = await CHAT.showFriends(data);
                callback(result);
            });

            socket.on('deleteFriend', async (data, callback) => {
                let result = await CHAT.deleteFriend(data);
                callback(result);
            });
            socket.on('addInRoom', async (data, callback) => {
                let result = await CHAT.addInRoom(data);
                callback(result);
                /* socket.to(id).emit('addInRoom', {
                     text: "вас добавил в чат  пользователь "
                 });*/

            });
            /*+*/
            socket.on('deleteUser', async (data, callback) => {
                let result = await CHAT.deleteUser(data);
                callback(result);

            });

            /*+*/
            socket.on('deleteRoom', async (data, callback) => {
                let result = await CHAT.deleteRoom(data);
                callback(result);
            });

            /*+*/
            socket.on('deleteFromRoom', async (data, callback) => {
                let result = await CHAT.deleteFromRoom(data);
                callback(result);

            });

            /*+*/
            socket.on('deleteUsersFromRoom', async (data, callback) => {
                let result = await CHAT.deleteUsersFromRoom(data);
                callback(result);
            });
            /*+*/
            socket.on('showMessage', async (data, callback) => {
                let result = await CHAT.showMessage(data);
                if (result.success) socket.join(data.room);
                callback(result);
            });

            /*+*/
            socket.on('showRoom', async (data, callback) => {
                let result = await CHAT.showRoom(data);
                if (result.success) {
                    result.rooms.forEach((row) => {
                        socket.join(row.idRoom);
                    });
                }
                callback(result);
            });
        }
    );

};

