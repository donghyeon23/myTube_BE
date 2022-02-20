const AWS = require('aws-sdk');
const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION, BUCKET_NAME } = process.env;

module.exports = (article) => {
    const uri = article.imageUrl.split('/').slice(-1);
    const uri2 = article.videoUrl.split('/').slice(-1);
    const key = 'images/' + decodeURI(uri);
    const key2 = 'videos/' + decodeURI(uri2);

    const S3 = new AWS.S3({
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
        region: S3_REGION,
    });

    const params = {
        Bucket: BUCKET_NAME,
        Delete: {
            Objects: [{ Key: key }, { Key: key2 }],
            Quiet: false,
        },
    };
    S3.deleteObjects(params, (err, data) => {
        if (err) console.log(err, err.stack);
        // an error occurred
        else console.log(data);
    });
};
