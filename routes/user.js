const express = require('express');
const userController = require('../controllers/user');
const { body } = require('express-validator');
const isAuth = require('../middleware/auth');

const router = express.Router();

router.post('/sing-up', 
    [
        body('email')
        .isEmail()
        .isLength({min : 10}),
        body('password')
            .isAlphanumeric()
            .isLength({ min : 8 }),
        body('repeatedPassword')
            .isAlphanumeric()
            .isLength({ min : 8 }),
        body('nick')
            .isAlphanumeric()
            .isLength({ min : 5 })
    ],
    userController.singUp);

router.post('/login', 
    [
        body('nick')
            .isAlphanumeric()
            .isLength({ min : 5}),
        body('password')
            .isAlphanumeric()
            .isLength({ min : 8 })
    ],
    userController.login);

router.put('/users-level', isAuth, 
    [
        body('result')
            .isInt({min : 0})
    ],
    userController.levelUp);

module.exports = router;

