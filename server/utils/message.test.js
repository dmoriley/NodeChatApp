var expect = require('expect');

var {generateMessage, generateLocationMessage} = require('./message');

describe('generateMessage', () => {
    it('should generate correct message object', () => {
        var text = "Get me some food",
        from = "David";
        var theMessage = generateMessage(from,text);
        
        expect(typeof theMessage.createdAt).toBe('number');
        expect(theMessage).toMatchObject({from,text});
    })
});

describe('generateLocationMessage', () => {
    it('should generate correct location object', () => {
        var from = "david",
            lat = 2,
            long = 3,
            url = `https://www.google.com/maps?q=${lat},${long}`,
            theMessage = generateLocationMessage(from,lat,long);
        
        expect(typeof theMessage.createdAt).toBe('number');
        expect(theMessage).toMatchObject({from,url});
    });
});
