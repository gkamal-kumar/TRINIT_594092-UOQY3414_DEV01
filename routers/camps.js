const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Camps = require('../models/camps');
const User = require('../models/user');
const Post = require('../models/Posts');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { campsSchema } = require('../schemas');
const passport = require('passport');
const { isLoggedin } = require('../middleware');
const LocalStrategy = require('passport-local');
router.use(passport.session());
router.use(passport.initialize());
const validateCamps = (req, res, next) => {
    const { error } = campsSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.get('/',async (req, res) => {
    const allcamps = await Camps.find({});
    res.render('./Camps/Camps', { allcamps });
})

router.get('/new', (req, res) => {
    res.render('./Camps/register');
})


router.get('/login', (req, res) => {
    res.render('./Camps/login');
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const name = username;
    try {
        const camp = await Camps.findOne({ name });
        const validPassword = bcrypt.compare(password, camp.password);
        if (validPassword) {
            req.session.flash = { 'success': 'Welcome!' };
            return res.redirect(`/camps/${camp.id}`);
        } else {
            req.session.flash = { 'error': 'username or password is incorrect' };
            res.render(`./Camps/login`);
        }
    } catch (e) {
        req.session.flash = { 'error': 'username or password is incorrect' };
        res.render(`./Camps/login`);
    }
});

router.post('/', validateCamps, catchAsync(async (req, res) => {
    req.flash('success', 'Successfully made a new Camp! ')
    const Camp = req.body.camps;
    console.log(Camp);
    const hash = await bcrypt.hash(Camp.password, 12);
    const ngo = new Camps({ email: Camp.email, address: Camp.address, phoneNumber: Camp.phoneNumber, description: Camp.description, name: Camp.name, password: hash })
    console.log(ngo);
    await ngo.save();
    res.redirect(`/camps/${ngo._id}`);
}))

router.get('/:id', async (req, res) => {
    let { id } = req.params;
    const camp = await Camps.findById(id).populate("recentActivity");
    res.render('./Camps/ShowCamps', { camp, msg: req.flash });
})



router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await Camps.findByIdAndDelete(id);
    res.redirect('/camps')
})


router.post('/:id/post', async (req, res) => {
    const { id } = req.params;
    const camp = await Camps.findById(id);
    const { message,title } = req.body;
    const newpost = new Post();
    newpost.message = message;
    newpost.title = message;
    newpost.sender = camp;
    camp.recentActivity.push(newpost);
    await camp.save();
    await newpost.save();
    res.redirect(`/camps/${camp._id}`);
})

router.post('/:id/donate', async(req, res) => {
    const { id } = req.params;
    let { money } = req.body;
    const post = await Post.findById(id);
    if (req.session && req.session.passport) {
        const user = await User.find({ username: req.session.passport.user });  
        console.log(user);
        post.user.push(user[0]);
        post.money.push(money);
        console.log(post);
        await post.save();
    }
    res.redirect(`/posts/${post._id}`);
})

module.exports = router;