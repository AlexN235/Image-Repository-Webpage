const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();
const PORT = 8080;

app.use(fileUpload({
        limits: {
            fileSize: 10000000,
        },
        abortOnLimit: true,
    })
);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/upload', (req,res) => {
    const { image } = req.files;
    
    if(!image) return res.sendStatus(400);
    
    // Check if image type.
    if(!/^image/.test(image.mimetype)) return res.sendStatus(400);
    
    image.mv(__dirname + '/upload/' + image.name);
        
    res.sendStatus(200);
});

app.listen(PORT, () => {
   console.log('Example app listening on port ${PORT}'); 
});

/*
fs.readFile('main.html', function (err, html) {
    if (err) throw err;
    
    http.createServer(function(req, res) {
        res.writeHeader(200, {"Content-Type": "text/html"});
        res.write(html);
        res.end();
    }).listen(PORT);
});
*/

// http://localhost:8080 to run.