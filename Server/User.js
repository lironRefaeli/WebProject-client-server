const Joi = require('joi');
const express = require('express');
const router = express.Router();
const DButilsAzure = require('./DButils');



router.get('/getTwoLastSavedPOI/:userID', async function GetTwoSavedPOI(req, res) {
    const {error} = validateUserID(req.params);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }
    try {
        const twoPoisArray = await DButilsAzure.execQuery('SELECT TOP 2 PointsOfInterests.poiId, poiName, poiPicture ' +
            'FROM UsersFavoritePOI INNER JOIN PointsOfInterests ' +
            'ON UsersFavoritePOI.poiId = PointsOfInterests.poiId ' +
            'WHERE UsersFavoritePOI.userId = ' +  '\'' + req.params.userID + '\'' + ' ORDER BY updatedTime DESC');
        if (Object.keys(twoPoisArray).length >= 0)
             res.status(200).send(twoPoisArray);
        else
            res.status(400).send({message: 'Need at least 2 saved POIs in order to get them'});
    }
    catch(err){
        res.status(404).send({message: 'something went wrong'});
    }
});

router.get('/getTwoRecommendedPOI/:userID', async function GetRecommendedPOI(req, res) {
    const {error} = validateUserID(req.params);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }
    try {
        const chosenCategories = await DButilsAzure.execQuery('SELECT firstCategoryName ,secondCategoryName FROM Users WHERE userId = ' + req.params["userID"]);
        const firstRecommendedPOI = await DButilsAzure.execQuery('SELECT poiId, poiName, poiPicture FROM PointsOfInterests WHERE rank =(SELECT MAX(rank) FROM PointsOfInterests WHERE PointsOfInterests.categoryName= '+ '\'' + chosenCategories[0]['firstCategoryName'] + '\')' + 'AND categoryName = ' + '\'' + chosenCategories[0]['firstCategoryName'] + '\'');
        const secondRecommendedPOI = await DButilsAzure.execQuery('SELECT [poiId] ,[poiName] ,[poiPicture] FROM [dbo].[PointsOfInterests] WHERE rank=(SELECT MAX(rank) FROM [dbo].[PointsOfInterests] WHERE [dbo].[PointsOfInterests].categoryName=' + '\'' + chosenCategories[0]['secondCategoryName'] + '\')' + 'AND categoryName = ' + '\'' + chosenCategories[0]['secondCategoryName'] + '\'');
        let RecommendedPOI = [];
        RecommendedPOI[0] = firstRecommendedPOI[0];
        RecommendedPOI[1] = secondRecommendedPOI[0];

        if (Object.keys(RecommendedPOI).length === 2) {
            res.status(200).send(RecommendedPOI);
        }
        else
            res.status(404).send({message: 'could not find to POIs under the user favorite categories'});
    }
    catch(err){
        res.status(404).send({message: 'something went wrong'});
    }

});

router.post('/SavePOI', async function SavePOI (req, res)  {
    const {error} = validateSavePoi(req.body);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }
    try {
        let lastOrder = await DButilsAzure.execQuery('SELECT MAX(poiOrder) FROM UsersFavoritePOI WHERE userId = ' + req.body.userId);
        let currOrder;
        console.log(lastOrder[0]['']);
        if(lastOrder[0][''] === null)
            currOrder = 1;
        else
            currOrder = lastOrder[0][''] + 1;
        await DButilsAzure.execQuery('INSERT INTO [dbo].[UsersFavoritePOI] ([userId] ,[poiId] ,[poiOrder]) VALUES ('+ req.body.userId + ',' + req.body.poiId + ',' + currOrder + ')');
        res.status(200).send({success: true, message: 'success - POI was saved'});
    }
    catch(err){
        res.status(404).send({success: false, message: 'something went wrong in the DB'});
    }
});

function validateSavePoi(body){
    const schema = {
        userId: Joi.number().required(),
        poiId: Joi.number().required(),
    };
    return Joi.validate(body, schema);
}


