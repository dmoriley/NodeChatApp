var generateMessage = (from, text, colour) => {
  return { from, text, createdAt: Date.now(), colour };
};

module.exports = { generateMessage };
