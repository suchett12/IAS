const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const testRoutes = require('./routes/testRoutes');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

app.use(express.json()); // This middleware is necessary for parsing JSON request bodies
app.use(express.urlencoded({ extended: true })); // This middleware is necessary for parsing form data (application/x-www-form-urlencoded)


mongoose.connect('mongodb+srv://suchetpatil:EmVr4Y88R77Ezu3j@cluster0.mlliy.mongodb.net/ias?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("DB Connected"));

app.use('/user', userRoutes);
app.use('/test', testRoutes);

app.get('/', (req, res) => res.render('overview'));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
