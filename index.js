const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const Joi = require('joi');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');
const camproutes = require('./routers/camps');
const userroutes = require('./routers/users');
const bcrypt = require('bcrypt');
const Msg = require('./models/message');



app.use(methodOverride('_method'))



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

const Camps = require('./models/camps');
const User = require('./models/user');
const Post = require('./models/Posts');
const { campsSchema, UserSchema } = require('./schemas');

const { isLoggedin } = require('./middleware');


const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { findByIdAndDelete } = require('./models/camps');
const Posts = require('./models/Posts');

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

const sessionConfig = {
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());



mongoose.set('strictQuery', true)
mongoose.connect('mongodb://localhost:27017/Camps', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4
})
    .then(() => {
        console.log("CONNECTION OPENED");
    })
    .catch((err) => {
        console.log(" MONGO ERROR EROOR OCCURED!!");
        console.log(err);
    })


app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.get('/login', (req, res) => {
    res.render('./Users/login');
})

app.get('/logout', (req, res) => {
    req.session.flash = { 'success': 'Goodbye!!' }; 
    console.log(req.session);
    delete (req.session).passport;
    res.redirect('/');
})

app.use('/camps', camproutes);
app.use('/users', userroutes);

app.get('/', (req, res) => {
    res.render('./homepage')
})

app.get('/newposts',async (req, res) => {
    const Posts = await Post.find({}).populate("user").populate("sender");
    console.log(Posts);
    res.render('./Posts/RecentPosts.ejs',{Posts});
})



app.post('/:id/donate', async(req, res) => {
    const { id } = req.params;
    let { money } = req.body;
    if (!money) {
        req.session.flash = { 'error': "Please Enter Valid money" };
        return  res.redirect(`/posts/${id}`)
    }
    const post = await Posts.findById(id);
    if (req.session && req.session.passport) {
        const users = await User.find({ username: req.session.passport.user }); 
        post.user.push(users[0]);
        post.money.push(money);
        await post.save();
    }
    res.redirect(`/posts/${post._id}`);
})




app.get('/posts/:id',async(req, res) => {
    let { id } = req.params;
    const post = await Posts.findById(id).populate("user").populate("sender");
    let user = null;
    if(req.session.passport && req.session.passport.user){
        user = req.session.passport.user;
    }
    res.render('./Posts/Show', { post ,user});
})



app.get('/message/:id', isLoggedin, catchAsync(async (req, res) => {
    let { id } = req.params;
    let { message } = req.body;
    const usname = req.session.name.name | req.session.passport.user;
    if (usname == req.session.name.name) {
        const camp = await Camps.find({ name: usname });
        const user = await User.findById(id);
        const Msg = new Msg();
        Msg.message = message;
        Msg.senderid= camp;
        Msg.receiverid= user;
        await Msg.save(); 
        return res.redirect(`/users/${id}`);
    } 

}));







app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})


app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('./error', { err });
})



app.listen(8080, () => {
    console.log("Serving on the LocalHost 8080");
})