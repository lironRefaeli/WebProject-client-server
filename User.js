const Joi = require('joi');
const express = require('express');
const router = express.Router();
const DButilsAzure = require('./DButils');



router.get('/GetTwoSavedPOI/:userId', async function GetTwoSavedPOI(req, res) {
    try {
        const twoPois = await DButilsAzure.execQuery('SELECT TOP(2) PointsOfInterests.poiId, poiName, poiPicture FROM UsersFavoritePOI INNER JOIN PointsOfInterests ON UsersFavoritePOI.poiId = PointsOfInterests.poiId WHERE UsersFavoritePOI.userId=' +req.params["userId"]+' ORDER BY updatedTime DESC');

       if (Object.keys(twoPois).length != 0)
           res.status(200).send(twoPois);
        else
            res.status(404).send({message: 'You did not save any points of views'});
    }
    catch(err){
        res.status(404).send({message: 'something went wrong in the DB'});
    }


});

router.get('/GetRecommendedPOI/:userId', async function GetRecommendedPOI(req, res) {
    try {

        const chosenCategories = await DButilsAzure.execQuery('SELECT firstCategoryName ,secondCategoryName FROM Users WHERE userId ='+req.params["userId"]);

        const firstRecommendedPOI = await DButilsAzure.execQuery('SELECT [poiId] ,[poiName] ,[poiPicture] FROM [dbo].[PointsOfInterests] WHERE rank=(SELECT MAX(rank) FROM [dbo].[PointsOfInterests] WHERE [dbo].[PointsOfInterests].categoryName= '+ '\'' + chosenCategories[0]['firstCategoryName'] + '\')' );
        const secondRecommendedPOI = await DButilsAzure.execQuery('SELECT [poiId] ,[poiName] ,[poiPicture] FROM [dbo].[PointsOfInterests] WHERE rank=(SELECT MAX(rank) FROM [dbo].[PointsOfInterests] WHERE [dbo].[PointsOfInterests].categoryName=' + '\'' + chosenCategories[0]['secondCategoryName'] + '\')' );
        let RecommendedPOI = [];
        RecommendedPOI[0] = firstRecommendedPOI[0];
        RecommendedPOI[1] = secondRecommendedPOI[0];

        if (Object.keys(RecommendedPOI).length > 0 ) {
            res.status(200).send(RecommendedPOI);
        }
        else
            res.status(404).send({message: 'something went wrong in the DB'});
    }
    catch(err){
        res.status(404).send({message: 'Authentication failed - something went wrong'});
    }

});


router.delete('/DeleteSavedPOI', async function DeleteSavedPOI (req, res)  {
    const {error} = validateDeleteSavedPOI(req.body);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }
    try {
        await DButilsAzure.execQuery('DELETE FROM [dbo].[UsersFavoritePOI] WHERE userId=' + '\'' + req.body.userId + '\'' + ' AND poiId=' + '\'' + req.body.poiId + '\'');
        res.status(404).send({success: true, message: 'success'});
    }
    catch(err){
        res.status(404).send({success: false, message: 'something went wrong'});
    }
});

function validateDeleteSavedPOI(body){
    const schema = {
        userId: Joi.string().required(),
        poiId: Joi.string().required()
    };
    return Joi.validate(body, schema);
}



//TODO: finish this function
router.post('/SavePOI', async function SavePOI (req, res)  {
    const {error} = validateSavePoi(req.body);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }
    try {
        await DButilsAzure.execQuery('INSERT INTO [dbo].[UsersFavoritePOI] ([userId] ,[poiId] ,[poiOrder]) VALUES ('+ req.body.userId + ',' + req.body.poiId + ',' + req.body.poiOrder+ ')');
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
        poiOrder: Joi.number().required()
    };
    return Joi.validate(body, schema);
}

/*
//TODO: finish this function
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
        let timestamp = + new Date();

        await DButilsAzure.execQuery('INSERT INTO Critics (criticId, userId, poiId, criticDate, criticText, rank) VALUES (' + currID.toString() + ', "' + req.body.userID + '", "' +
            req.body.poiID + '", ' + timestamp.toString() + ', "' + req.body.critic_text + '", "' + req.body.rank + '")');
        res.status(200).send({success: true, message : 'Critic saved successfully'});
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



*/



module.exports = router;