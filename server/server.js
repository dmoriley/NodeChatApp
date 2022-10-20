require('./config/config.js');
const express = require('express');
const WebSocketServer = require('ws');
const { uid } = require('uid');
const { join: pathJoin } = require('path');
const wsService = require('./services/websocket.service');

const app = express();
const port = process.env.PORT;
const publicPath = pathJoin(__dirname, '../client/public');

// Set up a headless websocket server that prints any
// events that come in.
const wss = new WebSocketServer.Server({ noServer: true });

wss.on('connection', (socket, req) => {
  socket.id = uid(); // assign unique id
  // have access to the req url if needed to get query parameters or headers
  socket.on('message', (data) => {
    const { type, content } = JSON.parse(data);
    switch (type) {
      case 'createMessage':
        wsService.createMessage(socket, content);
        break;
      case 'join':
        wsService.join(socket, content);
        break;
      default:
        console.warn('Type is unknown: ', type);
        break;
    }
  });
  socket.on('close', (data) => {
    wsService.leave(socket);
  });
});

app.use(express.static(publicPath));

// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit('connection', socket, request);
  });
});
