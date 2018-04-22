const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express(); //get instance of express

let routeDir = `${__dirname}/src/routes`;
let availableAPIVersions = fs.readdirSync(routeDir);

//if someone calls the base url of our api, simple return a json object
//with listed api versions to use.
app.all('/', (req, res) => {
    res.json({apiVersions: availableAPIVersions});
});

//build a list of routes based on available api versions
availableAPIVersions.forEach((version) => {
    let filesInFolder = fs.readdirSync(`${routeDir}/${version}`);
    let availableRoutesForThisVersion = [];

    filesInFolder.forEach((file) => {
        let fileNoExtension = file.replace('.js', '');
        availableRoutesForThisVersion.push(fileNoExtension);
        let fileToUse = `${routeDir}/${version}/${fileNoExtension}`;
        app.use(`/${version}/${fileNoExtension}`, require(fileToUse));
    });

    //if no route is specified after the version, return json with available routes for that version
    app.all(`/${version}`, (req, res) => {
        res.json({routesAvaliable: availableRoutesForThisVersion});
    })
});

app.use((req, res, next) => {
    console.error('An error occured');
    //Send a 404 response and a simple message (in json format) explaining that
    //the desired url doesnt exist.
    res.status(404).json({error: `${req.url} does not exist`});
});

let server = app.listen(3000);
console.log('Express started on port 3000');
