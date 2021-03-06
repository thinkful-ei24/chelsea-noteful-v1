'use strict';

//express
const express = require('express');

//router
const router = express.Router();

//data
const data = require('../db/notes');
const simDB = require('../db/simDB');
const notes = simDB.initialize(data);

// GET return notes app & check for search query - using promises
router.get('/notes', (req, res, next) => {
  let { searchTerm } = req.query;
  notes
    .filter(searchTerm)
    .then(list => {
      res.json(list); // responds with filtered array
    })
    .catch(err => {
      if (err) {
        return next(err); // goes to error handler
      }
    });
});

// GET return specific note in notes app - using promises
router.get('/notes/:id', (req, res, next) => {
  let { id } = req.params;
  notes
    .find(id)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// PUT (update) notes by ID
router.put('/notes/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateFields = ['title', 'content'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  notes
    .update(id, updateObj)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err) {
        return next(err);
      }
    });
});

// POST add a new item
router.post('/notes', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };

  /**** Never trust users - validate input ****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  notes
    .create(newItem)
    .then(item => {
      if (item) {
        res
          .location(`http://${req.headers.host}/notes/${item.id}`)
          .status(201)
          .json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err) {
        return next(err);
      }
    });
});

// DELETE an item
router.delete('/notes/:id', (req, res, next) => {
  const { id } = req.params;

  notes.delete(id).catch(err => {
    if (err) {
      return next(err);
    }
    res.status(204);
  });
});

//export router
module.exports = router;
