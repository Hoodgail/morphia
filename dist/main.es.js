var d = Object.defineProperty;
var k = (t, e, o) => e in t ? d(t, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : t[e] = o;
var b = (t, e, o) => k(t, typeof e != "symbol" ? e + "" : e, o);
var m = /* @__PURE__ */ ((t) => (t[t.Array = 0] = "Array", t[t.Object = 1] = "Object", t[t.Number = 2] = "Number", t[t.String = 3] = "String", t[t.Bigint = 4] = "Bigint", t[t.Boolean = 5] = "Boolean", t[t.Symbol = 6] = "Symbol", t[t.Undefined = 7] = "Undefined", t[t.Function = 8] = "Function", t))(m || {});
class w {
  constructor() {
    b(this, "globalKeys", /* @__PURE__ */ new Map());
    b(this, "separator", "|");
    b(this, "arrayMarker", "@");
    b(this, "objectMarker", "&");
    b(this, "typeMarker", "#");
    b(this, "keyCounter", 0);
  }
  /**
   * Gets or creates a unique key for a given path and type.
   * @param {string} path - The path of the current item.
   * @param {string} type - The type of the current item.
   * @returns {number} The unique key for the path and type.
   * @private
   */
  getOrCreateKey(e, o) {
    let n;
    switch (o) {
      case "string":
        n = 3;
        break;
      case "number":
        n = 2;
        break;
      case "bigint":
        n = 4;
        break;
      case "boolean":
        n = 5;
        break;
      case "symbol":
        n = 6;
        break;
      case "undefined":
        n = 7;
        break;
      case "object":
        n = 1;
        break;
      case "function":
        n = 8;
        break;
      case "array":
        n = 0;
        break;
      default:
        throw new Error("Invalid type");
    }
    const r = `${e}${this.typeMarker}${n}`;
    return this.globalKeys.has(r) || this.globalKeys.set(r, this.keyCounter++), this.globalKeys.get(r);
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
    const o = [], n = [[e, "", /* @__PURE__ */ new Set()]];
    for (; n.length > 0; ) {
      const [r, a, h] = n.pop();
      if (h.has(r))
        throw new Error("Circular reference detected");
      if (Array.isArray(r)) {
        const f = this.getOrCreateKey(a, "array");
        o[f] = this.arrayMarker + r.length;
        for (let y = 0; y < r.length; y++) {
          const s = r[y], i = `${a}${a ? this.separator : ""}${this.encodeKey(y.toString())}`;
          if (this.isPrimitive(s)) {
            const l = typeof s, c = this.getOrCreateKey(i, l);
            o[c] = s;
          } else if (typeof s == "object" && s !== null) {
            const l = new Set(h);
            l.add(r), n.push([s, i, l]);
          }
        }
      } else if (typeof r == "object" && r !== null) {
        const f = this.getOrCreateKey(a, "object");
        o[f] = this.objectMarker + Object.keys(r).length;
        for (const [y, s] of Object.entries(r)) {
          const i = this.encodeKey(y), l = a ? `${a}${this.separator}${i}` : i;
          if (this.isPrimitive(s)) {
            const c = typeof s, g = this.getOrCreateKey(l, c);
            o[g] = s;
          } else if (typeof s == "object" && s !== null) {
            const c = new Set(h);
            c.add(r), n.push([s, l, c]);
          }
        }
      } else if (this.isPrimitive(r)) {
        const f = typeof r, y = this.getOrCreateKey(a, f);
        o[y] = r;
      }
    }
    return o;
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
    const o = {};
    for (const [n, r] of this.globalKeys.entries()) {
      if (r >= e.length) continue;
      const a = e[r], [h, f] = n.split(this.typeMarker), y = parseFloat(f);
      if (h.length == 0 && y == 1 && r == 0) continue;
      const s = h.split(this.separator).map(this.decodeKey.bind(this));
      let i = o;
      for (let l = 0; l < s.length; l++) {
        const c = s[l], g = l === s.length - 1;
        if (i)
          if (g)
            if (y === 0 && typeof a == "string" && a.startsWith(this.arrayMarker)) {
              const u = parseInt(a.slice(1), 10);
              i[c] = new Array(u);
            } else y === 1 && typeof a == "string" && a.startsWith(this.objectMarker) ? i[c] = {} : i[c] = a;
          else
            i[c] === void 0 && (isNaN(Number(s[l + 1])) ? i[c] = {} : i[c] = []), i = i[c];
      }
    }
    return o;
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
  w as Morphia,
  m as MorphiaType
};
