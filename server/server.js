require('./config/config.js');
const express = require('express');
const WebSocketServer = require('ws');
const { uid } = require('uid');
const { Users } = require('./utils/users');
const { isRealString, getRandomColour } = require('./utils/utils');
const { join: pathJoin } = require('path');
const { generateMessage } = require('./utils/message');

const app = express();
const port = process.env.PORT;
const publicPath = pathJoin(__dirname, '../client/public');

// Set up a headless websocket server that prints any
// events that come in.
const wss = new WebSocketServer.Server({ noServer: true });

const maxPerRoom = 4;
// TODO: refactor to set
let rooms = {};
const users = new Users();

function getWsRoomInfo(ws) {
  // check if current ws has a room
  if (ws['room'] === undefined) {
    obj = {
      type: 'info',
      content: {
        room: ws['room'],
        noClients: rooms[ws['room']].length,
      },
    };
  } else {
    // websocket already has an associated room assigned
    obj = {
      type: 'info',
      content: {
        room: 'ws has room assigned',
      },
    };
  }
  return obj;
}

function createRoom(ws, room) {
  // const room = genKey(5);
  rooms[room] = [ws]; // add the websocket connection to the room
  ws['room'] = room;
}

function closeRoom(room) {
  if (rooms[room]) {
    delete rooms[room];
  }
}

function broadcastToRoom(room, obj) {
  for (let connection of rooms[room]) {
    connection.send(JSON.stringify(obj));
  }
}

function join(ws, content) {
  const { params } = content;
  if (!isRealString(params.name) || !isRealString(params.room)) {
    ws.send(
      JSON.stringify({
        type: 'error',
        content: {
          message: 'Name and room are required',
        },
      })
    );
    return;
  } else if (users.getUserByName(params.name)) {
    // TODO: send error to FE
    ws.send(
      JSON.stringify({
        type: 'error',
        content: {
          message: `Name ${params.name} is already in use please pick another one.`,
        },
      })
    );
    return;
  }

  const room = params.room;
  if (!Object.keys(rooms).includes(room)) {
    // create room if it doesn't exist
    createRoom(ws, room);
  } else if (rooms[room].length >= maxPerRoom) {
    ws.send({
      type: 'error',
      content: {
        message: `Room ${room} is full!`,
      },
    });
    return;
  } else {
    // room exists and theres room for another connection
    rooms[room].push(ws);
    ws['room'] = room;
  }
  const info = getWsRoomInfo(ws);
  ws.send(JSON.stringify(info));

  users.removeUser(ws.id);
  users.addUser(ws.id, params.name, room, getRandomColour());

  ws.send(
    JSON.stringify({
      type: 'newMessage',
      content: {
        message: generateMessage('Admin', 'Welcome to the chat app'),
      },
    })
  );

  broadcastToRoom(room, {
    type: 'updateUserList',
    content: {
      users: users.getUserList(room),
    },
  });

  broadcastToRoom(room, {
    type: 'newMessage',
    content: {
      message: generateMessage('Admin', `${params.name} has joined.`),
    },
  });
}

function leave(ws) {
  if (!ws.room) {
    return;
  }

  const room = ws.room;
  rooms[room] = rooms[room].filter((so) => so !== ws);
  ws['room'] = undefined;

  const user = users.removeUser(ws.id);
  if (user && rooms[room].length > 0) {
    broadcastToRoom(room, {
      type: 'updateUserList',
      content: {
        users: users.getUserList(room),
      },
    });
    broadcastToRoom(room, {
      type: 'newMessage',
      content: {
        message: generateMessage('Admin', `${user.name} has left.`),
      },
    });
  } else if (rooms[room].length === 0) {
    closeRoom(room);
  }
}

function createMessage(ws, content) {
  const { message } = content;
  const user = users.getUser(ws.id);
  if (user && isRealString(message)) {
    broadcastToRoom(user.room, {
      type: 'newMessage',
      content: {
        message: generateMessage(user.name, message, user.colour),
      },
    });
  }
}

wss.on('connection', (socket, req) => {
  socket.id = uid(); // assign unique id
  // have access to the req url if needed to get query parameters or headers
  socket.on('message', (data) => {
    const { type, content } = JSON.parse(data);
    switch (type) {
      case 'createMessage':
        createMessage(socket, content);
        break;
      case 'join':
        join(socket, content);
        break;
      default:
        console.warn('Type is unknown: ', type);
        break;
    }
  });
  socket.on('close', (data) => {
    leave(socket);
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
