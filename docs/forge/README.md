# ForgeHive Documentation

Welcome to the ForgeHive documentation! This directory contains comprehensive documentation for the ForgeHive libraries.

## Libraries

### Schema Library

The [Schema Library](./schema.md) provides a powerful, type-safe way to define data structures and validate data against those structures. It's built on top of [Zod](https://github.com/colinhacks/zod) and provides a simplified, consistent API for schema definition and validation.

Key features:
- Type-safe schema definitions
- Comprehensive validation options
- TypeScript type inference
- Integration with the Task library

[Read the Schema documentation](./schema.md)

### Task Library

The [Task Library](./task.md) provides a powerful, type-safe way to define and execute tasks with input validation, boundary separation, and execution tracking. It's designed to work seamlessly with the Schema library for input validation.

Key features:
- Input validation using schemas
- Boundary separation for better testability
- Execution modes (proxy, replay, etc.)
- Listener support for tracking task execution

[Read the Task documentation](./task.md)

## Testing Documentation

### Testing with Boundary Mocks

The [Testing with Boundary Mocks](./testing-with-boundary-mocks.md) guide provides a comprehensive overview of how to effectively test Forge tasks using the boundary mocking mechanism.

Key topics:
- Setting up test utilities
- Basic and advanced mocking techniques
- Testing error handling
- Best practices and troubleshooting

[Read the Testing with Boundary Mocks guide](./testing-with-boundary-mocks.md)

### Boundary Mocking Utilities

The [Boundary Mocking Utilities](./boundary-mocking-utils.md) documentation provides detailed information about the utilities provided for creating mock boundaries.

Key topics:
- Creating basic and advanced mock boundaries
- Domain-specific mock creators
- Advanced mocking techniques
- Testing boundary data

[Read the Boundary Mocking Utilities documentation](./boundary-mocking-utils.md)

## Getting Started

To get started with ForgeHive libraries, install them in your project:

```bash
# Install the Schema library
npm install @forgehive/schema

# Install the Task library
npm install @forgehive/task
```

Then, import and use them in your code:

```typescript
import { Schema } from '@forgehive/schema';
import { createTask } from '@forgehive/task';

// Define a schema
const userSchema = new Schema({
  name: Schema.string(),
  email: Schema.string().email()
});

// Define boundaries
const boundaries = {
  saveUser: async (user) => { /* ... */ }
};

// Create a task
const createUser = createTask(
  userSchema,
  boundaries,
  async (input, boundaries) => {
    await boundaries.saveUser(input);
    return { success: true };
  }
);

// Run the task
const result = await createUser.run({
  name: 'John Doe',
  email: 'john@example.com'
});
```

## Examples

Check out the documentation for each library for detailed examples and usage patterns.

## Contributing

If you'd like to contribute to the documentation, please follow these guidelines:

1. Fork the repository
2. Make your changes
3. Submit a pull request

## License

These libraries are licensed under the MIT License. See the LICENSE file for details.