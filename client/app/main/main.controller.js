'use strict';

angular.module('stockApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.stocks = [];
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
    $scope.spin = false;

    $scope.chartShow = function() {
      if ($scope.stocks.length !== 0) {
        Plotly.newPlot($scope.stockChart, $scope.stocks, $scope.chartLayout);
      }
    };

    //Get saved stocks and Show chart
    $http.get('/api/things').success(function(stocks) {
      $scope.stocks = stocks;
      $scope.chartShow();

      //TODO: WHY syncUpdates has to be here
      socket.syncUpdates('stock', $scope.stocks, function(e, i, a) {
        //stop spinning
        $scope.spin = false;
        //update frontend chart
        $scope.chartShow();
      });

    });

    $scope.addStock = function() {
      //check empty and duplicate
      if($scope.stockCode === '') return;
      if ($scope.stocks.filter(function(stock) {return stock.code === $scope.stockCode;}).length > 0) {
        alert ('Already added');
        return;
      }
      //spinning: it takes a litte time to get data
      //will be disable in syncUpdates
      $scope.spin = true;
      //add new stock
      $http.post('/api/things', {code: $scope.stockCode.toUpperCase()}).success(function(newStock) {
        $scope.stockCode = '';
      });
    };

    $scope.deleteStock = function(stock) {
      //console.log(stock);
      $http.delete('/api/things/' + stock._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('stock');
    });
  });
