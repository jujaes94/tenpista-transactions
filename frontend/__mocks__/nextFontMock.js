// Mock for next/font/* - returns a simple CSS variable object
module.exports = new Proxy({}, {
  get: function(target, prop) {
    return function() {
      return {
        className: 'mock-font',
        variable: '--font-mock',
        style: { fontFamily: 'mock' },
      };
    };
  }
});
