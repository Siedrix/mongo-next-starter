# Task Library Documentation

The Task library provides a powerful, type-safe way to define and execute tasks with input validation, boundary separation, and execution tracking. It's designed to work seamlessly with the Schema library for input validation.

## Installation

```bash
npm install @forgehive/task
# or
yarn add @forgehive/task
# or
pnpm add @forgehive/task
```

## Overview

The Task library helps you create well-structured, testable tasks with:

- **Input validation** using schemas
- **Boundary separation** for better testability
- **Execution modes** (proxy, replay, etc.)
- **Listener support** for tracking task execution

## Basic Usage

Here's a simple example of creating a task:

```typescript
import { createTask } from '@forgehive/task';
import { Schema } from '@forgehive/schema';

// Define a schema for task input validation
const schema = new Schema({
  name: Schema.string(),
  age: Schema.number().optional()
});

// Define boundaries (external dependencies)
const boundaries = {
  saveToDatabase: async (data: any): Promise<void> => {
    // Implementation...
  },
  sendEmail: async (to: string, subject: string): Promise<boolean> => {
    // Implementation...
  }
};

// Create the task with type inference and argument destructuring
const registerUser = createTask(
  schema,
  boundaries,
  // Using destructuring for both input and boundaries
  async ({ name, age }, { saveToDatabase, sendEmail }) => {
    // Input parameters are directly available through destructuring
    console.log(`Registering user: ${name}`);

    // Boundaries are also directly available through destructuring
    await saveToDatabase({ name, age });
    const emailSent = await sendEmail(
      'admin@example.com',
      `New user registered: ${name}`
    );

    return {
      success: true,
      emailSent,
      user: { name, age }
    };
  }
);

// Execute the task
const result = await registerUser.run({ name: 'John Doe', age: 30 });
```

## Key Concepts

### Tasks

A task is a function with:
- Validated input (using Schema)
- External dependencies isolated as boundaries
- Execution tracking and replay capabilities

### Boundaries

Boundaries are external dependencies that a task interacts with, such as:
- Database operations
- File system access
- Network requests
- Email sending
- Third-party API calls

By isolating these dependencies, tasks become easier to test and more predictable.

### Execution Modes

Tasks support different execution modes:

- `proxy`: Normal execution (default)
- `proxy-pass`: Use recorded data if available, otherwise execute normally
- `proxy-catch`: Use recorded data if execution fails
- `replay`: Only use recorded data, fail if not available

## Type Safety

The `createTask` function provides full type inference:

- Input arguments are typed based on the schema
- Boundaries are typed based on the provided boundaries object
- Return type is inferred from the task function

```typescript
// Full type inference with destructuring
const createUser = createTask(
  userSchema,
  {
    saveToDatabase: async (user: User): Promise<string> => { /* ... */ },
    sendEmail: async (to: string, subject: string): Promise<boolean> => { /* ... */ }
  },
  async ({ name, email }, { saveToDatabase, sendEmail }) => {
    // Input properties are typed based on userSchema
    // Boundaries are typed based on the boundaries object
    const userId = await saveToDatabase({ name, email });
    const emailSent = await sendEmail(email, 'Welcome!');

    // Return type is inferred
    return { userId, emailSent };
  }
);

// Usage with type checking
const result = await createUser.run({
  name: 'John Doe',
  email: 'john@example.com',
  // Type error if missing required fields or wrong types
});
```

## Advanced Usage

### Adding Listeners

You can add listeners to track task execution:

```typescript
registerUser.addListener((record) => {
  console.log('Task executed:', record);
  // record contains:
  // - input: The input arguments
  // - output: The task result (if successful)
  // - error: Error message (if failed)
  // - boundaries: Boundary execution data
});
```

### Using safeRun for Error Handling

The `safeRun` method provides a more graceful way to handle errors and access boundary data:

```typescript
// Using safeRun to get error, result, and boundary data
const [error, result, boundariesData] = await registerUser.safeRun({
  name: 'John Doe',
  email: 'john@example.com'
});

if (error) {
  console.error('Task failed:', error.message);
  // Handle error gracefully
} else {
  console.log('Task succeeded:', result);
  // Process the result
}

// Access boundary execution data
if (boundariesData) {
  console.log('Boundary data:', boundariesData);
  // Analyze boundary execution data
}
```

