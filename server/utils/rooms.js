class Rooms {
  constructor() {
    // TODO: refactor to set
    this.rooms = {};
  }

  /**
   * Create a new room
   * @param {WebSocket} ws Websocket initially attached to the room
   * @param {String} roomId Id for the room
   */
  createRoom(ws, roomId) {
    this.rooms[roomId] = [ws];
    ws['room'] = roomId;
  }

  /**
   * Close a room
   * @param {String} roomId Id of room to close
   */
  closeRoom(roomId) {
    if (this.rooms[roomId]) {
      delete this.rooms[roomId];
    }
  }

  /**
   * Broadcast a message to every websocket in the room associated with the room id
   * @param {String} roomId Id of room
   * @param {any} obj obj to broadcast
   */
  broadcastToRoom(roomId, obj) {
    for (let connection of this.rooms[roomId]) {
      connection.send(JSON.stringify(obj));
    }
  }

  /**
   * Remove a websocket connection from a room
   * @param {WebSocket} ws
   * @param {String} roomId
   */
  removeConnectionFromRoom(ws, roomId) {
    if (this.roomExist(roomId)) {
      this.rooms[roomId] = this.rooms[roomId].filter((so) => so !== ws);
    }
  }

  addConnectionToRoom(ws, roomId) {
    if (this.roomExist(roomId)) {
      this.rooms[roomId].push(ws);
    }
  }

  /**
   * Get the number of participants in a room
   * @param {String} roomId
   * @returns Length of the room
   */
  getRoomLength(roomId) {
    return this.rooms[roomId].length;
  }

  /**
   * Check if a room exists
   * @param {String} roomId
   * @returns boolean
   */
  roomExist(roomId) {
    return roomId in this.rooms;
  }

  /**
   * Get the room info of the room associated with the passed websocket
   * @param {WebSocket} ws
   * @returns Info object ready to be sent
   */
  getWsRoomInfo(ws) {
    let obj;
    // check if current ws has a room
    if (ws['room'] === undefined) {
      obj = {
        type: 'info',
        content: {
          room: ws['room'],
          noClients: this.rooms[ws['room']].length,
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
}

module.exports = { Rooms };
