const Joi = require('joi');
const express = require('express');
const router = express.Router();
const DButilsAzure = require('./DButils');



router.get('/GetTwoSavedPOI/:userId', async function GetTwoSavedPOI(req, res) {
    try {
        const twoPois = await DButilsAzure.execQuery('SELECT TOP(2) PointsOfInterests.poiId, poiName, poiPicture FROM UsersFavoritePOI INNER JOIN PointsOfInterests ON UsersFavoritePOI.poiId = PointsOfInterests.poiId WHERE UsersFavoritePOI.userId=' +req.params["userId"]+' ORDER BY updatedTime DESC');

       if (Object.keys(twoPois).length > 0)
           res.status(200).send(twoPois);
        else
            res.status(404).send({message: 'Authentication failed - no such user'});
    }
    catch(err){
        res.status(404).send({message: 'Authentication failed - something went wrong'});
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
            res.status(404).send({message: 'Authentication failed - no such user'});
    }
    catch(err){
        res.status(404).send({message: 'Authentication failed - something went wrong'});
    }

});


function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}


module.exports = router;