'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const { name, surname, email, age } = JSON.parse(event.body);

  // validation
  if (!name || !surname || !email || !age) {
    console.error('Validation Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: "Couldn't update the client item.",
    });
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_CLIENTS_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeNames: {
      '#client_name': 'name',
    },
    ExpressionAttributeValues: {
      ':name': name,
      ':surname': surname,
      ':email': email,
      ':age': age,
      ':updatedAt': timestamp,
    },
    UpdateExpression:
      'SET #client_name = :name, surname = :surname, email = :email, age = :age, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW',
  };

  // update the client in the database
  dynamoDb.update(params, (error, result) => {
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
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
  });
};
