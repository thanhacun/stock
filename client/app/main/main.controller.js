'use strict';

angular.module('stockApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.stocks = [];
    $scope.stocksData = [];
    $scope.chartLayout = {
      title: 'Stock closed price since 1st January, 2015',
      xaxis: {
        title: 'Date'
      },
      yaxis: {
        title: 'Price'
      }
    };
    $scope.stockChart = document.getElementById('stock-chart');

    //Return a callback to use with async
    $scope.stockDataUpdate = function(stock, cb) {
      $http.get('/api/things/' + stock.code).success(function(stockData) {
        $scope.stocksData.push(stockData.data);
        $scope.stocks.push(stock);
        cb();
      });
    };

    $scope.stocksDataUpdate = function(cb) {
      $http.get('/api/things').success(function(stocks) {
        console.log(stocks);
        //$scope.stocks = stocks;
        //async stocks to get result
        async.each(stocks, function(stock, callback){
          $scope.stockDataUpdate(stock, function(){
            callback();
          });

        }, function(err){
          if (!err) {
            console.log($scope.stocksData);
            cb();
          }
        });
       });

    };

    $scope.chartShow = function() {
      if ($scope.stocks.length !== 0) {
        //console.log($scope.stocksData);
        Plotly.newPlot($scope.stockChart, $scope.stocks, $scope.chartLayout);
      }
    };

    //Get saved stocks and Show chart
    $http.get('/api/things').success(function(stocks) {
      $scope.stocks = stocks;
      $scope.chartShow();

      //TODO: WHY syncUpdates has to be here
      socket.syncUpdates('stock', $scope.stocks, function(e, i, a) {
        //console.log(e, i, a);
        $scope.chartShow();
        Plotly.newPlot($scope.stockChart, $scope.stocks, $scope.chartLayout);
      });

    });

    $scope.addStock = function() {
      if($scope.stockCode === '') return;
      //check duplicate
      if ($scope.stocks.filter(function(stock) {return stock.code === $scope.stockCode;}).length > 0) {
        alert ('Already added');
        return;
      }
      //add new stock
      $http.post('/api/things', {code: $scope.stockCode.toUpperCase()}).success(function(stock) {
        $scope.stockCode = '';
      });
    };

    $scope.deleteStock = function(stock) {
      $http.delete('/api/things/' + stock._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('stock');
    });
  });
