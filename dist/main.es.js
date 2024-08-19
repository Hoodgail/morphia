var d = Object.defineProperty;
var u = (p, e, s) => e in p ? d(p, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : p[e] = s;
var l = (p, e, s) => u(p, typeof e != "symbol" ? e + "" : e, s);
class k {
  constructor() {
    l(this, "globalKeys", /* @__PURE__ */ new Map());
    l(this, "separator", "|");
    l(this, "arrayMarker", "@");
    l(this, "objectMarker", "&");
    l(this, "typeMarker", "#");
    l(this, "keyCounter", 0);
  }
  /**
   * Gets or creates a unique key for a given path and type.
   * @param {string} path - The path of the current item.
   * @param {string} type - The type of the current item.
   * @returns {number} The unique key for the path and type.
   * @private
   */
  getOrCreateKey(e, s) {
    const y = `${e}${this.typeMarker}${s}`;
    return this.globalKeys.has(y) || this.globalKeys.set(y, this.keyCounter++), this.globalKeys.get(y);
  }
  /**
   * Encodes a key to handle special characters.
   * @param {string} key - The key to encode.
   * @returns {string} The encoded key.
   * @private
   */
  encodeKey(e) {
    return encodeURIComponent(e);
  }
  /**
   * Decodes an encoded key.
   * @param {string} encodedKey - The encoded key to decode.
   * @returns {string} The decoded key.
   * @private
   */
  decodeKey(e) {
    return decodeURIComponent(e);
  }
  /**
   * Converts a complex object to an array representation.
   * @param {Input} input - The input object to convert.
   * @throws {Error} If a circular reference is detected.
   * @returns {Flatten<Input>[]} The array representation of the input.
   * @public
   */
  toArray(e) {
    const s = [], y = [[e, "", /* @__PURE__ */ new Set()]];
    for (; y.length > 0; ) {
      const [r, n, f] = y.pop();
      if (f.has(r))
        throw new Error("Circular reference detected");
      if (Array.isArray(r)) {
        const c = this.getOrCreateKey(n, "array");
        s[c] = this.arrayMarker + r.length;
        for (let i = 0; i < r.length; i++) {
          const t = r[i], a = `${n}${n ? this.separator : ""}${this.encodeKey(i.toString())}`;
          if (this.isPrimitive(t)) {
            const o = typeof t, h = this.getOrCreateKey(a, o);
            s[h] = t;
          } else if (typeof t == "object" && t !== null) {
            const o = new Set(f);
            o.add(r), y.push([t, a, o]);
          }
        }
      } else if (typeof r == "object" && r !== null) {
        const c = this.getOrCreateKey(n, "object");
        s[c] = this.objectMarker + Object.keys(r).length;
        for (const [i, t] of Object.entries(r)) {
          const a = this.encodeKey(i), o = n ? `${n}${this.separator}${a}` : a;
          if (this.isPrimitive(t)) {
            const h = typeof t, g = this.getOrCreateKey(o, h);
            s[g] = t;
          } else if (typeof t == "object" && t !== null) {
            const h = new Set(f);
            h.add(r), y.push([t, o, h]);
          }
        }
      } else if (this.isPrimitive(r)) {
        const c = typeof r, i = this.getOrCreateKey(n, c);
        s[i] = r;
      }
    }
    return s;
  }
  /**
   * Converts an array representation back to its original complex object form.
   * @param {ArrayOutput} input - The array representation to convert.
   * @returns {any} The reconstructed complex object.
   * @public
   */
  fromArray(e) {
    if (e.length == 0) throw new Error("Empty array input");
    if (this.globalKeys.size == 0) throw new Error("No keys found");
    const s = {};
    for (const [y, r] of this.globalKeys.entries()) {
      if (r >= e.length) continue;
      const n = e[r], [f, c] = y.split(this.typeMarker);
      if (f.length == 0 && c == "object" && r == 0) continue;
      const i = f.split(this.separator).map(this.decodeKey.bind(this));
      let t = s;
      for (let a = 0; a < i.length; a++) {
        const o = i[a], h = a === i.length - 1;
        if (t)
          if (h)
            if (c === "array" && typeof n == "string" && n.startsWith(this.arrayMarker)) {
              const g = parseInt(n.slice(1), 10);
              t[o] = new Array(g);
            } else c === "object" && typeof n == "string" && n.startsWith(this.objectMarker) ? t[o] = {} : t[o] = n;
          else
            t[o] === void 0 && (isNaN(Number(i[a + 1])) ? t[o] = {} : t[o] = []), t = t[o];
      }
    }
    return s;
  }
  /**
   * Gets the current mapping of keys to their indices.
   * @returns {Record<string, number>} The current key-index mapping.
   * @public
   */
  get keys() {
    return Object.fromEntries(this.globalKeys);
  }
  /**
   * Sets a new mapping of keys to their indices.
   * @param {Record<string, number>} newKeys - The new key-index mapping to set.
   * @public
   */
  set keys(e) {
    this.globalKeys = new Map(Object.entries(e)), this.keyCounter = Math.max(...Object.values(e)) + 1;
  }
  /**
   * Checks if a value is a primitive type.
   * @param {any} value - The value to check.
   * @returns {boolean} True if the value is a primitive, false otherwise.
   * @private
   */
  isPrimitive(e) {
    return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || e === null || e === void 0;
  }
}
export {
  k as Morphia
};
