const path = require('path');

const express = require('express');

const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.set('view engine', 'ejs');          // DEFAULT templating engine (EJS)
app.set('views', 'views');              // By default second parameter naming is views, change it accordingly

app.use(bodyParser.urlencoded({ extended: false }));       // Express parser (Middleware), parse the incoming data
app.use(express.static(path.join(__dirname, 'public')));   // Static middleware which gives only readonly / static content, it can be used to import css, js 

app.use((req, res, next) => {
    User.findById('60a4f58440ec07862220169d')
        .then(user => {
            req.user = new User(user.name, user.email, user.cart, user._id);
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
    app.listen(3000);
});