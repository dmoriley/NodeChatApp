var socket = io(); //intiating the request to open and persist the socket

socket.on('connect', function() {
    console.log('Connected to server');
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

//custom event to listen for
socket.on('newMessage', function(message) { 
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = $('#message-template').html();
    var html = Mustache.render(template,{
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });
    $('#messages').append(html);
    // var li = $('<li></li>');
    // li.text(`${message.from} ${formattedTime}: ${message.text}`);
    // $('#messages').append(li);
});

socket.on('newLocationMessage', function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a'),
        template = $('#location-message-template').html(),
        html = Mustache.render(template, {
           url: message.url,
           from: message.from,
           createdAt: formattedTime
        });
    $('#messages').append(html);
    // var li = $('<li></li>');
    // var a = $('<a target="_blank">My location</a>');
    // li.text(`${message.from} ${formattedTime}: `);
    // a.attr('href', message.url);
    // li.append(a);
    //$('#messages').append(li);
});

$('#message-form').on('submit', function(e) {
    e.preventDefault();

    var messageTextbox = $('[name=message]');

    socket.emit('createMessage', {
        from: 'User',
        text: messageTextbox.val()
    }, function () {
        messageTextbox.val('');
    });
});

var locationButton = $('#send-location');
locationButton.on('click', function() {
    if(!navigator.geolocation) {
        return alert('Geolocation not support by your browser.');
    }

    locationButton.attr('disabled','disabled').text('Sending location...');

    navigator.geolocation.getCurrentPosition(function(position){
        locationButton.removeAttr('disabled').text('Send location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    },function() {
        alert('Unable to fetch location.');
        locationButton.removeAttr('disabled').text('Send location');
    })
});