router.post('/DeleteSavedPOI', async function DeleteSavedPOI (req, res)  {
    const {error} = validateDeleteSavedPOI(req.body);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }
    try {
        await DButilsAzure.execQuery('DELETE FROM [dbo].[UsersFavoritePOI] WHERE userId = ' + '\'' + req.body.userId + '\'' + ' AND poiId =' + '\'' + req.body.poiId + '\'');
        res.status(200).send({success: true, message: 'success'});
    }
    catch(err){
        res.status(404).send({success: false, message: 'something went wrong'});
    }
});

function validateDeleteSavedPOI(body){
    const schema = {
        userId: Joi.number().required(),
        poiId: Joi.number().required()
    };
    return Joi.validate(body, schema);
}



//getting all favorite POIs of a specific user by the order that the user wanted to see them
router.get('/getUserSavedPOIs/:userID', async function GetUsersSavedPois(req, res){
    const {error} = validateUserID(req.params);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }
    try{
        const userPOIs = await DButilsAzure.execQuery('SELECT PointsOfInterests.poiId, poiName, poiPicture, categoryName, rank FROM UsersFavoritePOI INNER JOIN PointsOfInterests ' +
            'ON UsersFavoritePOI.poiId = PointsOfInterests.poiId ' +
            'WHERE UsersFavoritePOI.userId = '  + req.params["userID"] +
            ' ORDER BY poiOrder ASC');
        res.status(200).send(userPOIs);
    }
    catch(err){
        res.status(404).send({success: false, message: 'getting POIs failed - something went wrong'});
    }
});


//Change the order of the POIs of a specific user, the order is saved in the UsersFavoritePOI table
router.put('/changeOrderOfSavedPOIs', async function changePOIorder(req, res){
    const {error} = validatePOIorder(req.body);
    if (error){
        res.status(400).send(error.details[0].message);
        return;
    }
    try{
        await DButilsAzure.execQuery('DELETE FROM UsersFavoritePOI WHERE userId = ' + '\'' + req.body.userID + '\'');
        for(let i = 0; i < req.body.order.length; i++)
        {
            await DButilsAzure.execQuery('INSERT INTO UsersFavoritePOI (userId, poiId, poiOrder)' +
                'VALUES (' + '\'' + req.body.userID + '\', \'' +
            req.body.order[i]['poiID'] + '\', \'' + req.body.order[i]['order'] + '\'' + ')');
        }
        res.status(200).send({success: true, message : 'order changed successfully'});
    }
    catch(err){
        res.status(404).send({success: false, message: 'saving order failed - something went wrong'});
    }
});


function validatePOIorder(body){
    const schema = {
        userID: Joi.number().required(),
        order: Joi.required()
    };
    return Joi.validate(body, schema);
}


//Save a critic of a user in the Critics table
router.post('/saveCritic', async function saveCritic(req,res){
    const {error} = validateCritic(req.body);
    if (error){
        res.status(400).send(error.details[0].message);
        return;
    }
    try{
        let maxID = await DButilsAzure.execQuery('SELECT MAX(criticId) FROM Critics');
        let currID;
        if(maxID[0][''] === null)
            currID = 1;
        else
            currID = maxID[0][''] + 1;

        await DButilsAzure.execQuery('INSERT INTO Critics (criticId, userId, poiId, criticText, rank) VALUES (' + currID.toString() + ', \'' + req.body.userID + '\', \'' +
            req.body.poiID + '\', \'' + req.body.critic_text + '\', \'' + req.body.rank + '\')');

        //updating the POI rank
        await DButilsAzure.execQuery('UPDATE PointsOfInterests SET rank = ' +
            '(SELECT AVG(Critics.rank) FROM Critics WHERE poiId = ' + '\'' + req.body.poiID + '\'' + ')' +
            'WHERE poiId = ' + '\'' + req.body.poiID + '\'');
        res.status(200).send({success: true, message : 'critic saved successfully'});
    }
    catch(err){
        res.status(404).send({success: false, message: 'saving critic failed - something went wrong'});
    }

});



function validateCritic(body) {
    const schema = {
        userID: Joi.number().required(),
        poiID: Joi.number().required(),
        critic_text: Joi.string().required(),
        rank: Joi.number().min(1).max(5).required(),
    };
    return Joi.validate(body, schema);
}



function validateUserID(params){
    const schema = {
        userID: Joi.number().required()
    };
    return Joi.validate(params, schema);
}


module.exports = router;