var express = require('express');
var app = express();
var router = express.Router();
var DButilsAzure = require('./DButils');
var bodyParser = require('body-parser');

var port = 3000;
app.listen(port, function () {
    console.log('app listening on port ' + port);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/hello', async function Login (req, res)  {
    if (!req.body.username || !req.body.password)
        res.send({message: "bad values"});
    else
    {
        try {
            const user = await DButilsAzure.execQuery('select * from Users where userName = ' + '\'' + req.body.username + '\'' + ' and userPassword = ' + '\'' + req.body.password + '\'');
            if (Object.keys(user).length > 0) {
                console.log(user);
                res.status(200).send({success: true, message: 'Authentication'});
            }
            else {
                res.send({success: false, message: 'Authentication failed.no such user'});
            }
        }catch(error){
            console.log(error.message);
            res.send({success: false, message: 'Authentication failed.'});
        }
    }
});


app.post('/hello1', function (req, res) {
    if (!req.body.username || !req.body.password)
        res.send({message: "bad values"});

    else {
        DButilsAzure.execQuery('select * from clients where UserName = ' + '\'' + req.body.username + '\'' + ' and Password = ' + '\'' + req.body.password + '\'').then(
            function (user) {
                if (Object.keys(user).length > 0)
                    res.send({success: true, message: 'Authentication'});
                else {
                    res.send({success: false, message: 'Authentication failed.no such user'});
                }
            }).catch(function (error) {
            // console.log(error);
            res.send({success: false, message: 'Authentication failed.'});
        });
    }
});

app.get('/', (req, res) => {
res.status(200).send('Hello World');
});
