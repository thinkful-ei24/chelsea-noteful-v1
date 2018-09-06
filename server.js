'use strict';

//express
const express = require('express');

//3rd party middleware
const morgan = require('morgan');

//my modules
const { PORT } = require('./config');
const router = require('./router/notes.router');

const app = express();

// run morgan logger
app.use(morgan('dev'));

// ADD STATIC SERVER HERE
app.use(express.static('public'));

// Parse request body - we need to utilize the built in middleware to parse incoming requests that contain JSON and make them available on the req.body
app.use(express.json());

//mount the router
app.use('/api', router);

//test
app.get('/boom', (req, res, next) => {
  throw new Error('Boom!!');
});

// Error handling
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({ message: 'Not Found' });
});

// check error
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

app
  .listen(PORT, function() {
    console.info(`Server listening on ${this.address().port}`);
  })
  .on('error', err => {
    console.error(err);
  });
