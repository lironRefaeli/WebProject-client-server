const Joi = require('joi');
const express = require('express');
const router = express.Router();
const DButilsAzure = require('./DButils');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const superSecret = "SUMsumOpen"; // secret variable


//Registration
router.post('/register', async function register (req, res) {
    const {error} = validateRegistration(req.body);
    if (error){
        res.status(400).send(error.details[0].message);
        return;
    }
    try{
        const countryExists = await DButilsAzure.execQuery('SELECT * FROM Countries WHERE name = ' + '\'' + req.body.country + '\'');
        if(Object.keys(countryExists).length === 0){
            res.status(404).send({success: false, message: 'Chosen Country is not valid'});
            return;
        }
        let maxID = await DButilsAzure.execQuery('SELECT MAX(userId) FROM Users');
        let currID;
        if(maxID[0][''] === null)
            currID = 1;
        else
            currID = maxID[0][''] + 1;
        insertIntoTable('Users',[currID.toString(), '\'' + req.body.username + '\'', '\'' + req.body.password + '\'',
            '\'' + req.body.firstname + '\'', '\'' + req.body.lastname + '\'', '\'' + req.body.city + '\'',
            '\'' + req.body.country + '\'', '\'' + req.body.email + '\'',
            '\'' + req.body.categories[0] + '\'', '\'' + req.body.categories[1] + '\'', '\'' + req.body.questions[0] + '\'',
            '\'' + req.body.questions[1] + '\'', '\'' + req.body.answers[0] + '\'',
            '\'' + req.body.answers[1] + '\'']);
        res.status(200).send({success: true, message: "Registration completed successfully"});
    }
    catch(err){
        res.status(404).send({success: false, message: 'Something went wrong'});
    }

});

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
        questions: Joi.required(),
        answers: Joi.required()
    };
    return Joi.validate(body, schema);
}

router.get('/getCategories', async function getCategories (req, res) {
    try{
        let categories = await DButilsAzure.execQuery('SELECT categoryName FROM Categories');
        if (Object.keys(categories).length > 0)
            res.status(200).send(categories);
        else
            res.status(404).send({success: false, message: 'Could not find any categories'});
    }
    catch(err){
        res.status(404).send({success: false, message: 'DB error - something went wrong'});
    }
});

router.get('/getCountries', async function getCountries (req, res) {
    try{
        let countries = await DButilsAzure.execQuery('SELECT name FROM Countries');
        if (Object.keys(countries).length > 0)
            res.status(200).send(countries);
        else
            res.status(404).send({success: false, message: 'Could not find any Countries'});
    }
    catch(err){
        res.status(404).send({success: false, message: 'DB error - something went wrong'});
    }
});

