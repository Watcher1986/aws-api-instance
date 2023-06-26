'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const { name, surname, email, age } = JSON.parse(event.body);
  // validation
  if (!name || !surname || !email || !age) {
    console.error('Validation Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: "Couldn't create the client item.",
    });
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_CLIENTS_TABLE,
    Item: {
      id: uuid.v1(),
      name,
      surname,
      email,
      age,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  // write the client to the database
  dynamoDb.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: "Couldn't create the client item.",
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
};
