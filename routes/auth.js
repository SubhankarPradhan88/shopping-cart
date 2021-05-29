const express = require('express');
const { check, body } = require('express-validator');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/signup', authController.getSignup);
router.post('/signup', 
[
    check('signupEmail')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value, {req}) => {
        if(value === 'test@test.com' ) {
            throw new Error('This email address is forbidden.')
        }
        return true;
    }),
    body('password', 'Please enter a password with only numbers and text and atleast 5 characters.')
    .isLength({ min: 5 })
    .isAlphanumeric()       // Handle no special character(s)
],
authController.postSignup);
router.post('/logout', authController.postLogout);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.post('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;