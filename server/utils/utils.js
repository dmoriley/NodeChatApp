const isRealString = (str) => {
  return typeof str === 'string' && str.trim().length > 0;
};

const getRandomColour = () => {
  return 'hsl(' + Math.random() * 360 + ', 100%, 75%)';
};

module.exports = { isRealString, getRandomColour };
