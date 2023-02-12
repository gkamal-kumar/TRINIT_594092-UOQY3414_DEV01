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
        req.session.error = { 'error': msg};
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.get('/',isLoggedin,async (req, res) => {
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
            req.session.name = { 'name': camp.name };
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

router.get('/:id', isLoggedin,  async (req, res) => {
    let { id } = req.params;
    let author=null;
    if (req.session && req.session.passport) {
        author = req.session.passport.user;
    }
    const camp = await Camps.findById(id).populate("recentActivity");
    res.render('./Camps/ShowCamps', { camp, msg: req.flash ,author});
})



router.delete('/:id', isLoggedin,async (req, res) => {
    const { id } = req.params;
    await Camps.findByIdAndDelete(id);
    res.redirect('/camps')
})


router.post('/:id/post', isLoggedin, async (req, res) => {
    const { id } = req.params;
    const camp = await Camps.findById(id);
    const { message,title } = req.body;
    const newpost = new Post();
    newpost.message = message;
    newpost.title = title;
    newpost.sender = camp;
    camp.recentActivity.push(newpost);
    await camp.save();
    await newpost.save();
    res.redirect(`/camps/${camp._id}`);
})

router.post('/:id/donate',isLoggedin, async(req, res) => {
    const { id } = req.params;
    let { money } = req.body;
    if (money == null) {
        req.error.flash = { error: 'Please Enter Some Valid Number' };
        return res.render(`./Posts/Show`);
     }
    const post = await Post.findById(id);
    if (req.session && req.session.passport) {
        const user = await User.find({ username: req.session.passport.user });  
  
        post.user.push(user[0]);
        post.money.push(money);

        await post.save();
    }
    res.redirect(`/posts/${post._id}`);
})

module.exports = router;