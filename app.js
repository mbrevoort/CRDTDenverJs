
var crdt     = require('crdt')
  , nodeStatic = require('node-static')
  , shoe     = require('shoe')
  , MuxDemux = require('mux-demux');

var staticFiles = new(nodeStatic.Server)('./public');
var server = require('http').createServer(function (request, response) {
  request.addListener('end', function () {
    staticFiles.serve(request, response);
  });
});

var board = new crdt.Doc()

board.on('row_update', function (row) {
  console.log(row.toJSON())
})

shoe(function (sock) {
  var mx;
  sock.pipe(mx = new MuxDemux(function (s) {
    if(!s.meta || s.meta.type !== 'board')
      s.error('Unknown Doc' + JSON.stringify(s.meta))
    else
      s.pipe(board.createStream()).pipe(s)
  })).pipe(sock)
}).install(server.listen(3000), '/shoe')

