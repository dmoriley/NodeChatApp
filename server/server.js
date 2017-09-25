require('./config/config.js');
const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');

const publicPath = path.join(__dirname, '../public')
const port = process.env.PORT;

var app = express();
//need to use the http server instead of the express server in order to make way to use socket.io
var server = http.createServer(app);
var io = socketio(server); //this returns our websocket server


app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('new user connection');

    socket.on('disconnect',() => {
        console.log('User was disconnected');
    })
});

io

//changed from app.listen to server.listen
server.listen(port, () => {
    console.log(`Listening on ${port}`);
})