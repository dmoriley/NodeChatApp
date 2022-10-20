const { Users } = require('../utils/users');
const { Rooms } = require('../utils/rooms');
const { generateMessage } = require('../utils/message');
const { isRealString, getRandomColour } = require('../utils/utils');

class WsService {
  maxPerRoom = 4;

  constructor(users, rooms) {
    this.users = users;
    this.rooms = rooms;
  }

  join(ws, content) {
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
    } else if (this.users.getUserByName(params.name)) {
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
    if (!this.rooms.roomExist(room)) {
      // create room if it doesn't exist
      this.rooms.createRoom(ws, room);
    } else if (this.rooms.getRoomLength(room) >= this.maxPerRoom) {
      ws.send({
        type: 'error',
        content: {
          message: `Room ${room} is full!`,
        },
      });
      return;
    } else {
      // room exists and theres room for another connection
      this.rooms.addConnectionToRoom(ws, room);
      ws['room'] = room;
    }
    const info = this.rooms.getWsRoomInfo(ws);
    ws.send(JSON.stringify(info));

    this.users.removeUser(ws.id);
    this.users.addUser(ws.id, params.name, room, getRandomColour());

    ws.send(
      JSON.stringify({
        type: 'newMessage',
        content: {
          message: generateMessage('Admin', 'Welcome to the chat app'),
        },
      })
    );

    this.rooms.broadcastToRoom(room, {
      type: 'updateUserList',
      content: {
        users: this.users.getUserList(room),
      },
    });

    this.rooms.broadcastToRoom(room, {
      type: 'newMessage',
      content: {
        message: generateMessage('Admin', `${params.name} has joined.`),
      },
    });
  }

  leave(ws) {
    if (!ws.room) {
      return;
    }

    const room = ws.room;
    this.rooms.removeConnectionFromRoom(ws, room);
    ws['room'] = undefined;

    const user = this.users.removeUser(ws.id);
    if (user && this.rooms.getRoomLength(room) > 0) {
      this.rooms.broadcastToRoom(room, {
        type: 'updateUserList',
        content: {
          users: this.users.getUserList(room),
        },
      });
      this.rooms.broadcastToRoom(room, {
        type: 'newMessage',
        content: {
          message: generateMessage('Admin', `${user.name} has left.`),
        },
      });
    } else if (this.rooms.getRoomLength(room) === 0) {
      this.rooms.closeRoom(room);
    }
  }

  createMessage(ws, content) {
    const { message } = content;
    const user = this.users.getUser(ws.id);
    if (user && isRealString(message)) {
      this.rooms.broadcastToRoom(user.room, {
        type: 'newMessage',
        content: {
          message: generateMessage(user.name, message, user.colour),
        },
      });
    }
  }
}

const service = new WsService(new Users(), new Rooms());

module.exports = service; // service exported as singleton