Unlike `run` which throws errors, `safeRun` returns a tuple containing:
1. The error object (or null if successful)
2. The result (or null if there was an error)
3. Boundary execution logs (or null if validation failed)

This is particularly useful for:
- API handlers where you want to gracefully handle errors
- Processing boundary data for analytics or debugging
- Scenarios where you need to continue execution even after a task error

### Changing Execution Mode

```typescript
// Change execution mode
registerUser.setMode('replay');
```

### Boundary Data

You can provide pre-recorded boundary data:

```typescript
registerUser.setBoundariesData({
  saveToDatabase: [
    { input: [{ name: 'John', age: 30 }], output: undefined }
  ],
  sendEmail: [
    { input: ['admin@example.com', 'New user registered: John'], output: true }
  ]
});
```

### Mocking Boundaries for Testing

The `mockBoundary` method allows you to replace a specific boundary with a mock function for testing:

```typescript
import { createMockBoundary } from './testUtils';

// Create a mock boundary
const saveDbMock = createMockBoundary(
  jest.fn().mockResolvedValue('user-123')
);

// Mock the boundary
registerUser.mockBoundary('saveToDatabase', saveDbMock);

// Run the task
const result = await registerUser.run({ name: 'Test User', age: 25 });

// Verify the mock was called with correct arguments
expect(saveDbMock).toHaveBeenCalledWith({ name: 'Test User', age: 25 });

// Reset a specific mock
registerUser.resetMock('saveToDatabase');

// Or reset all mocks
registerUser.resetMocks();
```

This approach is more maintainable than directly overriding boundary functions and ensures proper cleanup between tests.

### Validation Without Execution

You can validate input without running the task:

```typescript
const validationResult = registerUser.validate({ name: 'John' });
if (validationResult.success) {
  console.log('Input is valid');
} else {
  console.error('Validation errors:', validationResult.error);
}

// Or simply check if valid
const isValid = registerUser.isValid({ name: 'John' });
```

## Real-World Examples

### CLI Task

Here's an example of a task used in a CLI application:

```typescript
import { createTask } from '@forgehive/task';
import { Schema } from '@forgehive/schema';
import path from 'path';
import fs from 'fs/promises';

// Define the schema with optional dryRun flag
const schema = new Schema({
  dryRun: Schema.boolean().optional()
});

// Define boundaries for file operations
const boundaries = {
  saveFile: async (path: string, content: string): Promise<void> => {
    await fs.writeFile(path, content);
  }
};

// Create the init task with destructuring
export const init = createTask(
  schema,
  boundaries,
  async ({ dryRun }, { saveFile }) => {
    // Handle the dryRun flag
    const isDryRun = Boolean(dryRun);

    const configPath = path.join(process.cwd(), 'config.json');
    const config = {
      project: { name: 'MyProject' },
      // ... other config properties
    };

    const content = JSON.stringify(config, null, 2);

    // Conditionally create the file based on dryRun
    if (!isDryRun) {
      await saveFile(configPath, content);
      console.log(`Created config.json at ${configPath}`);
    } else {
      console.log('Dry run, not creating config.json');
      console.log(content);
    }

    return config;
  }
);
```

### API Handler

```typescript
import { createTask } from '@forgehive/task';
import { Schema } from '@forgehive/schema';

// Define the schema for API input
const userCreateSchema = new Schema({
  name: Schema.string(),
  email: Schema.string().email(),
  role: Schema.string()
});

// Define boundaries
const boundaries = {
  db: {
    createUser: async (userData) => { /* ... */ },
    findUserByEmail: async (email) => { /* ... */ }
  },
  notifications: {
    sendWelcomeEmail: async (email, name) => { /* ... */ }
  },
  logger: {
    info: (message) => { /* ... */ },
    error: (message, error) => { /* ... */ }
  }
};

// Create the task with nested destructuring
export const createUserTask = createTask(
  userCreateSchema,
  boundaries,
  async ({ name, email, role }, { db, notifications, logger }) => {
    logger.info(`Creating user: ${email}`);

    // Check if user exists
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    const userId = await db.createUser({ name, email, role });

    // Send welcome email
    await notifications.sendWelcomeEmail(email, name);

    logger.info(`User created: ${userId}`);

    return { userId };
  }
);

// Express route handler
app.post('/api/users', async (req, res) => {
  try {
    const result = await createUserTask.run(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## Testing Tasks

The boundary separation makes tasks easy to test. The `mockBoundary` method provides a clean way to mock boundaries for testing:

```typescript
import { init } from './tasks/init';
import { createMockBoundary } from './testUtils';

