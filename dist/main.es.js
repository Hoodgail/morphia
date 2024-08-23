var g = Object.defineProperty;
var k = (t, e, i) => e in t ? g(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i;
var h = (t, e, i) => k(t, typeof e != "symbol" ? e + "" : e, i);
var m = /* @__PURE__ */ ((t) => (t[t.Array = 0] = "Array", t[t.Object = 1] = "Object", t[t.Number = 2] = "Number", t[t.String = 3] = "String", t[t.Bigint = 4] = "Bigint", t[t.Boolean = 5] = "Boolean", t[t.Symbol = 6] = "Symbol", t[t.Undefined = 7] = "Undefined", t[t.Function = 8] = "Function", t))(m || {});
class K {
  constructor() {
    h(this, "globalKeys", /* @__PURE__ */ new Map());
    h(this, "separator", "|");
    h(this, "arrayMarker", "@");
    h(this, "objectMarker", "&");
    h(this, "typeMarker", "#");
    h(this, "keyCounter", 0);
  }
  /**
   * Gets or creates a unique key for a given path and type.
   * @param {string} path - The path of the current item.
   * @param {string} type - The type of the current item.
   * @returns {number} The unique key for the path and type.
   * @private
   */
  getOrCreateKey(e, i) {
    let o;
    switch (i) {
      case "string":
        o = 3;
        break;
      case "number":
        o = 2;
        break;
      case "bigint":
        o = 4;
        break;
      case "boolean":
        o = 5;
        break;
      case "symbol":
        o = 6;
        break;
      case "undefined":
        o = 7;
        break;
      case "object":
        o = 1;
        break;
      case "function":
        o = 8;
        break;
      case "array":
        o = 0;
        break;
      default:
        throw new Error("Invalid type");
    }
    const r = `${e}${this.typeMarker}${o}`;
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
    const i = [], o = [[e, "", /* @__PURE__ */ new Set()]];
    for (; o.length > 0; ) {
      const [r, n, b] = o.pop();
      if (b.has(r))
        throw new Error("Circular reference detected");
      if (Array.isArray(r)) {
        const f = this.getOrCreateKey(n, "array");
        i[f] = this.arrayMarker + r.length;
        for (let l = 0; l < r.length; l++) {
          const s = r[l], a = `${n}${n ? this.separator : ""}${this.encodeKey(l.toString())}`;
          if (this.isPrimitive(s)) {
            const y = typeof s, c = this.getOrCreateKey(a, y);
            i[c] = s;
          } else if (typeof s == "object" && s !== null) {
            const y = new Set(b);
            y.add(r), o.push([s, a, y]);
          }
        }
      } else if (typeof r == "object" && r !== null) {
        const f = this.getOrCreateKey(n, "object");
        i[f] = this.objectMarker + Object.keys(r).length;
        for (const [l, s] of Object.entries(r)) {
          const a = this.encodeKey(l), y = n ? `${n}${this.separator}${a}` : a;
          if (this.isPrimitive(s)) {
            const c = typeof s, u = this.getOrCreateKey(y, c);
            i[u] = s;
          } else if (typeof s == "object" && s !== null) {
            const c = new Set(b);
            c.add(r), o.push([s, y, c]);
          }
        }
      } else if (this.isPrimitive(r)) {
        const f = typeof r, l = this.getOrCreateKey(n, f);
        i[l] = r;
      }
    }
    return i;
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
    const i = {};
    for (const [o, r] of this.globalKeys.entries()) {
      if (r >= e.length) continue;
      const n = e[r], [b, f] = o.split(this.typeMarker), l = parseFloat(f);
      if (b.length == 0 && l == 1 && r == 0) continue;
      const s = b.split(this.separator).map(this.decodeKey.bind(this));
      let a = i;
      for (let y = 0; y < s.length; y++) {
        const c = s[y], u = y === s.length - 1;
        if (a)
          if (u)
            if (l === 0 && typeof n == "string" && n.startsWith(this.arrayMarker)) {
              const d = parseInt(n.slice(1), 10);
              a[c] = new Array(d);
            } else if (l === 1 && typeof n == "string" && n.startsWith(this.objectMarker))
              a[c] = {};
            else if (l == 7) {
              if (n !== null) throw new Error(`Invalid value for undefined: ${n}, received type ${typeof n}`);
              a[c] = void 0;
            } else {
              if (n === void 0 || n === null && l !== 1) continue;
              a[c] = n;
            }
          else
            a[c] === void 0 && (isNaN(Number(s[y + 1])) ? a[c] = {} : a[c] = []), a = a[c];
      }
    }
    return i;
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
  K as Morphia,
  m as MorphiaType
};
