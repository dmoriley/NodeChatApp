var socket = io(); //intiating the request to open and persist the socket

socket.on('connect', function() {
    console.log('Connected to server');
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

//custom event to listen for
socket.on('newMessage', function(message) {
    console.log('New message: ',message);
});