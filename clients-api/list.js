'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const params = {
  TableName: process.env.DYNAMODB_CLIENTS_TABLE,
};

module.exports.list = (event, context, callback) => {
  const { queryStringParameters } = event;

  if (queryStringParameters) {
    params.ExpressionAttributeValues = {};
    params.ExpressionAttributeNames = {};
    params.FilterExpression = '';
    const keys = Object.keys(queryStringParameters);

    keys.forEach(
      (key) =>
        (params.ExpressionAttributeValues[`:${key}`] =
          queryStringParameters[key])
    );
    params.FilterExpression = keys
      .map((key) => `#${key} = :${key}`)
      .join(' and ');

    params.ExpressionAttributeNames = keys.reduce((acc, key) => {
      acc[`#${key}`] = key;
      return acc;
    }, params.ExpressionAttributeNames);
  }

  dynamoDb.scan(params, (error, result) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: "Couldn't fetch the clients.",
      });
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
    callback(null, response);
  });
};
