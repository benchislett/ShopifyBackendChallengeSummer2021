const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async event => {
  const { limit = 9000 } = JSON.parse(event.body || "{}");
  const { tag } = event.pathParameters;

  let lastKey = null;
  const matches = [];

  do {
    const data = await ddb.scan({
      TableName: process.env.TABLE_NAME
    }).promise();
    
    console.log(`Scanned ${data.ScannedCount} items`);

    lastKey = data.LastEvaluatedKey;
    data.Items
      .filter(item => item && item.tags && item.tags.includes(tag))
      .forEach(item => matches.push(item));
  } while (lastKey != null && matches.length < limit);

  console.log(`Matched ${matches.length} items. Exiting with code 200...`);

  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(matches)
  };
}
