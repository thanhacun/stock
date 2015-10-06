'use strict';

angular.module('stockApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
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
    $scope.stockDataUpdate = function(stockCode, cb) {
      $http.get('/api/things/' + stockCode).success(function(stockData) {
        $scope.stocksData.push({
          x: stockData.labels,
          y: stockData.data,
          name: stockCode
        });
        cb();
      });
    };

    $scope.stocksDataUpdate = function(cb) {
      $http.get('/api/things').success(function(stocks) {
        $scope.stocks = stocks;
        //async stocks to get result
        async.each(stocks, function(stock, callback){
          $scope.stockDataUpdate(stock.code, function(){
            callback();
          });

        }, function(err){
          if (!err) {
            cb();
          }
        });
       });
    };

    $scope.chartShow = function() {
      if ($scope.stocksData.length !== 0) {
        //console.log($scope.stocksData);
        Plotly.newPlot($scope.stockChart, $scope.stocksData, $scope.chartLayout);
      }
    };

    //Get saved stocks and Show chart
    $scope.stocksDataUpdate($scope.chartShow);

    $scope.addStock = function() {
      if($scope.stockCode === '') return;
      //check duplicate
      if ($scope.stocks.filter(function(stock) {return stock.code === $scope.stockCode;}).length !== 0) {
        alert ('Already added');
        $scope.stockCode = '';
        return;
      }

      $http.post('/api/things', { code: $scope.stockCode });
      socket.syncUpdates('stock', $scope.stocks);
      $scope.stockDataUpdate($scope.stockCode, $scope.chartShow);
      $scope.stockCode = '';
    };

    $scope.deleteStock = function(stock) {
      console.log(stock);
      $http.delete('/api/things/' + stock.code);
      //remove stock
      $scope.stocks = $scope.stocks.filter(function(s) {
        return s.code !== stock.code
      });

      //remove data and update chart
      //TODO: use socket.io
      $scope.stocksData = $scope.stocksData.filter(function(s) {
        return s.name !== stock.code;
      });
      $scope.chartShow();
    };

    $scope.$on('$destroy', function () {
      //socket.unsyncUpdates('stock', $scope.stocks);
    });
  });