router.get('/getQuestions', async function getQuestions (req, res) {
    try{
        let questions = await DButilsAzure.execQuery('SELECT question FROM Questions');
        if (Object.keys(questions).length > 0)
            res.status(200).send(questions);
        else
            res.status(404).send({success: false, message: 'Could not find any questions'});
        }
        catch(err){
            res.status(404).send({success: false, message: 'DB error - something went wrong'});
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

function validateLogin(body){
    const schema = {
        username: Joi.string().required(),
        password: Joi.string().required()
    };
    return Joi.validate(body, schema);
}

//Sends the token and the userID to client side.
async function sendToken(user, res) {
    let userID;
    try{
        userID = await DButilsAzure.execQuery('SELECT userId FROM Users WHERE userName = ' + '\'' + user[0]['userName'] + '\'');
        if(Object.keys(userID).length === 0)
        {
            res.status(404).send({success: false, message: 'failed to log in'});
            return;
        }
    }
    catch(err){
        res.status(404).send({success: false, message: 'failed to log in - something went wrong'});
    }

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
        token: token,
        userID: userID[0]['userId']
    });
}

//Retrieving the password for a user - gets userID and 2 answers for the 2 questions that we hold
router.post('/passRetrieval', async function retrieval (req, res) {
    const {error} = validateRetrieval(req.body);
    if(error) {
        res.status(400).send(error.details[0].message);
        return;
    }
    try{
        const password = await DButilsAzure.execQuery('SELECT userPassword FROM Users WHERE userName = ' + '\'' + req.body.username + '\'' +
        ' AND answer1 = ' + '\'' + req.body.answers[0] + '\'' + ' AND answer2 = ' + '\'' + req.body.answers[1] + '\'');
        if(Object.keys(password).length > 0)
            res.status(200).send(password);
        else
            res.status(404).send({success: false, message: 'Authentication failed'});
    }
    catch(err){
        res.status(404).send({success: false, message: 'Authentication failed - something went wrong'});
    }
});

function validateRetrieval(body){
    const schema = {
        username: Joi.string().required(),
        answers: Joi.required()
    };
    return Joi.validate(body, schema);
}

//for retrieving password, the client should get the questions this specific user chose when he registered
router.get('/getUserQuestions/:userName', async function retrieval (req, res) {
    const {error} = validateUserName(req.params);
    if(error) {
        res.status(400).send(error.details[0].message);
        return;
    }
    try{
        console.log(req.params);
        const questions = await DButilsAzure.execQuery('SELECT question1, question2, answer1, answer2 FROM Users WHERE userName = ' + '\'' + req.params['userName'] + '\'');
        if(Object.keys(questions).length > 0)
            res.status(200).send(questions);
        else
            res.status(404).send({success: false, message: 'This username does not exists'});
    }
    catch(err){
        res.status(404).send({success: false, message: 'DB error'});
    }
});


function validateUserName(body){
    const schema = {
        userName: Joi.string().required()
    };
    return Joi.validate(body, schema);
}


//Returns 3 random POIs with a rank of 3 or above
router.get('/threeRandomPOI', async function randomPOIs (req, res) {
    try{
        const dataArray = await DButilsAzure.execQuery('SELECT TOP 3 poiId, poiName, poiPicture FROM PointsOfInterests' +
            ' WHERE rank >= 3' +
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


router.get('/getPOIs', async function GetPOIs(req, res) {
    try {
        const pois = await DButilsAzure.execQuery('SELECT [poiId],[poiName],[categoryName],[poiPicture],[rank],[poiDescription] FROM [dbo].[PointsOfInterests]');

        if (Object.keys(pois).length > 0 ) {
            res.status(200).send(pois);
        }
        else
            res.status(404).send({message: 'There are no POIS in the DB'});
    }
    catch(err){
        res.status(404).send({message: 'The connection to the DB failed'});
    }

});


/*
router.get('/getPOIByPOIName/:POI_name', async function GetPOIs(req, res) {
    const {error} = validatePOIName(req.params);
    if(error) {
        res.status(400).send(error.details[0].message);
        return;
    }
    let poiNameWithoutSpace = req.params["POI_name"].split('_').join(' ');
    try {
        const poi = await DButilsAzure.execQuery('SELECT [poiId],[poiName],[poiPicture] FROM [dbo].[PointsOfInterests]  WHERE [dbo].[PointsOfInterests].poiName=' + '\'' +poiNameWithoutSpace+'\'' );

        if (Object.keys(poi).length > 0 ) {
            res.status(200).send(poi);
        }
        else
            res.status(404).send({message: 'There is no poi with the chosen name in the DB'});
    }
    catch(err){
        res.status(404).send({message: 'The connection to the DB failed'});
    }

});
*/

router.get('/GetPOIInformation/:POI_id', async function GetPOIs(req, res) {
    try {
        const poiInfo = await DButilsAzure.execQuery('SELECT [poiName],[poiPicture],[numOfViews],[rank],[poiDescription] FROM [dbo].[PointsOfInterests] where [poiId] =' +req.params["POI_id"]);
        const twoLastCritics = await DButilsAzure.execQuery('SELECT TOP (2) [criticId] ,[userId] ,[criticDate] ,[criticText] ,[rank] FROM [dbo].[Critics] WHERE [poiId]  = ' + req.params["POI_id"]  + ' ORDER BY criticDate DESC');

        let poiInfoAndCritics = [];
        poiInfoAndCritics[0] = poiInfo;
        poiInfoAndCritics[1] = twoLastCritics;


        if (Object.keys(poiInfoAndCritics[0]).length > 0 ) {
            await DButilsAzure.execQuery('UPDATE PointsOfInterests SET numOfViews = numOfViews + 1 WHERE poiId = '
                + req.params["POI_id"]);
            res.status(200).send(poiInfoAndCritics);
        }
        else
            res.status(404).send({message: 'There is no POI with the chosen id in the DB'});
    }
    catch(err){
        res.status(404).send({message: 'The connection to the DB failed'});
    }

});

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

function validatePOIName(params){
    const schema = {
        POI_name: Joi.string().required()
    };
    return Joi.validate(params, schema);
}

module.exports = router;