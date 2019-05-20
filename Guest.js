const Joi = require('joi');
const express = require('express');
const router = express.Router();
const DButilsAzure = require('./DButils');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const superSecret = "SUMsumOpen"; // secret variable



//TODO: Complete this post method, create a generic function for inserting a record to the DB.
//Registration
router.post('/register', async  function register (req, res) {
    const {error} = validateRegistration(req.body);
    if (error) return res.status(400).send(error.details[0].message);
});


//Log in attempting
router.post('/login', async function login (req, res)  {
    const {error} = validateLogin(req.body);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }
        try {
            const user = await DButilsAzure.execQuery('select * from Users where userName = ' + '\'' + req.body.username + '\'' + ' and userPassword = ' + '\'' + req.body.password + '\'');
            if (Object.keys(user).length > 0)
                sendToken(user, res);
            else
                res.status(404).send({message: 'Authentication failed - no such user'});
        }
        catch(err){
            res.status(404).send({message: 'Authentication failed - something went wrong'});
        }
});


function sendToken(user, res) {
    let payload = {
        userName: user.userName,
        admin: user.isAdmin
    };

    let token = jwt.sign(payload, superSecret, {
        expiresIn: "1d" // expires in 24 hours
    });
    // return the information including token as JSON
    res.json({
        success: true,
        message: 'Enjoy your token!',
        token: token
    });
}

function validateLogin(body){
    const schema = {
        username: Joi.string().required(),
        password: Joi.string().required()
    };
    return Joi.validate(body, schema);
}

function validateRegistration(body){
    const schema = {
        username : Joi.string().alpha().min(3).max(8).required(),
        password: Joi.string().alphanum().min(5).max(10).required(),
        firstname : Joi.string().alpha().min(2).max(30).required(),
        lastname : Joi.string().alpha().min(2).max(30).required(),
        city : Joi.string().alpha().min(2).max(30).required(),
        country : Joi.string().alpha().min(2).max(30).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }),
        categories: Joi.required(),
        questionsAndAnswers: Joi.required()
    };
    return Joi.validate(body, schema);
}

module.exports = router;