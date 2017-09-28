const moment = require('moment');

var createdAt = 1234
var date = moment();
console.log(date.valueOf());
console.log(date.format('MMMM Do, YYYY'));
console.log(date.format('h:mm a'))