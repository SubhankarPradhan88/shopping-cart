// const http = require('http');
const path = require('path');

const express = require('express');

const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

// const expressHbs = require('express-handlebars');

// const routes = require('./routes');
// const server = http.createServer(routes.handler);

// Configuration for dynamic template views using PUG or handlebars

// app.engine(
//     'hbs',
//     expressHbs({
//       layoutsDir: 'views/layouts/',
//       defaultLayout: 'main-layout',
//       extname: 'hbs'
//     })
//   );

// app.set('view engine', 'pug');       // DEFAULT templating engine (PUG)
// app.set('view engine', 'hbs');       // DEFAULT templating engine (handlebars)
app.set('view engine', 'ejs');          // DEFAULT templating engine (EJS)
app.set('views', 'views');              // By default second parameter naming is views, change it accordingly

app.use(bodyParser.urlencoded({ extended: false }));       // Express parser (Middleware), parse the incoming data
app.use(express.static(path.join(__dirname, 'public')));   // Static middleware which gives only readonly / static content, it can be used to import css, js 

// app.use('/admin', adminData.routes);

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);