'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {
  const id = event.pathParameters.id;
  let response;

  const params = {
    TableName: process.env.DYNAMODB_CLIENTS_TABLE,
    Key: {
      id,
    },
  };

  // fetch client from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: "Couldn't fetch the client item.",
      });
      return;
    }
    // create a response
    if (!result.Item) {
      response = {
        statusCode: 404,
        body: JSON.stringify({
          message: `Client with id ${id} not found.`,
        }),
      };
    } else {
      response = {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
    }

    callback(null, response);
  });
};
