const expect = require('expect');

const {Users} = require('./users');

describe('Users', () => {
    var users;

    beforeEach(() => {
        users = new Users();
        users.users = [{
            id:'1',
            name:'David',
            room:'balls'
        },{
            id:'2',
            name:'Jen',
            room:'cars'
        },{
            id:'3',
            name:'Brian',
            room:'balls'
        }]
    });

    it('should addnew user', () => {
        var users = new Users();
        var user = {
            id: 123,
            name: 'david',
            room: 'ballislife'
        };
        var resUser = users.addUser(user.id,user.name,user.room);

        expect(users.users).toEqual([user]);
    });

    it('should return name for course balls', () => {
        var userList = users.getUserList('balls');
        expect(userList).toEqual(['David', 'Brian'])
    });

    it('should return name for course cars', () => {
        var userList = users.getUserList('cars');
        expect(userList).toEqual(['Jen'])
    });

    it('should remove a user', () => {
        var toRemove = users.users[0];
        expect(users.removeUser(toRemove.id)).toEqual(toRemove);
        expect(users.users.length).toBe(2);
    });

    it('should not remove user', () => {
        expect(users.removeUser(54)).toBeFalsy();
        expect(users.users.length).toBe(3);
    });
    
    it('should find user', () => {
        var user = users.users[0];
        expect(users.getUser(user.id)).toEqual(user);
    });

    it('should not find user', () => {
        expect(users.getUser(55)).toBeFalsy();
    });

    it('should find user by name', () => {
        var user = users.users[0];
        expect(users.getUserByName(user.name)).toEqual(user);
    });

    it('should not find user by name', () => {
        expect(users.getUserByName("Jimmy")).toBeFalsy();
    });
})