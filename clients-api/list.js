'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const params = {
  TableName: process.env.DYNAMODB_CLIENTS_TABLE,
};

module.exports.list = (event, context, callback) => {
  const { queryStringParameters } = event;

  let dbMethod = 'scan';

  if (queryStringParameters) {
    for (const key in queryStringParameters) {
      params.FilterExpression = `#${key} = :${key} and `; // '#name = :name and #surname = :surname',
      // params.KeyConditionExpression += `#${key} = :${key} and `;
      params.ExpressionAttributeNames[`#${key}`] = `${key}`;
      params.ExpressionAttributeValues[`:${key}`] = queryStringParameters[key];
    }
    // (params.ExpressionAttributeNames = {
    //   '#name': 'name',
    //   '#surname': 'surname',
    // }),
    //   (params.ExpressionAttributeValues = {
    //     ':name': queryStringParameters.name,
    //     ':surname': queryStringParameters.surname,
    //   });

    dbMethod = 'query';
  }

  // fetch all clients from the database
  dynamoDb[dbMethod](params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: "Couldn't fetch the clients.",
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
    callback(null, response);
  });
};
