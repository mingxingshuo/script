var express = require('express');
var app = express();

var get_users = require('./routes/get_users');
var get_shouzhan = require('./routes/get_shouzhan');
var another_guest = require('./routes/another_guest');

app.use('/get_users', get_users);
app.use('/get_shouzhan', get_shouzhan);
app.use('/record_users', record_users);
app.use('/another_guest', another_guest);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
