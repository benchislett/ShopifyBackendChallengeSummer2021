const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async event => {
  const { id } = event.pathParameters;

  console.log(`Deleting metadata for image ${id}`);

  await ddb.delete({ TableName: process.env.TABLE_NAME, Key: { id } }).promise();

  console.log('Successfully deleted metadata. Deleting image content...');

  await s3.deleteObject({
    Bucket: process.env.BUCKET_NAME,
    Key: id
  }).promise();

  console.log('Successfully deleted image content. Exiting with code 200...');

  return {
    statusCode: 200,
    headers: {},
    body: 'Deletion successful'
  };
}
