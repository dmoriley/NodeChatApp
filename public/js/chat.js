var socket = io(); //intiating the request to open and persist the socket

function scrollToBottom() {
  var messages = document.querySelector('#messages');
  if (!messages.children) {
    return;
  }

  // scroll height - scroll top should === clientHeight if at the bottom
  var scrollPosition =
    messages.scrollHeight - messages.scrollTop - messages.clientHeight;
  // scrollPosition > 0 means its not at the bottom. Negative or 0 its fine
  if (scrollPosition > 0) {
    messages.scrollTop = messages.scrollHeight;
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
