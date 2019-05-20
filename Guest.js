const Joi = require('joi');
const express = require('express');
const router = express.Router();
const DButilsAzure = require('./DButils');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const superSecret = "SUMsumOpen"; // secret variable



//TODO: Complete this post method, create a generic function for inserting a record to the DB.
//Registration
router.post('/register', async function register (req, res) {
    const {error} = validateRegistration(req.body);
    if (error){
        res.status(400).send(error.details[0].message);
        return;
    }
    try{
        let maxID = await DButilsAzure.execQuery('SELECT MAX(userId) FROM Users');
        let currID = maxID[0][''] + 1;
        insertIntoTable('Users',[currID.toString(), '\'' + req.body.username + '\'', '\'' + req.body.password + '\'',
            '\'' + req.body.firstname + '\'', '\'' + req.body.lastname + '\'', '\'' + req.body.city + '\'',
            '\'' + req.body.country + '\'', '\'' + req.body.email + '\'',
            '\'' + req.body.categories[0] + '\'', '\'' + req.body.categories[1] + '\'', '\'' + req.body.answers[0] + '\'',
            '\'' + req.body.answers[1] + '\'']);
        res.status(200).send({success: true, message: "Registration completed successfully"});
    }
    catch(err){
        res.status(404).send({success: false, message: 'Something went wrong'});
    }

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
            res.status(404).send({success: false, message: 'Authentication failed - no such user'});
    }
    catch(err){
        res.status(404).send({success: false, message: 'Authentication failed - something went wrong'});
    }
});

router.post('/passRetrieval', async function retrieval (req, res) {
    const {error} = validateRetrieval(req.body);
    if(error) {
        res.status(400).send(error.details[0].message);
        return;
    }
    try{
        const password = await DButilsAzure.execQuery('SELECT userPassword FROM Users WHERE userName = ' + '\'' + req.body.username + '\'' +
            ' AND firstAnswer = ' + '\'' + req.body.answers[0] + '\'' + ' AND secondAnswer = ' + '\'' + req.body.answers[1] + '\'');
        if(Object.keys(password).length > 0)
            res.status(200).send(password);
        else
            res.status(404).send({success: false, message: 'Authentication failed'});
    }
    catch(err){
        res.status(404).send({success: false, message: 'Authentication failed - something went wrong'});
    }
});

router.get('/ThreeRandomPOI', async function randomPOIs (req, res) {
    try{
        const dataArray = await DButilsAzure.execQuery('SELECT TOP 3 poiId, poiName, poiPicture FROM PointsOfInterests' +
            ' ORDER BY NEWID()');
        if(Object.keys(dataArray).length > 0)
            res.status(200).send(dataArray);
        else
            res.status(404).send({success: false, message: 'failed to restore data'});
    }
    catch(err){
        res.status(404).send({success: false, message: 'failed to restore data - something went wrong'});
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

function insertIntoTable(tableName, values){
    let query = 'INSERT INTO ' + tableName + ' VALUES (';
    for(let i = 0; i < values.length - 1; i++)
    {
        query += values[i] + ',';
    }

    query += values[values.length - 1] + ')';

    DButilsAzure.execQuery(query).then(
        function() {
            console.log("success") }).catch(function (error) {
        console.log(error);
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
        username : Joi.string().regex(/^[a-zA-Z]+$/).min(3).max(8).required(),
        password: Joi.string().alphanum().min(5).max(10).required(),
        firstname : Joi.string().regex(/^[a-zA-Z]+$/).min(2).max(30).required(),
        lastname : Joi.string().regex(/^[a-zA-Z]+$/).min(2).max(30).required(),
        city : Joi.string().min(2).max(30).required(),
        country : Joi.string().min(2).max(30).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }),
        categories: Joi.required(),
        answers: Joi.required()
    };
    return Joi.validate(body, schema);
}

function validateRetrieval(body){
    const schema = {
        username: Joi.string().required(),
        answers: Joi.required()
    };
    return Joi.validate(body, schema);
}

module.exports = router;