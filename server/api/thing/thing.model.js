'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/*
var StockPriceSchema = new Schema({
  date: Date,
  price: Number
})
*/

var StockSchema = new Schema({
  code: String,
  name: String,
  //active: Boolean,
  //data : [StockPriceSchema]
});

module.exports = mongoose.model('Stock', StockSchema);
