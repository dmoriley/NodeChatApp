var isRealString = (str) => {
    return typeof str ==='string' && str.trim().length > 0;
};

var getRandomColour = () => {
    return "hsl(" + Math.random() * 360 + ", 100%, 75%)";
};

module.exports = {isRealString, getRandomColour};