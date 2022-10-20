class Users {
  // TODO: refactor to use Set class
  constructor() {
    this.users = new Map();
  }

  addUser(id, name, room, colour) {
    var user = { id, name, room, colour };
    this.users.set(id, user);
    return user;
  }

  removeUser(id) {
    var user = this.getUser(id);
    if (user) {
      this.users.delete(id);
    }
    return user;
  }

  getUser(id) {
    return this.users.get(id);
  }

  getUserByName(name) {
    return Array.from(this.users.values()).filter(
      (user) => user.name === name
    )[0];
  }

  getUserList(room) {
    var users = Array.from(this.users.values()).filter(
      (user) => user.room === room
    );
    var namesArray = users.map((user) => user.name);
    return namesArray;
  }
}

module.exports = { Users };
