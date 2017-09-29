require('./config/config.js');
const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {Users} = require('./utils/users');
const {isRealString,getRandomColour} = require('./utils/utils');
const publicPath = path.join(__dirname, '../public')
const port = process.env.PORT;

var app = express();
//need to use the http server instead of the express server in order to make way to use socket.io
var server = http.createServer(app);
var io = socketio(server); //this returns our websocket server
var users = new Users()


app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('User joined');

    socket.on('createMessage', (message, callback) => {
        var user = users.getUser(socket.id);
        if(user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name,message.text,user.colour));
        }

        //socket.emit emits to one connection while io.emit emits to every connection on the server

        //brodcast sends to evey socket but itself
        // socket.broadcast.emit('newMessage', {
        //     from: message.from,
        //     text: message.text,
        //     createdAt: new Date().getTime()
        // });
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);
        if(user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude,user.colour));
        }
    });

    socket.on('join', (params, callback) => {
        if(!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room name are required');
        } else if(users.getUserByName(params.name)) {
            return callback(`The name ${params.name} is already in use. Pick another one.`);
        };

        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room,getRandomColour());

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
        //emitting to specific rooms conpared to whole server
        // io.emit -> io.to('roomname').emit
        // socket.broadcast.emit -> socket.broadcast.to('roomname').emit
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));

        callback();
    });

    socket.on('disconnect',() => {
        console.log('User was disconnected');
        var user = users.removeUser(socket.id);
        if(user) {
            io.to(user.room).emit('updateUserList',users.getUserList(user.room));
            io.to(user.room).emit('newMessage',generateMessage('Admin', `${user.name} has left.`));
        }
    });
});


//changed from app.listen to server.listen
server.listen(port, () => {
    console.log(`Listening on ${port}`);
})