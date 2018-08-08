const express = require('express'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    _logger = require('morgan'),
    app = express(),
    log = require('./middleware/logger').log;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(_logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

const routes = require('./routes/main')(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    log("INFO", "лезут куда не поподя", req.url);
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
