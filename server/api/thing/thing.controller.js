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
var _getStockChartData = require('./thing.stockdata').getStockChartData;

var Stock = require('./thing.model');

exports.getStockCode = function(req, res) {
  _getStockChartData(req.params.stockCode, function(err, stock){
    if (err) return res.status(500).json({error: 'bad connection or incorrect quote'});
    return res.status(200).json(stock);
  });
};

// Get list of saved stocks
exports.index = function(req, res) {
  Stock.find(function (err, stocks) {
    if(err) { return handleError(res, err); }
    //async getting stock data
    var stocksWithData = [];
    async.each(stocks, function(stock, callback){
      _getStockChartData(stock.code, function(error, stockWithData) {
        if (error) callback(error);
        stockWithData._id = stock._id;
        stocksWithData.push(stockWithData);
        callback();
      });
    }, function(error){
      if (error) return handleError(res, err);
      return res.status(200).json(stocksWithData);
    });
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
  Stock.create(req.body, function(err, newStock) {
    if (err) return handleError(res, err);
    return res.status(200).json(newStock);
  })
  /*
  _getStockChartData(req.body.code, function(error, newStock) {
    Stock.create({code: req.body.code}, function(err, stock) {
      if (err) return handleError(res, err);
      newStock._id = stock._id;
      return res.status(200).json(newStock);
    });
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
