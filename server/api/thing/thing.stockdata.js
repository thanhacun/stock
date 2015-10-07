'use strict';

var request = require('request');
var async = require('async');

var quandl = {
  dataset: 'https://www.quandl.com/api/v3/datasets/WIKI/',
  key: process.env.QUANDL_KEY || '',
  start: '2015-01-01'
};

/**
 * Get stock data from quandl
 * @param stockCode
 * @param cb
 */
exports.getStockChartData = function(stockCode, cb) {
  var opts = {
    uri: quandl.dataset + stockCode + '.json?exclude_column_names=true&column_index=4&start_date=' + quandl.start + '&api_key=' + quandl.key,
    json: true
  };
  request(opts, function(error, response, body) {
    if (error || body.quandl_error) {
      return cb('error', {});
    }
    //Return data to match with plotly.js
    var chartData = body.dataset.data.reduce(function(a, c) {
      a.x.push(c[0]);
      a.y.push(c[1]);
      return a;
    }, {x: [], y: []});
    cb(null, {
      code: stockCode,
      name: stockCode,
      x: chartData.x,
      y: chartData.y
    });
  });
};
