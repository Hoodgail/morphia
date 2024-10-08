type Primitive = string | number | boolean | null | undefined;

type FlattenedValuesTuple<T> = T extends Primitive
     ? [T]
     : T extends (infer U)[]
     ? FlattenArray<U>
     : T extends object
     ? FlattenObject<T>
     : never;

type FlattenArray<T> = T extends [infer First, ...infer Rest]
     ? [...FlattenedValuesTuple<First>, ...FlattenArray<Rest>]
     : T extends Primitive
     ? [T]
     : T extends object
     ? FlattenObject<T>
     : [];

type FlattenObject<T> = T extends object
     ? { [K in keyof T]: FlattenedValuesTuple<T[K]> }[keyof T] extends infer U
     ? U extends any[]
     ? U
     : never
     : never
     : never;

type Flatten<T> = FlattenedValuesTuple<T> extends (infer U)[] ? U : never;

export enum MorphiaType {
     Array,
     Object,
     Number,
     String,
     Bigint,
     Boolean,
     Symbol,
     Undefined,
     Function
}


/**
 * Morphia class for converting complex objects to and from arrays.
 */
export class Morphia {
     private globalKeys: Map<string, number> = new Map();
     private separator: string = '|';
     private arrayMarker: string = '@';
     private objectMarker: string = '&';
     private typeMarker: string = '#';
     private keyCounter: number = 0;

     /**
      * Gets or creates a unique key for a given path and type.
      * @param {string} path - The path of the current item.
      * @param {string} type - The type of the current item.
      * @returns {number} The unique key for the path and type.
      * @private
      */
     private getOrCreateKey(path: string, type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array"): number {

          let typeEnum: MorphiaType;

          switch (type) {
               case "string":
                    typeEnum = MorphiaType.String;
                    break;
               case "number":
                    typeEnum = MorphiaType.Number;
                    break;
               case "bigint":
                    typeEnum = MorphiaType.Bigint;
                    break;
               case "boolean":
                    typeEnum = MorphiaType.Boolean;
                    break;
               case "symbol":
                    typeEnum = MorphiaType.Symbol;
                    break;
               case "undefined":
                    typeEnum = MorphiaType.Undefined;
                    break;
               case "object":
                    typeEnum = MorphiaType.Object;
                    break;
               case "function":
                    typeEnum = MorphiaType.Function;
                    break;
               case "array":
                    typeEnum = MorphiaType.Array;
                    break;
               default:
                    throw new Error("Invalid type");
          }

          const keyWithType = `${path}${this.typeMarker}${typeEnum}`;
          if (!this.globalKeys.has(keyWithType)) {
               // Assign a new unique key if it doesn't exist
               this.globalKeys.set(keyWithType, this.keyCounter++);
          }
          return this.globalKeys.get(keyWithType)!;
     }

     /**
      * Encodes a key to handle special characters.
      * @param {string} key - The key to encode.
      * @returns {string} The encoded key.
      * @private
      */
     private encodeKey(key: string): string {
          return encodeURIComponent(key);
     }

     /**
      * Decodes an encoded key.
      * @param {string} encodedKey - The encoded key to decode.
      * @returns {string} The decoded key.
      * @private
      */
     private decodeKey(encodedKey: string): string {
          return decodeURIComponent(encodedKey);
     }

