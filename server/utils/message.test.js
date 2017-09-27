var expect = require('expect');

var {generateMessage} = require('./message');

describe('generateMessage', () => {
    it('should generate correct message object', () => {
        var text = "Get me some food",
        from = "David";
        var theMessage = generateMessage(from,text);
        
        expect(typeof theMessage.createdAt).toBe('number');
        expect(theMessage).toMatchObject({from,text});
    })
});
