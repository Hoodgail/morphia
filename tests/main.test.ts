import { expect, test, describe, beforeEach, afterAll } from "bun:test";
import { Morphia } from "../src";

describe("Morphia", () => {
     let morphia: Morphia;

     beforeEach(() => {
          morphia = new Morphia();
     });

     describe("toArray", () => {
          test("should convert a simple object to an array", () => {
               const input = { name: "John", age: 30 };
               const result = morphia.toArray(input);
               expect(result).toEqual(expect.arrayContaining(["John", 30]));
               expect(result.length).toBeGreaterThan(2); // Account for metadata
          });

          test("should handle nested objects", () => {
               const input = { user: { name: "Alice", details: { age: 25 } } };
               const result = morphia.toArray(input);
               expect(result).toEqual(expect.arrayContaining(["Alice", 25]));
          });

          test("should handle undefined values", () => {
               const input = { name: "John", age: 30, address: undefined, phone: null };
               const result = morphia.toArray(input);
               expect(result).toEqual(expect.arrayContaining(["John", 30, undefined, null]));
          });

          test("should handle arrays", () => {
               const input = { colors: ["red", "green", "blue"] };
               const result = morphia.toArray(input);
               expect(result).toEqual(expect.arrayContaining(["red", "green", "blue"]));
          });

          test("should handle mixed types", () => {
               const input = {
                    name: "Bob",
                    age: 40,
                    isActive: true,
                    scores: [85, 90, 95],
                    address: { city: "New York", zip: "10001" }
               };
               const result = morphia.toArray(input);
               expect(result).toEqual(expect.arrayContaining([
                    "Bob", 40, true, 85, 90, 95, "New York", "10001"
               ]));
          });
     });

     describe("fromArray", () => {
          test("should reconstruct a simple object from an array", () => {
               const input = morphia.toArray({ name: "John", age: 30 });
               const result = morphia.fromArray(input);
               expect(result).toEqual({ name: "John", age: 30 });
          });

          test("should reconstruct nested objects", () => {
               const original = { user: { name: "Alice", details: { age: 25 } } };
               const input = morphia.toArray(original);
               const result = morphia.fromArray(input);
               expect(result).toEqual(original);
          });

          test("should reconstruct arrays", () => {
               const original = { colors: ["red", "green", "blue"] };
               const input = morphia.toArray(original);
               const result = morphia.fromArray(input);
               expect(result).toEqual(original);
          });

          test("should reconstruct mixed types", () => {
               const original = {
                    name: "Bob",
                    age: 40,
                    isActive: true,
                    scores: [85, 90, 95],
                    address: { city: "New York", zip: "10001" }
               };
               const input = morphia.toArray(original);
               const result = morphia.fromArray(input);
               expect(result).toEqual(original);
          });
     });

     describe("keys", () => {
          test("should return the current key-index mapping", () => {
               morphia.toArray({ name: "John", age: 30 });
               const keys = morphia.keys;
               expect(keys).toBeInstanceOf(Object);
               expect(Object.keys(keys).length).toBeGreaterThan(0);
          });

          test("should allow setting a new key-index mapping", () => {
               const newKeys = { "name#string": 0, "age#number": 1 };
               morphia.keys = newKeys;
               expect(morphia.keys).toEqual(newKeys);
          });
     });

     describe("Error handling", () => {
          test("should handle circular references", () => {

               const circular: any = { name: "Circular" };
               circular.self = circular;

               expect(() => morphia.toArray(circular)).toThrowError();
          });

          test("should handle invalid input in fromArray", () => {

               expect(() => morphia.fromArray(["invalid", "input"])).toThrow();
          });
     });

     afterAll(() => {
          console.log("All tests completed");
          process.exit(0);
     });

     describe("Performance", () => {
          test("should handle large objects efficiently", () => {
               const largeObject: any = {};
               for (let i = 0; i < 10000; i++) {
                    largeObject[`key${i}`] = `value${i}`;
               }

               const start = performance.now();
               const array = morphia.toArray(largeObject);
               const reconstructed = morphia.fromArray(array);
               const end = performance.now();

               expect(reconstructed).toEqual(largeObject);
               expect(end - start).toBeLessThan(1000); // Assuming less than 1 second for 10,000 items
          });
     });
});