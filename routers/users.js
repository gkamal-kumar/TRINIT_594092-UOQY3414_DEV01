const express = require('express');
const router = express.Router();
const Camps = require('../models/camps');
const User = require('../models/user');
const Post = require('../models/Posts');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { UserSchema } = require('../schemas');
const passport = require('passport');
const LocalStrategy = require('passport-local');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
router.use(passport.session());
router.use(passport.initialize());
const { isLoggedin } = require('../middleware');

const validateusers = (req, res, next) => {
    console.log(req.body);
    const { error } = UserSchema.validate(req.body);
    console.log(error);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


router.get('/',async (req, res) => {
    const allusers = await User.find({});
    console.log(req.user)
    res.render('./Users/users', { allusers });
})

router.get('/new',  (req, res) => {
    res.render('./Users/register');
})




router.post('/register', validateusers, catchAsync(async (req, res) => {
    if (!req.body.User) {
        throw new ExpressError('Invalid Campground Data', 400);
    }
    req.flash('success', 'Successfully made a new User! ');
    const Users = req.body.User;
    const user = new User({ email: Users.email, address: Users.address, phoneNumber: Users.phoneNumber, description: Users.description, username: Users.name })
    const newUser = await User.register(user, Users.password);
    await newUser.save();
    res.redirect(`/users/${newUser._id}`);
}));



router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    res.render('./Users/Show', { user });
})




router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: "/login" }), async(req, res) => {
    req.flash('success', 'Welcome Back!!');
    res.redirect('/camps');
})





router.delete('/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'you must be signed in');
        return res.redirect('/login'); r
    }
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.redirect('/users')
})

module.exports = router;
