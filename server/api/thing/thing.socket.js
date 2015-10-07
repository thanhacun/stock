/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var getData = require('./thing.stockdata').getStockChartData;
var Stock = require('./thing.model');


exports.register = function(socket) {
  Stock.schema.post('save', function (doc) {
    //Attach chart data to new created doc or stock
    getData(doc.code, function(error, stockWithData) {
      stockWithData._id = doc._id;
      onSave(socket, stockWithData);
    })

  });
  Stock.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
};

function onSave(socket, doc, cb) {
  socket.emit('stock:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('stock:remove', doc);
}
