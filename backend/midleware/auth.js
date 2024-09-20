// middleware/auth.js
function isAuthenticated(req, res, next) {
    const userId = req.cookies.userId;

    if (!userId) {
        return res.redirect('/login');
    }

    next();
}

module.exports = isAuthenticated;
