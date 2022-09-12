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

function createNewMessage(messageData) {
  var formattedTime = moment(messageData.createdAt).format('h:mm a');
  var template = document.querySelector('#message-template').innerHTML;
  const li = document.createElement('li');
  li.className = 'message';
  li.style.backgroundColor = messageData.colour;
  var html = Mustache.render(template, {
    text: messageData.text,
    from: messageData.from,
    createdAt: formattedTime,
    bgColour: messageData.colour,
  });
  li.innerHTML = html;
  return li;
}

socket.on('connect', function () {
  var params = new URLSearchParams(window.location.search);

  socket.emit('join', Object.fromEntries(params), function (error) {
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
  var messages = document.querySelector('#messages');

  if (!(messages.children && messages.children.length > 0)) {
    messages.appendChild(createNewMessage(message));
    return;
  }

  var lastMessage = messages.querySelector('li:last-child');
  var lastUser = lastMessage.querySelector('h4').innerText;
  var lastTimeStamp = lastMessage.querySelector('span').innerText;
  if (
    moment(lastTimeStamp, 'h:mm a').add(1.5, 'minutes').valueOf() >
      moment(message.createdAt) &&
    lastUser === message.from
  ) {
    var p = document.createElement('p');
    p.innerText = message.text;
    lastMessage.querySelector('.message__body').appendChild(p);
  } else {
    messages.appendChild(createNewMessage(message));
  }

  scrollToBottom();
});

socket.on('updateUserList', function (users) {
  var ol = document.createElement('ol');
  users.forEach(function (user) {
    const li = document.createElement('li');
    li.innerText = user;
    ol.appendChild(li);
  });
  document.querySelector('#users').innerHTML = ol.outerHTML;
});

document
  .querySelector('#message-form')
  .addEventListener('submit', function (e) {
    e.preventDefault();

    var messageTextbox = document.querySelector('[name=message]');

    socket.emit(
      'createMessage',
      {
        text: messageTextbox.value,
      },
      function () {
        messageTextbox.value = '';
      }
    );
  });
