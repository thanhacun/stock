/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Stock = require('./thing.model');

exports.register = function(socket) {
  Stock.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Stock.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('stock:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('stock:remove', doc);
}
