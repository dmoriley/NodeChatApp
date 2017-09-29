
class Users {
    constructor() {
        this.users = [];
    }

    addUser(id, name, room, colour) {
        var user = {id,name,room,colour};
        this.users.push(user);
        return user;
    }

    removeUser(id) {
        var user = this.getUser(id);
        if(user) {
            this.users.splice(this.users.indexOf(user),1);
        }
        return user;
    }

    getUser(id) {
        return this.users.filter((user) => user.id === id)[0];
    }

    getUserByName(name) {
        return this.users.filter((user) => user.name === name)[0];
    }


    getUserList(room) {
        var users = this.users.filter((user) => user.room === room);
        var namesArray = users.map((user) => user.name);
        return namesArray;
    }
}

module.exports = {Users};