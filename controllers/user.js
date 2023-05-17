const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const levelSystem = require('../middleware/levelSystem');

exports.singUp = async(req, res, next) => {

    const errors = validationResult(req);
    const email = req.body.email;
    const nick = req.body.nick;
    const password = req.body.password;
    const repeatedPassword = req.body.repeatedPassword;

    if(!errors.isEmpty()){
        const error = new Error('Wrong data!');
        error.statusCode = 400;
        return next(error);
    }

    if(password !== repeatedPassword){
        const error = new Error('Repeated password is diffrent than password!');
        error.statusCode = 400;
        return next(error);
    }

    try{
        const isEmail = await User.findOne({email : email});
        if(isEmail){
            const error = new Error('This email already exists!');
            error.statusCode = 400;
            throw(error);
        } 
    } catch(error){
        return next(error)
    }

    try{
        const isNick = await User.findOne({nick : nick});
        if(isNick){
            const error = new Error('This nick already exists!');
            error.statusCode = 400;
            throw(error);
        } 
    } catch(error){
        return next(error)
    }

    try{
        const hashedPassword = await bcrypt
            .hash(password, 12);
        
            const newUser = new User({
            email : email,
            nick : nick,
            password : hashedPassword,
            level : 1,
            requiredPoints : 100,
            usersPoints : 0    
        });

        await newUser.save();

    } catch(error){
        if(!error.statusCode) error.statusCode = 500;
        return next(error);
    }
    return res.status(200).json('New user created succesful!');
}

exports.login = async(req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new Error('Wrong nick or password!');
        error.statusCode = 400;
        return next(error);
    }

    const nick = req.body.nick;
    const password = req.body.password;

    try{
        const user = await User.findOne({ nick : nick})
        if(!user || await bcrypt.compare(password, user.password) !== true){
            const error = new Error('Wrong nick or password');
            error.statusCode = 400;
            throw(error);
        }
        token = jwt.sign({
            nick : user.nick.toString(),
        }, 
        'flashcardsproject', 
        )
    } catch(error){
        if(!error.statusCode) error.statusCode = 500;
        return next(error);
    }

    return res.status(200).json({token : token});

}

exports.levelUp = async(req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new Error('Wrong data!');
        error.statusCode = 400;
        return next(error);
    }

    const result = req.body.result;

    try{
        const user = await User.findOne({ nick : req.user });
        if(!user){
            const error = new Error('User doesnt exist!');
            error.statusCode = 400;
            throw (error);
        }
        const summary = levelSystem(result, user.usersPoints, user.requiredPoints, user.level)
        user.usersPoints = summary.points;
        user.requiredPoints = summary.requiredPoints;
        user.level = summary.level;
        await user.save();
    } catch(error){
        if(!error.statusCode) error.statusCode = 500;
        return next(error);
    }
    return res.status(200).json(result);

}