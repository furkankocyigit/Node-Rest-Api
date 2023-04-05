const express = require('express');

const {body} = require('express-validator/check');
const authController = require('../controllers/auth');
const User = require('../models/user');
const isAuth = require('../middleware/is-auth')

const router = express.Router();

router.put('/signup',[
    body('email')
        .isEmail().withMessage('Please enter a valid Email!!')
        .custom((value,{req}) =>{
            return User.findOne({email:value})
                .then(userDoc => {
                    if(userDoc){
                        return Promise.reject('E-mail is already exist, please pick different one')
                    }
                })
        })
        .normalizeEmail(),

    body('password')
        .trim()
        .isLength({min:5}),
    
        body('name')
        .trim()
        .not()
        .isEmpty()
    ],
    authController.signup)

router.post('/login',authController.login)

router.get('/status',isAuth,authController.getUserStatus)

router.put('/status',isAuth,[
    body('status')
        .trim()
        .not()
        .isEmpty()
],authController.updateUserStatus)

module.exports = router;