type Primitive = string | number | boolean | null | undefined;
type FlattenedValuesTuple<T> = T extends Primitive ? [T] : T extends (infer U)[] ? FlattenArray<U> : T extends object ? FlattenObject<T> : never;
type FlattenArray<T> = T extends [infer First, ...infer Rest] ? [...FlattenedValuesTuple<First>, ...FlattenArray<Rest>] : T extends Primitive ? [T] : T extends object ? FlattenObject<T> : [];
type FlattenObject<T> = T extends object ? {
    [K in keyof T]: FlattenedValuesTuple<T[K]>;
}[keyof T] extends infer U ? U extends any[] ? U : never : never : never;
type Flatten<T> = FlattenedValuesTuple<T> extends (infer U)[] ? U : never;
/**
 * Morphia class for converting complex objects to and from arrays.
 */
export declare class Morphia {
    private globalKeys;
    private separator;
    private arrayMarker;
    private objectMarker;
    private typeMarker;
    private keyCounter;
    /**
     * Gets or creates a unique key for a given path and type.
     * @param {string} path - The path of the current item.
     * @param {string} type - The type of the current item.
     * @returns {number} The unique key for the path and type.
     * @private
     */
    private getOrCreateKey;
    /**
     * Encodes a key to handle special characters.
     * @param {string} key - The key to encode.
     * @returns {string} The encoded key.
     * @private
     */
    private encodeKey;
    /**
     * Decodes an encoded key.
     * @param {string} encodedKey - The encoded key to decode.
     * @returns {string} The decoded key.
     * @private
     */
    private decodeKey;
    /**
     * Converts a complex object to an array representation.
     * @param {Input} input - The input object to convert.
     * @throws {Error} If a circular reference is detected.
     * @returns {Flatten<Input>[]} The array representation of the input.
     * @public
     */
    toArray<Input>(input: Input): Flatten<Input>[];
    /**
     * Converts an array representation back to its original complex object form.
     * @param {ArrayOutput} input - The array representation to convert.
     * @returns {any} The reconstructed complex object.
     * @public
     */
    fromArray(input: Primitive[]): any;
    /**
     * Gets the current mapping of keys to their indices.
     * @returns {Record<string, number>} The current key-index mapping.
     * @public
     */
    get keys(): Record<string, number>;
    /**
     * Sets a new mapping of keys to their indices.
     * @param {Record<string, number>} newKeys - The new key-index mapping to set.
     * @public
     */
    set keys(newKeys: Record<string, number>);
    /**
     * Checks if a value is a primitive type.
     * @param {any} value - The value to check.
     * @returns {boolean} True if the value is a primitive, false otherwise.
     * @private
     */
    private isPrimitive;
}
export {};
