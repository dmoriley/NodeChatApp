const moment = require('moment');

var generateMessage = (from, text,colour) => {
    return{from,text,createdAt:moment().valueOf(),colour};
};

var generateLocationMessage = (from, lat, long,colour) => {
    return{
        from,
        url: `https://www.google.com/maps?q=${lat},${long}`,
        createdAt: moment().valueOf(),
        colour
    }
};

module.exports = {generateMessage, generateLocationMessage};