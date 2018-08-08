-- --------------------------------------------------------
-- Хост:                         127.0.0.1
-- Версия сервера:               5.7.20-0ubuntu0.16.04.1 - (Ubuntu)
-- Операционная система:         Linux
-- HeidiSQL Версия:              9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Дамп структуры базы данных CHAT
CREATE DATABASE IF NOT EXISTS `CHAT` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */;
USE `CHAT`;

-- Дамп структуры для таблица CHAT.Access
CREATE TABLE IF NOT EXISTS `Access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idUser` int(11) NOT NULL,
  `token` char(150) COLLATE utf8_unicode_ci NOT NULL,
  `dateStart` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dateEnd` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idUser` (`idUser`),
  CONSTRAINT `FK_Access_Users` FOREIGN KEY (`idUser`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3474 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица CHAT.File
CREATE TABLE IF NOT EXISTS `File` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `path` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица CHAT.FriendList
CREATE TABLE IF NOT EXISTS `FriendList` (
  `idUser` int(11) NOT NULL,
  `idFriend` int(11) NOT NULL,
  PRIMARY KEY (`idUser`,`idFriend`),
  KEY `FK_friendList_Users_2` (`idFriend`),
  CONSTRAINT `FK_friendList_Users` FOREIGN KEY (`idUser`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_friendList_Users_2` FOREIGN KEY (`idFriend`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица CHAT.Image
CREATE TABLE IF NOT EXISTS `Image` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `path` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=320 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица CHAT.Message
CREATE TABLE IF NOT EXISTS `Message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idRoom` int(11) NOT NULL,
  `idSender` int(11) NOT NULL,
  `text` text COLLATE utf8_unicode_ci,
  `idFile` int(11) DEFAULT NULL,
  `idImage` int(11) DEFAULT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idFile` (`idFile`),
  KEY `idImage` (`idImage`),
  KEY `idSender` (`idSender`),
  KEY `idRoom` (`idRoom`),
  CONSTRAINT `FK_Message_File` FOREIGN KEY (`idFile`) REFERENCES `File` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_Message_Image` FOREIGN KEY (`idImage`) REFERENCES `Image` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_Message_Rooms` FOREIGN KEY (`idRoom`) REFERENCES `Rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_Message_Users` FOREIGN KEY (`idSender`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=942 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица CHAT.Room
CREATE TABLE IF NOT EXISTS `Room` (
  `idUser` int(11) NOT NULL,
  `idRoom` int(11) NOT NULL,
  PRIMARY KEY (`idUser`,`idRoom`),
  KEY `idUser` (`idUser`),
  KEY `idRoom` (`idRoom`),
  CONSTRAINT `FK__Rooms` FOREIGN KEY (`idRoom`) REFERENCES `Rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK__Users` FOREIGN KEY (`idUser`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица CHAT.Rooms
CREATE TABLE IF NOT EXISTS `Rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `author` int(11) NOT NULL,
  `roomName` char(50) COLLATE utf8_unicode_ci NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_Rooms_Users` (`author`),
  CONSTRAINT `FK_Rooms_Users` FOREIGN KEY (`author`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=794 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица CHAT.Users
CREATE TABLE IF NOT EXISTS `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` char(20) COLLATE utf8_unicode_ci NOT NULL,
  `password` char(130) COLLATE utf8_unicode_ci NOT NULL,
  `salt` char(20) COLLATE utf8_unicode_ci NOT NULL,
  `firstName` char(20) COLLATE utf8_unicode_ci NOT NULL,
  `lastName` char(20) COLLATE utf8_unicode_ci NOT NULL,
  `dateOfRegistration` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=2446 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Экспортируемые данные не выделены.
-- Дамп структуры для процедура CHAT.AddFile
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `AddFile`(
	IN `_idSender` INT,
	IN `_idRoom` INT,
	IN `_fileName` CHAR(50),
	IN `_path` CHAR(250)






)
    COMMENT 'id отправителя, id комнаты, название файла, путь'
BEGIN
	INSERT INTO `File` SET 
		`File`.`path` = _path;
	INSERT INTO `Message` SET 
		`Message`.`idRoom` = _idRoom,
		`Message`.`idSender`=_idSender,
		`Message`.`text` = _fileName,
		`Message`.`idFile` = (SELECT `id` FROM `File` WHERE `File`.`path`= _path);	
	SELECT `id`, `date` FROM `Message` WHERE `id` = last_insert_id();
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.AddFriend
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `AddFriend`(
	IN `_idUser` INT,
	IN `_friend` CHAR(20)





)
    COMMENT 'id пользователя, login друга'
BEGIN
	SELECT `id` FROM `Users` WHERE `login` = _friend INTO @_idFriend;
	IF NOT EXISTS(SELECT * FROM `FriendList`
				 WHERE `idUser` =_idUser AND `idFriend` = @_idFriend OR  
				  `idFriend` =_idUser AND `idUser` = @_idFriend)
	THEN 
		INSERT INTO `FriendList` SET
			`idUser` = _idUser,
			`idFriend` = @_idFriend;	
	END IF;
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.AddImage
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `AddImage`(
	IN `_idSender` INT,
	IN `_idRoom` INT,
	IN `_path` CHAR(250)








)
    COMMENT 'id отправителя, id комнаты, путь в изображению'
BEGIN
	INSERT INTO `Image` SET 
	`Image`.`path` = _path;
	INSERT INTO `Message` SET 
		`Message`.`idRoom` = _idRoom,
		`Message`.`idSender` = _idSender,
		`Message`.`idImage` = (SELECT `id` FROM `Image` WHERE `path` = _path);		
	SELECT `id`, `date` FROM `Message` WHERE `id` = last_insert_id();
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.AddInRoom
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `AddInRoom`(
	IN `_token` CHAR(170),
	IN `_login` CHAR(20),
	IN `_idRoom` INT







)
    COMMENT 'login пользователя, id комнаты'
BEGIN
	IF EXISTS(SELECT * FROM `Rooms` WHERE `Rooms`.`author` = 
	(SELECT `idUser` FROM `Access` WHERE `Access`.`token`=_token))
	THEN
		INSERT INTO `Room` SET 
			`Room`.`idUser` = (SELECT `id` FROM `Users` WHERE `login` = _login),
			`Room`.`idRoom` = _idRoom;
	END IF;		
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.AddMessage
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `AddMessage`(
	IN `_idSender` INT,
	IN `_idRoom` INT,
	IN `_text` TEXT






)
    COMMENT 'id отправителя, id комнаты, text сообщения'
BEGIN
	INSERT INTO `Message` SET 
		`idRoom` = _idRoom, 
		`idSender` = _idSender,
		`text` = _text;
	SELECT `id`, `date` FROM `Message` WHERE `id` = last_insert_id();
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.AuthUsers
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `AuthUsers`(
	IN `_login` CHAR(20),
	IN `_hash` CHAR(160)



)
    COMMENT 'login, hash'
BEGIN
	SELECT EXISTS (SELECT `id` FROM `Users` WHERE `login` = _login AND `password` = _hash) as result;
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.BeInRoom
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `BeInRoom`(
	IN `_idUser` INT,
	IN `_idRoom` INT

)
BEGIN

SELECT EXISTS(SELECT * FROM `Room`
 WHERE `Room`.`idUser` = _idUser 
 AND `Room`.`idRoom`=_idRoom) AS result;
 
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.CreateRoom
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `CreateRoom`(
	IN `_idAuthor` INT,
	IN `_roomName` CHAR(20)



)
    COMMENT 'id автора, название комнаты'
BEGIN
	INSERT INTO `Rooms` SET 
		`Rooms`.`author` = _idAuthor, 
		`Rooms`.`roomName` = _roomName;
	SELECT last_insert_id() as `id`;
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.DeleteFriend
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteFriend`(
	IN `_idUser` INT,
	IN `_friend` CHAR(20)

)
    COMMENT 'id пользователя, id друга'
BEGIN
	SELECT `id` FROM `Users` WHERE `login` = _friend INTO @_idFriend;
	IF EXISTS(SELECT * FROM `FriendList`
				 WHERE `idUser` =_idUser AND `idFriend` = @_idFriend OR  
				  `idFriend` =_idUser AND `idUser` = @_idFriend)
	THEN 
		DELETE FROM `FriendList`
			WHERE  `idUser` =_idUser AND `idFriend` = @_idFriend OR  
					  `idFriend` =_idUser AND `idUser` =@_idFriend;	
	END IF;		  
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.DeleteFromRoom
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteFromRoom`(
	IN `_token` CHAR(130),
	IN `_idRoom` INT






)
    COMMENT 'token пользователя, id комнаты'
BEGIN
	DELETE FROM `Room` 
		WHERE `idRoom` = _idRoom AND 
		`idUser` = (SELECT `idUser` FROM `Access` WHERE `token` = _token);
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.DeleteMessage
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteMessage`(
	IN `_idUser` INT
,
	IN `_idMessage` INT
)
BEGIN
	DELETE FROM `Message` 
	WHERE `id` = _idMessage 
	AND `idSender` = _idUser;
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.DeleteRoom
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteRoom`(
	IN `_token` CHAR(130),
	IN `_idRoom` INT





)
    COMMENT 'id автора, id комнаты'
BEGIN
	DELETE FROM `Rooms` 
		WHERE `author` = (SELECT `idUser` FROM `Access` WHERE `token` = _token) AND
		`id` = _idRoom;
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.DeleteUser
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteUser`(
	IN `_idUser` CHAR(20)
)
    COMMENT 'id пользователя'
BEGIN
	DELETE FROM `Users` WHERE `login` = _idUser; 
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.DeleteUsersFromRoom
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteUsersFromRoom`(
	IN `_token` CHAR(130),
	IN `_login` CHAR(20),
	IN `_idRoom` INT




)
    COMMENT 'token админа комнаты, login удаляемого пользователя, id комнаты'
BEGIN
	IF ((SELECT `idUser` FROM `Access` WHERE `token` = _token) 
		=
		(SELECT `author` FROM `Rooms` WHERE `id` = _idRoom))
	THEN
		DELETE FROM `Room` 
			WHERE `idRoom` = _idRoom 
			AND `idUser` = (SELECT `id` FROM `Users` WHERE `login` = _login);
	END IF;	
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.GetSalt
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetSalt`(
	IN `_user` CHAR(20)
)
    COMMENT 'login пользователя'
BEGIN
	SELECT `salt` FROM `Users` WHERE `login` = _user; 
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.GetUserInfo
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetUserInfo`(
	IN `_token` CHAR(160)



)
    COMMENT 'токен сессии'
BEGIN
	SELECT `id`,`login`, `firstName`, `lastName` 
	FROM `Users`
	WHERE `id` = (SELECT `idUser` FROM `Access` WHERE `token` = _token);
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.Registration
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `Registration`(
	IN `_login` CHAR(20) ,
	IN `_pass` CHAR(160),
	IN `_firstName` CHAR(20),
	IN `_lastName` CHAR(20)
,
	IN `_salt` CHAR(20)






)
    COMMENT 'логин, пасс, имя, фамилия, соль'
BEGIN
	IF NOT EXISTS(SELECT id 
				 FROM `Users`   
				 WHERE `Users`.`login` = _login) 
	THEN 
	
		INSERT INTO `Users` SET          
		   `Users`.`login` = _login,
	      `Users`.`password` = _pass,
	      `Users`.`firstName` = _firstName,
	      `Users`.`lastName` = _lastName, 
	      `Users`.`salt` = _salt;
		SELECT true as 'result' ;
	ELSE 
		SELECT false as 'result';
	END IF;	
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.SetToken
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `SetToken`(
	IN `_login` CHAR(20),
	IN `_token` CHAR(160),
	IN `_expires` INT

)
    COMMENT 'логин, токен сессии, срок действия (в месецах)'
BEGIN
	INSERT INTO `Access` SET 
		`Access`.`idUser` = (SELECT `id` FROM `Users` WHERE `Users`.`login` = _login),
		`Access`.`token` = _token,
		`Access`.`dateEnd` = DATE_ADD(now(), INTERVAL _expires MONTH);	
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.ShowFriendList
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `ShowFriendList`(
	IN `_idUser` INT

)
    COMMENT 'id пользователя'
BEGIN
	SELECT `idUser`, `login`, `firstName`, `lastName`  
	FROM `FriendList` 
	LEFT JOIN `Users` on `FriendList`.`idUser` = `Users`.`id`
	WHERE  `idFriend` = _idUser
	UNION 
	SELECT `idFriend`, `login`, `firstName`, `lastName`
	FROM `FriendList`
	LEFT JOIN `Users` on `FriendList`.`idFriend` = `Users`.`id` 
	WHERE `idUser` = _idUser;
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.ShowMessage
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `ShowMessage`(
	IN `_idRoom` INT,
	IN `_limit` INT









)
    COMMENT 'id комнаты, лимит смс'
BEGIN
	SELECT * FROM 
		(SELECT `Message`.`id`,`idSender`, 
			`Users`.`login` as 'sender', 
			`text`,
			`Image`.`path` as 'imgPath',
			`File`.`path` as 'filePath', 
			`date`
		FROM `Message`
		LEFT join `Users` on  `Message`.`idSender` = `Users`.`id`
		LEFT join `Image` on `Image`.`id` = `Message`.`idImage`
		LEFT join `File` on `File`.`id` = `Message`.`idFile`
		WHERE `idRoom` = _idRoom ORDER BY `Message`.`id` DESC
		LIMIT _limit )t
	ORDER BY `t`.`id`; 
END//
DELIMITER ;

-- Дамп структуры для процедура CHAT.ShowRoom
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `ShowRoom`(
	IN `_idUser` INT


)
    COMMENT 'id пользователя'
BEGIN
	SELECT `Rooms`.`id`,`roomName`, `Rooms`.`author`, `Rooms`.`date` FROM `Room`
	LEFT JOIN `Rooms` on `Room`.`idRoom` = `Rooms`.`id`
	WHERE `Room`.`idUser` = _idUser GROUP BY `idRoom`;
END//
DELIMITER ;

-- Дамп структуры для событие CHAT.DeleteOldToken
DELIMITER //
CREATE DEFINER=`root`@`localhost` EVENT `DeleteOldToken` ON SCHEDULE EVERY 1 DAY STARTS '2017-12-22 11:04:41' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
	DELETE FROM `Access` WHERE `dateEnd` < now(); 
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
