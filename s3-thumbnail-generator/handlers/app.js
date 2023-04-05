const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { parse } = require('aws-multipart-parser');
require('dotenv').config();

const BUCKET_NAME = process.env.BUCKET_NAME;

// const { processImageToThumbnail } = require('./helpers/thumbnail-processing-helper.js');

// TODO: Smallcase in API endpoint name

exports.uploadImageAndProcessThumbnail = async (event, context) => {
    const { imageBinary, imageKey } = parse(event, true);
    const formData = parse(event, true);
    const thumbnailKey = `${imageKey.split(".")[0]}_thumbnail.jpg`;

    let response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: `BucketName: ${BUCKET_NAME}`
    };

    // return response;

    try {
        // let thumbnailImage = await processImageToThumbnail(imageBinary);
        let thumbnailImage = imageBinary;

        let promises = [];
        promises.push(uploadFileToS3(imageKey, imageBinary.content.data));
        promises.push(uploadFileToS3(thumbnailKey, thumbnailImage.content.data));

        await Promise.all(promises); //Uploading both thumbnail and original image

        response.body = `Successfully uploaded ${imageKey} and corresponding thumbnail`;
        return response;

    } catch (error) {
        console.log(error);
        response.body = JSON.stringify(error);
        return response;
    }
}

// #TOASK: What exactly happnes when we are running sam locally? How can we acess stuff like S3 and all locally?

//#region Private functions
function uploadFileToS3(filename, fileBinary) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: fileBinary,
        ContentType: 'image/jpeg'
    };
    return s3.putObject(params).promise();
}
//#endregion