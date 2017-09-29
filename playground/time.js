const moment = require('moment');

var createdAt = 1234
var date = moment('2:35 am', 'h:mm a');
date.add(1.5,'minutes');
console.log(date.valueOf());
console.log(date.format('MMMM Do, YYYY'));
console.log(date.format('h:mm a'))

