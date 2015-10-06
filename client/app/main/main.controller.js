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
    //TODO: by angularjs instead of jquery
    $scope.stockChart = document.getElementById('stock-chart');

    $scope.chartShow = function(stockCode) {
      $http.get('/api/things/' + stockCode).success(function(stockData) {
        $scope.stocksData.push({
          x: stockData.labels,
          y: stockData.data,
          name: stockCode
        });
        //Plot chart
        Plotly.newPlot($scope.stockChart, $scope.stocksData, $scope.chartLayout);
      });
    };

    //Get saved stocks
    $http.get('/api/things').success(function(stocks) {
      $scope.stocks = stocks;
      socket.syncUpdates('stock', $scope.stocks);
      angular.forEach(stocks, function(stock) {
        $scope.chartShow(stock.code);
      });
    });

    $scope.addStock = function() {
      if($scope.stockCode === '') {
        return;
      }
      $http.post('/api/things', { code: $scope.stockCode });
      $scope.chartShow($scope.stockCode);
      $scope.newStock = '';
    };

    $scope.deleteStock = function(stock) {
      $http.delete('/api/things/' + stock.code);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('stock');
    });
  });
