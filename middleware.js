module.exports.isLoggedin = (req, res, next) => {
    console.log(req.isAuthenticated());
    console.log(req.session);
    if (!req.isAuthenticated() && !req.session.name) {
        req.flash('error', 'you must be signed in');
        return res.redirect('/login'); r
    }
    next();
}
