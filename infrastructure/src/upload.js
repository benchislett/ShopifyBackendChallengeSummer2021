const fetch = require('node-fetch');

const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const FILE_TYPES = ['jpeg', 'jpg', 'png'];

exports.handler = async event => {
  const { url, tags, encoding, owner } = JSON.parse(event.body);
  const id = Math.floor(Math.random() * 1000000000000).toString();
  console.log(`Uploading image from ${url} with id ${id}`);

  const imageData = await fetch(url).then(response => response.blob());
  const { type } = imageData;
  const ext = type.split('/').slice(-1)[0];
  if (!type || FILE_TYPES.every(t => !type.includes(t))) {
    throw new Error('Invalid file type!');
  }

  const signedUploadURL = await s3.getSignedUrlPromise('putObject', {
    Bucket: process.env.BUCKET_NAME,
    Key: id,
    Expires: 300,
    ContentType: type
  });

  console.log('Successfully received S3 signed url. Uploading...');

  await fetch(signedUploadURL, {
    method: 'PUT',
    body: imageData
  });

  console.log('S3 upload complete. Entering metadata...');

  await ddb.put({
    TableName: process.env.TABLE_NAME,
    Item: {
      id,
      ext,
      tags: (tags || []).filter(t => typeof(t) === 'string' && t.length >= 3),
      encoding,
      owner: (owner && typeof(owner) === 'string') ? owner : undefined,
      source: url
    }
  }).promise();

  console.log('Metadata entered successfully. Exiting with code 200...');

  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify({ id })
  }
}
