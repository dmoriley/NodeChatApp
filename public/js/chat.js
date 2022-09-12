var socket = io(); //intiating the request to open and persist the socket

function scrollToBottom() {
  //selectors
  var messages = $('#messages');
  var newMessage = messages.children('li:last-child');
  //heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (
    clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
    scrollHeight
  ) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on('connect', function () {
  var params = $.deparam(window.location.search);

  socket.emit('join', params, function (error) {
    if (error) {
      alert(error);
      window.location.href = '/';
    } else {
    }
  });
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

//custom event to listen for
socket.on('newMessage', function (message) {
  var formattedTime = moment(message.createdAt).format('h:mm a');

  var lastMessage = $('#messages').children('li:last-child'),
    lastUser = lastMessage.find('h4').text(),
    lastTimeStamp = lastMessage.find('span').text();

  if (
    moment(lastTimeStamp, 'h:mm a').add(1.5, 'minutes').valueOf() >
      moment(message.createdAt) &&
    lastUser === message.from
  ) {
    var p = $('<p></p>');
    p.text(message.text);
    lastMessage.children('.message__body').append(p);
  } else {
    var template = $('#message-template').html();
    var html = Mustache.render(template, {
      text: message.text,
      from: message.from,
      createdAt: formattedTime,
      bgColour: message.colour,
    });
    $('#messages').append(html);
  }

  scrollToBottom();
});

socket.on('newLocationMessage', function (message) {
  var formattedTime = moment(message.createdAt).format('h:mm a');

  var lastMessage = $('#messages').children('li:last-child'),
    lastUser = lastMessage.find('h4').text(),
    lastTimeStamp = lastMessage.find('span').text();

  if (
    moment(lastTimeStamp, 'h:mm a').add(1.5, 'minutes').valueOf() >
      moment(message.createdAt) &&
    lastUser === message.from
  ) {
    var template = $('#location-anchor-template').html();
    var p = Mustache.render(template, { url: message.url });
    lastMessage.children('.message__body').append(p);
  } else {
    var template = $('#location-message-template').html(),
      html = Mustache.render(template, {
        url: message.url,
        from: message.from,
        createdAt: formattedTime,
        bgColour: message.colour,
      });
    $('#messages').append(html);
  }

  scrollToBottom();
});

socket.on('updateUserList', function (users) {
  var ol = $('<ol></ol>');
  users.forEach(function (user) {
    ol.append($('<li></li>').text(user));
  });
  $('#users').html(ol);
});

$('#message-form').on('submit', function (e) {
  e.preventDefault();

  var messageTextbox = $('[name=message]');

  socket.emit(
    'createMessage',
    {
      text: messageTextbox.val(),
    },
    function () {
      messageTextbox.val('');
    }
  );
});
