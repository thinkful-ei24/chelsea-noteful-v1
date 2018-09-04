'use strict';

const express = require('express');

const data = require('./db/notes');

const app = express();

// ADD STATIC SERVER HERE

app.use(express.static('public'));

// return notes app & check for search query
app.get('/api/notes', (req, res) => {
  let { searchTerm } = req.query;
  if (searchTerm) {
    return res.json(data.filter(item => item.title.includes(searchTerm)));
  }
  res.json(data);
});

// return specific note in notes app
app.get('/api/notes/:id', (req, res) => {
  //written out way
  // let id = req.params.id;
  // short hand
  let { id } = req.params;
  res.json(data.find(item => item.id === Number(id)));
});

app
  .listen(8080, function() {
    console.info(`Server listening on ${this.address().port}`);
  })
  .on('error', err => {
    console.error(err);
  });
