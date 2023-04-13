const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const formidable = require('formidable-serverless');
require('dotenv').config();

const BUCKET_NAME = process.env.BUCKET_NAME;

const { processImageToThumbnail } = require('./helpers/thumbnail-processing-helper.js');

// TODO: Smallcase in API endpoint name

exports.uploadImageAndProcessThumbnail = async (event, context) => {
    const form = new formidable.IncomingForm();
    let response = {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: `BucketName: ${BUCKET_NAME}`
    };

    let imageKey; let imageBinary;

    form.parse(event, (err, fields, files) => {
        if (err) {
            console.log(err);
            response.statusCode = 500;
            response.body = JSON.stringify(err);
            return response;
        }

        imageKey = fields.imageKey;
        imageBinary = files.imageBinary;
    });

    const thumbnailKey = `${imageKey.split(".")[0]}_thumbnail.jpg`;

    try {
        let thumbnailImage = await processImageToThumbnail(imageBinary.content.data);

        console.log("Hello");

        //Uploading original image and thumbnail
        let promises = [];
        promises.push(uploadFileToS3(imageKey, imageBinary));
        promises.push(uploadFileToS3(thumbnailKey, thumbnailImage));
        await Promise.all(promises);

        // uploadFileToS3_Sync(imageKey, imageBinary.content.data);
        // uploadFileToS3_Sync(thumbnailKey, thumbnailImage);

        console.log("Hello1");

        response.body = `Successfully uploaded ${imageKey} and corresponding thumbnail`;
        response.statusCode = 200;
    } catch (error) {
        console.log(error);
        response.statusCode = 500;
        response.body = JSON.stringify(error);
    }

    return response;
};

// exports.uploadImageAndProcessThumbnail = async (event, context) => {
//     const form = formidable({ multiples: true });
//     let response = {
//         statusCode: 200,
//         headers: { 'Content-Type': 'application/json' },
//         body: `BucketName: ${BUCKET_NAME}`
//     };

//     try {
//         await new Promise((resolve, reject) => {
//             form.parse(event, async (err, fields, files) => {
//                 if (err) {
//                     reject(err);
//                     return;
//                 }

//                 const imageKey = fields.imageKey;
//                 const imageBinary = files.imageBinary;
//                 const thumbnailKey = `${imageKey.split(".")[0]}_thumbnail.jpg`;

//                 try {
//                     let thumbnailImage = await processImageToThumbnail(imageBinary.content.data);

//                     console.log("Hello");

//                     //Uploading original image and thumbnail
//                     let promises = [];
//                     promises.push(uploadFileToS3(imageKey, imageBinary));
//                     promises.push(uploadFileToS3(thumbnailKey, thumbnailImage));
//                     await Promise.all(promises);

//                     // uploadFileToS3_Sync(imageKey, imageBinary.content.data);
//                     // uploadFileToS3_Sync(thumbnailKey, thumbnailImage);

//                     console.log("Hello1");

//                     response.body = `Successfully uploaded ${imageKey} and corresponding thumbnail`;
//                     resolve(response);

//                 } catch (error) {
//                     console.log(error);
//                     response.body = JSON.stringify(error);
//                     reject(error);
//                 }
//             });
//         });
//         response.statusCode = 200;
//         return response;
//     } catch (error) {
//         console.log(error);
//         response.statusCode = 500;
//         return response;
//     }
// }



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

function uploadFileToS3_Sync(filename, fileBinary) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: fileBinary,
        ContentType: 'image/jpeg'
    };
    s3.putObject(params);
}
//#endregion