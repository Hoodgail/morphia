# Morphia

[![npm version](https://img.shields.io/npm/v/morphia.svg)](https://www.npmjs.com/package/morphia)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Morphia is a lightweight TypeScript library for converting complex objects to and from array representations. It provides an efficient way to serialize and deserialize nested data structures, making it useful for data storage, transmission, and manipulation.

## Installation

You can install Morphia using npm:

```bash
npm install morphia
```

## Usage

### Basic Example

```typescript
import { Morphia } from "morphia";

const morphia = new Morphia();

// Original object
const originalObject = {
  name: "John Doe",
  age: 30,
  hobbies: ["reading", "cycling"],
  address: {
    street: "123 Main St",
    city: "Anytown",
  },
};

// Convert to array
const arrayRepresentation = morphia.toArray(originalObject);
console.log(arrayRepresentation);
// Output: [6, '&2', 'John Doe', 30, '@2', 'reading', 'cycling', '&2', '123 Main St', 'Anytown']

// Convert back to object
const reconstructedObject = morphia.fromArray(arrayRepresentation);
console.log(reconstructedObject);
// Output: { name: 'John Doe', age: 30, hobbies: [ 'reading', 'cycling' ], address: { street: '123 Main St', city: 'Anytown' } }
```

### Advanced Usage

Morphia can handle complex nested structures and preserves the structure of your data:

```typescript
import { isEqual } from "lodash"; // or use another deep equality function

const complexObject = {
  users: [
    { id: 1, name: "Alice", roles: ["admin", "user"] },
    { id: 2, name: "Bob", roles: ["user"] },
  ],
  settings: {
    theme: "dark",
    notifications: {
      email: true,
      push: false,
    },
  },
};

const arrayForm = morphia.toArray(complexObject);
const reconstructed = morphia.fromArray(arrayForm);

// Note: Using JSON.stringify for comparison may give false negatives due to object key ordering
// Instead, use a deep equality function for accurate comparison
console.log(isEqual(complexObject, reconstructed)); // true
```

**Important Note**: When converting objects to arrays and back, the order of properties in the resulting object may differ from the original. This is because JavaScript objects do not guarantee property order. For example:

```typescript
const obj1 = { a: 1, b: 2 };
const array = morphia.toArray(obj1);
const obj2 = morphia.fromArray(array);

console.log(obj2); // Might output: { b: 2, a: 1 }
```

While the content is the same, the order of properties may change. Always use a deep equality function (like `lodash.isEqual`) for comparing objects, rather than comparing stringified versions.

## API Reference

### `Morphia`

The main class for converting objects to and from array representations.

#### Methods

- `toArray<Input>(input: Input): Flatten<Input>[]`
  Converts a complex object to an array representation.

- `fromArray(input: Primitive[]): any`
  Converts an array representation back to its original complex object form.

- `get keys(): Record<string, number>`
  Gets the current mapping of keys to their indices.

- `set keys(newKeys: Record<string, number>)`
  Sets a new mapping of keys to their indices.

## Why Morphia?

- **Efficient Serialization**: Morphia provides a compact array representation of complex objects, which can be useful for storage or transmission.
- **Type Safety**: Written in TypeScript, Morphia provides type safety and autocompletion in supported IDEs.
- **Preservation of Structure**: Morphia accurately preserves the structure of your data, including nested objects and arrays.
- **Customizable**: The key-to-index mapping can be customized and reused for consistent serialization across multiple objects.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue on the [GitHub repository](https://github.com/Hoodgail/morphia/issues).
