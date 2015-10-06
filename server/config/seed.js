/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Stock = require('../api/thing/thing.model');

Stock.find({}).remove(function() {
  Stock.create({
    code : 'AAPL',
  }, {
    code : 'GOOG',
  });
});
