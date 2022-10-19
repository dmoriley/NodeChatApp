// var socket = io(); //intiating the request to open and persist the socket
const protocol = window.location.protocol.includes('https') ? 'wss' : 'ws';
const socket = new WebSocket(`${protocol}://${location.host}`);

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

/** Create new message li html element
 * @returns li html element
 */
function genNewLiMessageEl(messageData) {
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

/** Create new message el with supplied message and append to messages element */
function newMessage({ message }) {
  var messages = document.querySelector('#messages');

  if (!(messages.children && messages.children.length > 0)) {
    messages.appendChild(genNewLiMessageEl(message));
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
    messages.appendChild(genNewLiMessageEl(message));
  }

  scrollToBottom();
}

function updateUserList(content) {
  const { users } = content;
  var ol = document.createElement('ol');
  users.forEach(function (user) {
    const li = document.createElement('li');
    li.innerText = user;
    ol.appendChild(li);
  });
  document.querySelector('#users').innerHTML = ol.outerHTML;
}

socket.onopen = (event) => {
  console.log('connection established');

  const searchParams = new URLSearchParams(window.location.search);
  const payload = JSON.stringify({
    type: 'join',
    content: {
      params: Object.fromEntries(searchParams),
    },
  });
  socket.send(payload);
};

socket.onclose = () => {
  console.log('Disconnected from server');
};

socket.onmessage = (response) => {
  const { type, content } = JSON.parse(response.data);

  switch (type) {
    case 'newMessage':
      newMessage(content);
      break;
    case 'updateUserList':
      updateUserList(content);
      break;
    case 'info':
      // not doing anything with this info at the moment
      break;
    default:
      console.warn('Unknown type: ', type);
      break;
  }
};

document
  .querySelector('#message-form')
  .addEventListener('submit', function (e) {
    e.preventDefault();

    var messageTextbox = document.querySelector('[name=message]');

    const payload = JSON.stringify({
      type: 'createMessage',
      content: {
        message: messageTextbox.value,
      },
    });

    socket.send(payload);
    // TODO: maybe clear the text box on successful message creation
    messageTextbox.value = '';
  });
