const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs=require('fs');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const uploadToS3 = async (file, companyName, role) => {
    const fileContent = file.buffer;
    const fileExt = path.extname(file.originalname);
    const fileName = `${companyName}/${role}/${uuidv4()}${fileExt}`;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
        ContentType: file.mimetype
    };

    const data = await s3.upload(params).promise();
    return data.Location;
};

const uploadExcel = async (buffer, fileName, contentType) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: contentType
    };

    const data = await s3.upload(params).promise();
    return data.Location;
};

module.exports = { uploadToS3, uploadExcel };