     /**
      * Converts a complex object to an array representation.
      * @param {Input} input - The input object to convert.
      * @throws {Error} If a circular reference is detected.
      * @returns {Flatten<Input>[]} The array representation of the input.
      * @public
      */
     public toArray<Input>(input: Input): Flatten<Input>[] {
          const result: Flatten<Input>[] = [];
          const stack: [any, string, Set<any>][] = [[input, '', new Set()]];

          while (stack.length > 0) {
               const [item, path, ancestors] = stack.pop()!;

               if (ancestors.has(item)) {

                    throw new Error("Circular reference detected");
               }

               if (Array.isArray(item)) {
                    // Handle array items
                    const keyIndex = this.getOrCreateKey(path, 'array');
                    result[keyIndex] = this.arrayMarker + item.length as any;
                    for (let i = 0; i < item.length; i++) {
                         const value = item[i];
                         const newPath = `${path}${path ? this.separator : ''}${this.encodeKey(i.toString())}`;
                         if (this.isPrimitive(value)) {
                              // Store primitive values directly
                              const type = typeof value;
                              const valueKeyIndex = this.getOrCreateKey(newPath, type);
                              result[valueKeyIndex] = value as Flatten<Input>;
                         } else if (typeof value === 'object' && value !== null) {
                              // Push non-primitive values to the stack for further processing
                              const newAncestors = new Set(ancestors);
                              newAncestors.add(item);
                              stack.push([value, newPath, newAncestors]);
                         }
                    }
               } else if (typeof item === 'object' && item !== null) {
                    // Handle object items
                    const keyIndex = this.getOrCreateKey(path, 'object');
                    result[keyIndex] = this.objectMarker + Object.keys(item).length as any;
                    for (const [key, value] of Object.entries(item)) {
                         const encodedKey = this.encodeKey(key);
                         const newPath = path ? `${path}${this.separator}${encodedKey}` : encodedKey;
                         if (this.isPrimitive(value)) {
                              // Store primitive values directly
                              const type = typeof value;
                              const valueKeyIndex = this.getOrCreateKey(newPath, type);
                              result[valueKeyIndex] = value as Flatten<Input>;
                         } else if (typeof value === 'object' && value !== null) {
                              // Push non-primitive values to the stack for further processing
                              const newAncestors = new Set(ancestors);
                              newAncestors.add(item);
                              stack.push([value, newPath, newAncestors]);
                         }
                    }
               } else if (this.isPrimitive(item)) {
                    // Handle primitive items
                    const type = typeof item;
                    const keyIndex = this.getOrCreateKey(path, type);
                    result[keyIndex] = item as Flatten<Input>;
               }
          }

          return result;
     }

     /**
      * Converts an array representation back to its original complex object form.
      * @param {ArrayOutput} input - The array representation to convert.
      * @returns {any} The reconstructed complex object.
      * @public
      */
     public fromArray(input: Primitive[]): any {

          if (input.length == 0) throw new Error("Empty array input");

          if (this.globalKeys.size == 0) throw new Error("No keys found");

          const result: any = {};

          for (const [pathWithType, index] of this.globalKeys.entries()) {
               if (index >= input.length) continue;
               const value = input[index];
               const [path, typeString] = pathWithType.split(this.typeMarker);

               const type = parseFloat(typeString) as MorphiaType;

               // Skip the root object
               if (path.length == 0 && type == MorphiaType.Object && index == 0) continue;

               const parts = path.split(this.separator).map(this.decodeKey.bind(this));
               let current = result;

               for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    const isLastPart = i === parts.length - 1;

                    if (!current) continue;

                    if (isLastPart) {
                         if (type === MorphiaType.Array && typeof value === 'string' && value.startsWith(this.arrayMarker)) {
                              // Create an empty array with the correct length
                              const arrayLength = parseInt(value.slice(1), 10);
                              current[part] = new Array(arrayLength);
                         } else if (type === MorphiaType.Object && typeof value === 'string' && value.startsWith(this.objectMarker)) {
                              // Create an empty object
                              current[part] = {};
                         } else {
                              // Assign the value directly for primitives and undefined
                              if (type == MorphiaType.Undefined) {

                                   if (value !== null) throw new Error(`Invalid value for undefined: ${value}, received type ${typeof value}`);

                                   current[part] = undefined;

                              } else {

                                   // If value is undefined, the type should have also been undefined, that means this property never existed in the original object of this array.
                                   if (value === undefined) continue;

                                   // If value is null, the type should have also been object, that means this property was added to the original object of this array.
                                   if (value === null && type !== MorphiaType.Object) continue;

                                   current[part] = value;

                              }
                         }
                    } else {
                         // Create nested structures as needed
                         if (current[part] === undefined) {
                              if (isNaN(Number(parts[i + 1]))) {
                                   current[part] = {};
                              } else {
                                   current[part] = [];
                              }
                         }
                         current = current[part];
                    }
               }
          }

          return result;
     }

     /**
      * Gets the current mapping of keys to their indices.
      * @returns {Record<string, number>} The current key-index mapping.
      * @public
      */
     public get keys(): Record<string, number> {
          return Object.fromEntries(this.globalKeys);
     }

     /**
      * Sets a new mapping of keys to their indices.
      * @param {Record<string, number>} newKeys - The new key-index mapping to set.
      * @public
      */
     public set keys(newKeys: Record<string, number>) {
          this.globalKeys = new Map(Object.entries(newKeys));
          this.keyCounter = Math.max(...Object.values(newKeys)) + 1;
     }

     /**
      * Checks if a value is a primitive type.
      * @param {any} value - The value to check.
      * @returns {boolean} True if the value is a primitive, false otherwise.
      * @private
      */
     private isPrimitive(value: any): value is Primitive {
          return (
               typeof value === 'string' ||
               typeof value === 'number' ||
               typeof value === 'boolean' ||
               value === null ||
               value === undefined
          );
     }
}