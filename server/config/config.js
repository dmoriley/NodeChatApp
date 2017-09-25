var env = process.env.NODE_ENV || 'development';

if(env === 'development' || env === 'test') {
    var config = require('./config.json');
    var configObj = config[env];

    Object.keys(configObj).forEach((key) => {
        process.env[key] = configObj[key];
    });
}