describe('Init task', () => {
  // Reset all mocks after each test
  afterEach(() => {
    init.resetMocks();
  });

  it('should create a config file when dryRun is false', async () => {
    // Create a mock for the saveFile boundary
    const saveFileMock = createMockBoundary(
      jest.fn().mockResolvedValue(undefined)
    );

    // Mock the boundary
    init.mockBoundary('saveFile', saveFileMock);

    // Run the task
    await init.run({ dryRun: false });

    // Verify the boundary was called
    expect(saveFileMock).toHaveBeenCalled();
  });

  it('should not create a file when dryRun is true', async () => {
    // Create a mock for the saveFile boundary
    const saveFileMock = createMockBoundary(
      jest.fn().mockResolvedValue(undefined)
    );

    // Mock the boundary
    init.mockBoundary('saveFile', saveFileMock);

    // Run the task
    await init.run({ dryRun: true });

    // Verify the boundary was not called
    expect(saveFileMock).not.toHaveBeenCalled();
  });

  it('should handle errors using safeRun', async () => {
    // Create a mock that throws an error
    const saveFileMock = createMockBoundary(
      jest.fn().mockRejectedValue(new Error('Failed to save file'))
    );

    // Mock the boundary
    init.mockBoundary('saveFile', saveFileMock);

    // Use safeRun to get error, result, and boundary data
    const [error, result, boundariesData] = await init.safeRun({ dryRun: false });

    // Verify we got an error
    expect(error).toBeDefined();
    expect(error?.message).toContain('Failed to save file');

    // Result should be null
    expect(result).toBeNull();

    // Boundary data should be available
    expect(boundariesData).toBeDefined();
    expect(boundariesData).toHaveProperty('saveFile');
  });

  it('should reset individual mocks', async () => {
    // Create two mocks
    const saveFileMock = createMockBoundary(jest.fn());
    const getCwdMock = createMockBoundary(jest.fn());

    // Mock both boundaries
    init.mockBoundary('saveFile', saveFileMock);
    init.mockBoundary('getCwd', getCwdMock);

    // Reset just one mock
    init.resetMock('saveFile');

    // The saveFile should be restored to original implementation
    // while getCwd should still be mocked
    expect(init.getBoundaries().saveFile).not.toBe(saveFileMock);
    expect(init.getBoundaries().getCwd).toBe(getCwdMock);
  });
});
```

The `createMockBoundary` utility function creates mock boundaries that properly implement the `WrappedBoundaryFunction` interface:

```typescript
import { type WrappedBoundaryFunction } from '@forgehive/task';

