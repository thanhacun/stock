/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var request = require('request');
var async = require('async');

var Stock = require('./thing.model');

var quandl = {
  dataset: 'https://www.quandl.com/api/v3/datasets/WIKI/',
  key: process.env.QUANDL_KEY || '',
  start: '2015-01-01',
}

//Query stock code and save its data to database
var _getStockChartData = function(stockCode, cb) {
  var opts = {
    uri: quandl.dataset + stockCode + '.json?exclude_column_names=true&column_index=4&start_date=' + quandl.start + '&api_key=' + quandl.key,
    json: true
  };
  request(opts, function(error, response, body) {
    if (error) return;
    if (body.quandl_error) return;
    //TODO: consider async here
    //Return data to match with plotly.js
    var chartData = body.dataset.data.reduce(function(a, c) {
      a.x.push(c[0]);
      a.y.push(c[1]);
      return a;
    }, {x: [], y: []});
    cb({
      code: stockCode,
      name: stockCode,
      x: chartData.x,
      y: chartData.y
    })
  });
};
exports.getStockCode = function(req, res) {
  quandl.code = req.params.stockCode;
  var opts = {
    uri: quandl.dataset + quandl.code + '.json?exclude_column_names=true&column_index=4&start_date=' + quandl.start + '&api_key=' + quandl.key,
    json: true
  };
  request(opts, function(error, response, body) {
    if (error) return handleError(res, error);
    if (body.quandl_error) return res.status(500).json({error: 'incorrect quote'});
    //TODO: consider async here
    //Return data to match with plotly.js
    var chartData = body.dataset.data.reduce(function(a, c) {
      a.x.push(c[0]);
      a.y.push(c[1]);
      return a;
    }, {x: [], y: []});
    return res.status(200).json({
      data: {
        x: chartData.x,
        y: chartData.y,
        name: body.dataset.dataset_code
      },
      //code: body.dataset_code,
      //name: body.name,
      //labels: chartData.labels,
      //data: chartData.data
    });
  });
};

// Get list of saved stocks
exports.index = function(req, res) {
  Stock.find(function (err, stocks) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(stocks);
  });
};

// Get a single thing
exports.show = function(req, res) {
  Stock.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.status(404).send('Not Found'); }
    return res.json(thing);
  });
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  _getStockChartData(req.body.code, function(newStock) {
    Stock.create(newStock, function(err, stock) {
      if (err) return handleError(res, err);
      return res.status(200).json(stock);
    });
  });

  /*
  Stock.create(req.body, function(err, thing) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(thing);
  });
  */
};

// Updates an existing thing in the DB.
// NOT USE
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Stock.findById(req.params.id, function (err, thing) {
    if (err) { return handleError(res, err); }
    if(!thing) { return res.status(404).send('Not Found'); }
    var updated = _.extend(thing, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(thing);
    });
  });
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  Stock.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.status(404).send('Not Found'); }
    thing.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
