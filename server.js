const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');

const uri = require('./config/keys').mongoURI;

require('./controllers/user')(passport);

const port = process.env.port || 8080;
const server = express();

server.use(session({ 
	secret: 'secret', 
	resave: true, 
	saveUninitialized: true 
}));

mongoose.connect(uri, { 
	useNewUrlParser: true, 
	useUnifiedTopology: true,
	useCreateIndex: true 
})
  .then(() => console.log('MongoDB Connected'))	
  .catch(err => console.log(err));

server.set("view engine", "ejs");
server.use(express.static("public"));

server.use(express.json());
server.use(express.urlencoded({ 
	extended: true 
}));

server.use(fileUpload({
    createParentPath: true
}));

server.use(passport.initialize());
server.use(passport.session());
server.use(flash());

server.use(function(req, res, next) {
	res.locals.success = req.flash('success');
	res.locals.fail  = req.flash('fail');
	res.locals.error = req.flash('error');
	next();
});

server.use('/', require('./routes/index.js'));
server.use('/users', require('./routes/user.js'));

server.listen(port, function () {
	console.log('Listening on port ' + port)
});