export const createMockBoundary = (mockFn?: jest.Mock): WrappedBoundaryFunction => {
  // Use provided mock or create a new one
  const baseMockFn = mockFn || jest.fn().mockResolvedValue(undefined);

  // Create a proper boundary function object that extends the mock function
  const boundaryMock = Object.assign(
    baseMockFn,
    {
      getTape: jest.fn().mockReturnValue([]),
      setTape: jest.fn(),
      getMode: jest.fn().mockReturnValue('proxy'),
      setMode: jest.fn(),
      startRun: jest.fn(),
      stopRun: jest.fn(),
      getRunData: jest.fn().mockReturnValue([])
    }
  ) as WrappedBoundaryFunction;

  return boundaryMock;
};
```

For more detailed information on testing with mocks, see the [Testing with Boundary Mocks](./testing-with-boundary-mocks.md) guide.

## API Reference

### `createTask<S, B, R>(schema, boundaries, fn, config?)`

Creates a new task with type inference.

- `schema`: A Schema instance for input validation
- `boundaries`: An object containing boundary functions
- `fn`: The task function that receives validated input and boundaries
- `config`: Optional configuration (mode, boundariesData)

Returns a `TaskInstanceType` with methods for running and managing the task.

### `TaskInstanceType` Methods

#### Execution Methods

- `run(argv?)`: Executes the task with the given arguments and throws any errors
- `safeRun(argv?)`: Executes the task and returns a tuple of `[Error | null, Result | null, BoundaryLogs | null]`
- `asBoundary()`: Convert the task to a boundary function

#### Validation Methods

- `validate(argv?)`: Validate input without running the task
- `isValid(argv?)`: Check if input is valid

#### Listener Methods

- `addListener(fn)`: Adds a listener for task execution
- `removeListener()`: Removes the current listener
- `emit(data)`: Manually emit a task record

#### Mode Methods

- `getMode()`: Get the current execution mode
- `setMode(mode)`: Set the execution mode

#### Boundary Methods

- `getBoundaries()`: Get the wrapped boundary functions
- `setBoundariesData(data)`: Set pre-recorded boundary data
- `getBondariesData()`: Get the current boundary data
- `getBondariesRunLog()`: Get the boundary execution log
- `startRunLog()`: Start a new boundary execution log

#### Mock Methods

- `mockBoundary(name, mockFn)`: Replace a specific boundary with a mock function for testing
- `resetMock(name)`: Restore the original implementation of a specific boundary
- `resetMocks()`: Restore all original boundary implementations

#### Schema Methods

- `getSchema()`: Get the current schema
- `setSchema(schema)`: Set a new schema

## Best Practices

### Task Design

1. **Keep tasks focused**: Each task should do one thing well
2. **Isolate side effects in boundaries**: All external interactions should be in boundaries
3. **Use descriptive names**: Task and boundary names should clearly indicate their purpose
4. **Return meaningful results**: Task return values should be useful to callers
5. **Use destructuring**: Destructure input and boundaries for cleaner, more readable code

### Boundary Design

1. **Group related boundaries**: Organize boundaries by their domain (e.g., `db`, `http`, `fs`)
2. **Keep boundaries pure**: Boundaries should be pure functions with no side effects beyond their stated purpose
3. **Type boundaries properly**: Use TypeScript to ensure boundary functions have proper types
4. **Make boundaries testable**: Design boundaries to be easily mocked in tests

### Testing

1. **Mock boundaries, not tasks**: Test tasks by mocking their boundaries
2. **Test happy and error paths**: Ensure tasks handle both success and failure cases
3. **Use replay mode for integration tests**: Record real boundary responses and replay them in tests
4. **Validate boundary calls**: Verify that boundaries are called with the expected arguments

## Troubleshooting

### Common Issues

- **Schema validation errors**: Input doesn't match the schema
- **Boundary execution errors**: Boundaries throw exceptions
- **Replay mode failures**: Missing or incorrect boundary data
- **Type errors**: TypeScript type mismatches
- **Mock implementation issues**: Incorrectly implemented mock boundaries

### Debugging Tips

1. Use `safeRun` instead of `run` to get detailed error information and boundary data in one call
2. Add a listener to log task execution details
3. Use `validate` to check input before running the task
4. Check boundary data format when using replay mode
5. Verify that all required boundaries are provided
6. Use the `mockBoundary` method with Jest spies to track boundary calls in tests

Example of using `safeRun` for debugging:

```typescript
// Using safeRun for debugging
const [error, result, boundariesData] = await myTask.safeRun(input);

// Log detailed information
console.log('Error:', error);
console.log('Result:', result);
console.log('Boundary calls:', JSON.stringify(boundariesData, null, 2));

// Continue execution even if the task failed
if (error) {
  console.error('Task failed but we can inspect the boundary data');
}
```

## Conclusion

The Task library provides a powerful, type-safe way to define and execute tasks with input validation, boundary separation, and execution tracking. By using tasks, you can create more maintainable, testable, and reliable code.