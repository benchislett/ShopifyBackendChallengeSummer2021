const fetch = require('node-fetch');

const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async event => {
  const { encoding, limit = 1 } = JSON.parse(event.body || "{}");

  let lastKey = null;
  let items = [];

  do {
    const data = await ddb.scan({
      TableName: process.env.TABLE_NAME
    }).promise();

    console.log(`Scanned ${data.ScannedCount} items`);

    lastKey = data.LastEvaluatedKey;
    items = items.concat(data.Items.filter(item => item && item.encoding && item.encoding.length >= 999));
  } while (lastKey != null);

  const loss = a => 
    a.encoding.reduce((prev, next, i) => prev + Math.pow(next - encoding[i], 2), 0.0);

  items.sort((a, b) => loss(a) - loss(b));

  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(items.slice(0, limit))
  };
}
