const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const fileUpload = require('express-fileupload');
const { 
    S3Client,
    PutObjectCommand,
    CreateBucketCommand,
    ListBucketsCommand,
    S3ServiceException,
    } = require("@aws-sdk/client-s3");

const app = express();
const PORT = 8080;
const client = new S3Client( {region: 'us-west-2'} );

/*
const input = { // ListBucketsRequest
  MaxBuckets: 10,

  Prefix: "STRING_VALUE",
  BucketRegion: "us-west-2",
};
const command = new ListBucketsCommand(input);
const response = client.send(command);

*/
let bucketName = "mys3bucket-project-imagereposite";

async function createS3Bucket(bucketName) {
    const input = {
        Bucket: bucketName,
        CreateBucketConfiguration: {
            LocationConstraint: "us-west-2"
        }
    };
    try {
        const command = new CreateBucketCommand(input);
        const response = client.send(command);
        console.log('Bucket ${bucketName} created sucessfully: ', response);
        return response;
    }
    catch (error) {
        console.error(error);
        if (error.name == "BucketAlreadyOwnedByYou") {
            console.warn('Bucket ${bucketName} already exist')
        }
        else {
            throw error;
        }
    }
}

createS3Bucket(bucketName)
    .then(() => console.log("bucket creation attempt"))
    .catch((err) => console.error("unhandled error in bucket creation", err));

async function addImageToBucket(bucketName, key) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    
    try {
        const response = await client.send(command);
        console.log(response);
    }
    catch (error) {
        if ( error instanceof S3ServiceException && error.name == "EntityTooLarge") {
            console.error("S3 error uploading ${bucketName}. Object too large.");
        }
        else if (error instanceof S3ServiceException) {
            console.error("S3 error uploading ${bucketName}.");
        }
        else {
            throw error;    
        }
        
    }
}

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use(fileUpload({
        limits: {
            fileSize: 10000000,
        },
        abortOnLimit: true,
    })
);

app.post('/upload', (req,res) => {
    const { image } = req.files;
    
    if(!image) return res.sendStatus(400);
    
    // Check if image type.
    if(!/^image/.test(image.mimetype)) return res.sendStatus(400);
    
    // Add image to bucket
    addImageToBucket(bucketName, image.name)
    
    image.mv(__dirname + '/upload/' + image.name);
        
    res.sendStatus(200);
});

app.listen(PORT, () => {
   console.log('Example app listening on port ${PORT}'); 
});


// http://localhost:8080 to run.