const crypto = require('crypto');   // To create unique secure random value
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}));

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
        errorMessage: message
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');  // HttpOnly  / Secure  / Max-Age=10 (To set a cookie)
            if (!user) {
                req.flash('error', 'Invalid email or password.');
                return res.redirect('/login');
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
                    req.flash('error', 'Invalid email or password.');
                    res.redirect('/login');
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
        errorMessage: message
    });
};
exports.postSignup = (req, res, next) => {
    const signupEmail = req.body.signupEmail;
    const signupPassword = req.body.signupPassword;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Sign Up',
            path: '/signup',
            errorMessage: errors.array()[0].msg
        });
    }

    if (!signupEmail || !signupPassword || !confirmPassword) {
        req.flash('error', 'Please fill all the fields provided.');
        return res.redirect('/signup');
    } else {
        User.findOne({ email: signupEmail })
            .then(userDoc => {
                if (userDoc) {
                    req.flash('error', 'E-Mail exists already, please pick a different one.');
                    return res.redirect('/signup');
                }
                return bcrypt
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
                            return transporter.sendMail({
                                to: signupEmail,
                                from: 'subhankarpradhan88@gmail.com',
                                subject: 'Signup succeeded!',
                                html: '<h1>You have successfully signed up!</h1>'
                            })
                        }
                    })
                    .catch(err => console.log(err));
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
        if(err) {
            console.log('err', err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');       // Hexadecimal value to ASCII value
        User.findOne({ email: req.body.email })
        .then(user => {
            if(!user) {
                req.flash('error', 'No account with that email found.');
                return res.redirect('/reset');
            }
            user.resetToken = token;    
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result => {
            res.redirect('/');
            transporter.sendMail({
                to: req.body.email,
                from: 'subhankarpradhan88@gmail.com',
                subject: 'Password reset',
                html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                `
            })
        })
        .catch(err => console.log(err));
    });
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
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
        resetTokenExpiration: {$gt: Date.now()}, 
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