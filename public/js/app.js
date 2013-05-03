angular.module('crdtdemo', [])
  .controller('boardController', function ($scope) {

    var crdt        = require('crdt')
      , MuxDemux    = require('mux-demux')
      , shoe        = require('shoe')
      , stream      = null
      , board       = new crdt.Doc()
      , connected   = false;

    board.on('update', function () { setTimeout(function() { $scope.$apply();},10); });
    $scope.board = board.rows;

    $scope.newBoard = function () {
      for (var i=0; i < 100; i++) {
        board.set(String(i), { color: "#000", count: 0 })
      }
    }

    $scope.toggleConnect = function () {
      if (connected) {
        stream.end();
        stream.removeAllListeners();
        connected = false;
      }
      else {
        stream = shoe('/shoe');
        var mx = MuxDemux()
        stream.pipe(mx).pipe(stream)
        var ds = board.createStream()
        ds.pipe(mx.createStream({type: 'board'})).pipe(ds)

        stream.on('connect', function () { $scope.$apply(function() { connected = true }) });
        stream.on('end', function () { $scope.$apply(function() { connected = false }) });
      }
    }

    $scope.getButtonLabel = function () {
      return (connected) ? "disconnect" : "connect";
    }

    $scope.getStateLabel = function () {
      return (connected) ? "CONNECTED" : "DISCONNECTED";
    }

    $scope.click = function (piece, index) {
      var randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
      var updatedPiece = { color: randomColor, count: piece.state.count+1 };
      board.set(piece.id, updatedPiece);
    }

    $scope.toggleConnect();

  })
  .directive('board',function () {
    return {
      restrict: 'E',
      controller: 'boardController',
      templateUrl: 'templates/board.html'
    }
  })