const express = require('express');
const app = express();
const Guest = require('./Guest');
const bodyParser = require('body-parser');

//for parsing the json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/',Guest);

// route middleware to verify a token
app.use('/loggedIn', (req, res, next) => {

    // check header or url parameters or post parameters for token
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    //decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, superSecret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                // get the decoded payload and header
                let decoded = jwt.decode(token, {complete: true});
                req.decoded= decoded;
                console.log(decoded.header);
                console.log(decoded.payload);
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));