/* eslint-disable no-bitwise */

declare const global: {
  RN$Bridgeless?: boolean;
  __turboModuleProxy?: unknown;
};

export const isTurboModuleEnabled = global.RN$Bridgeless || global.__turboModuleProxy != null;

export const generateUUID = (function () {
  function hex8(n: number) {
    return ((n >>> 0) + 4294967296).toString(16).substring(1).toUpperCase();
  }

  // state (a is always initialized to odd value, so state is never 0)
  var a = (Math.random() * 4294967296) | 1,
    b = (Math.random() * 4294967296) | 0,
    c = (Date.now() / 4294967296) ^ (Math.random() * 4294967296),
    d = Date.now() ^ (Math.random() * 4294967296);

  // four applications of xorshift128
  var f = function () {
    var t = d | 0;
    t ^= t << 11;
    t ^= t >>> 8;
    d = t ^ a ^ (a >>> 19);
    t = c | 0;
    t ^= t << 11;
    t ^= t >>> 8;
    c = t ^ d ^ (d >>> 19);
    t = b | 0;
    t ^= t << 11;
    t ^= t >>> 8;
    b = t ^ c ^ (c >>> 19);
    t = a | 0;
    t ^= t << 11;
    t ^= t >>> 8;
    a = t ^ b ^ (b >>> 19);
    return (
      hex8(a) +
      '-' +
      hex8(b).substring(0, 4) +
      '-' +
      hex8(b).substring(4) +
      '-' +
      hex8(c).substring(0, 4) +
      '-' +
      hex8(c).substring(4) +
      hex8(d)
    );
  };

  // mix initial state - not strictly necessary
  f();
  f();
  f();
  f();

  return f;
})();
