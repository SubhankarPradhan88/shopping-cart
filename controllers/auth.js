const crypto = require('crypto');   // To create unique secure random value
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }

    User.findOne({ email: email })
        .then(user => {
            // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');  // HttpOnly  / Secure  / Max-Age=10 (To set a cookie)
            if (!user) {
                return res.status(422).render('auth/login', {
                    pageTitle: 'Login',
                    path: '/login',
                    errorMessage: 'Invalid email or password.',
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: []
                });
            }
            bcrypt.compare(password, user.password)
                .then(passwordDoMatch => {
                    if (passwordDoMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    return res.status(422).render('auth/login', {
                        pageTitle: 'Login',
                        path: '/login',
                        errorMessage: 'Invalid email or password.',
                        oldInput: {
                            email: email,
                            password: password
                        },
                        validationErrors: []
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch(err => console.log(err));
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }
    res.render('auth/signup', {
        pageTitle: 'Sign Up',
        path: '/signup',
        errorMessage: message,
        oldInput: { 
            signupEmail: '', 
            signupPassword: '', 
            confirmPassword: '' 
        },
        validationErrors: []
    });
};

exports.postSignup = (req, res, next) => {
    const signupEmail = req.body.signupEmail;
    const signupPassword = req.body.signupPassword;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('auth/signup', {
            pageTitle: 'Sign Up',
            path: '/signup',
            errorMessage: errors.array()[0].msg,
            oldInput: { 
                signupEmail: signupEmail, 
                signupPassword: signupPassword, 
                confirmPassword: confirmPassword 
            },
            validationErrors: errors.array()
        });
    }

    if (!signupEmail || !signupPassword || !confirmPassword) {
        req.flash('error', 'Please fill all the fields provided.');
        return res.redirect('/signup');
    } else {
        bcrypt
            .hash(signupPassword, 12)
            .then(hashPassword => {
                if (hashPassword) {
                    const user = new User({
                        email: signupEmail,
                        password: hashPassword,
                        cart: { items: [] }
                    });
                    return user.save();
                }
            })
            .then(savedUser => {
                if (savedUser) {
                    res.redirect('login');
                }
            })
            .catch(err => console.log(err));
    }
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    })
};

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: message
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log('err', err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');       // Hexadecimal value to ASCII value
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found.');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('/');
            })
            .catch(err => console.log(err));
    });
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0]
            } else {
                message = null;
            }
            res.render('auth/new-password', {
                pageTitle: 'New Password',
                path: '/new-password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err => console.log(err));
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    })
    .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(result => {
        res.redirect('/login');
    })
    .catch(err => console.log(err));
}