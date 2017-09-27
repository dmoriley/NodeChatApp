require('./config/config.js');
const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const publicPath = path.join(__dirname, '../public')
const port = process.env.PORT;

var app = express();
//need to use the http server instead of the express server in order to make way to use socket.io
var server = http.createServer(app);
var io = socketio(server); //this returns our websocket server


app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connection');

    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));

    socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user joined'));

    socket.on('createMessage', (message, callback) => {

        //socket.emit emits to one connection while io.emit emits to every connection on the server
        io.emit('newMessage', generateMessage(message.from,message.text));
        callback();
        //brodcast sends to evey socket but itself
        // socket.broadcast.emit('newMessage', {
        //     from: message.from,
        //     text: message.text,
        //     createdAt: new Date().getTime()
        // });
    });

    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
    });

    socket.on('disconnect',() => {
        console.log('User was disconnected');
    });
});


//changed from app.listen to server.listen
server.listen(port, () => {
    console.log(`Listening on ${port}`);
})