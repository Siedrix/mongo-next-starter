# Boundary Mocking Utilities

This document explains the boundary mocking utilities available in the Forge framework and how to use them effectively for testing tasks.

## The createMockBoundary Utility

The `createMockBoundary` function is a utility for creating mock boundaries that can be used with the `mockBoundary` method of the Task class. This function properly wraps a Jest mock function to satisfy the `WrappedBoundaryFunction` interface.

### Implementation

```typescript
import { type WrappedBoundaryFunction } from '@forgehive/task'

/**
 * Creates a mock boundary function that implements the WrappedBoundaryFunction interface
 *
 * @param mockFn Optional Jest mock function to use as the base function
 * @returns A wrapped boundary function compatible with task.mockBoundary()
 */
export const createMockBoundary = (mockFn?: jest.Mock): WrappedBoundaryFunction => {
  // Use provided mock or create a new one
  const baseMockFn = mockFn || jest.fn().mockResolvedValue(undefined)

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
  ) as WrappedBoundaryFunction

  return boundaryMock
}
```

### How It Works

The `createMockBoundary` function:

1. Takes an optional Jest mock function (`mockFn`)
2. If no mock function is provided, it creates a default one that resolves to `undefined`
3. Uses `Object.assign` to add all the required methods of the `WrappedBoundaryFunction` interface to the mock function
4. Returns the enhanced function as a `WrappedBoundaryFunction`

### Usage

```typescript
// Example 1: With a basic mock
const simpleMock = createMockBoundary()
myTask.mockBoundary('boundaryName', simpleMock)

// Example 2: With a specific return value
const mockWithValue = createMockBoundary(
  jest.fn().mockResolvedValue({ data: 'result' })
)
myTask.mockBoundary('boundaryName', mockWithValue)

// Example 3: With a specific implementation
const mockWithImpl = createMockBoundary(
  jest.fn().mockImplementation((arg1, arg2) => {
    return Promise.resolve({
      value: arg1 + arg2
    })
  })
)
myTask.mockBoundary('boundaryName', mockWithImpl)
```

## Creating Domain-Specific Mock Boundaries

For frequently used boundaries, it's helpful to create specialized mock creators:

```typescript
/**
 * Creates a mock for the fetchData boundary with predefined responses
 */
export const createFetchDataMock = (responses: Record<string, any> = {}): jest.Mock => {
  return jest.fn().mockImplementation((endpoint: string) => {
    if (responses[endpoint]) {
      return Promise.resolve(responses[endpoint])
    }
    return Promise.resolve({ success: true, data: {} })
  })
}

// Usage
const fetchDataMock = createMockBoundary(
  createFetchDataMock({
    '/users': { users: [{ id: 1, name: 'User1' }] },
    '/products': { products: [{ id: 101, name: 'Product1' }] }
  })
)
```

## Advanced Mocking Techniques

### Simulating Delays

```typescript
const delayedMock = createMockBoundary(
  jest.fn().mockImplementation(async (arg) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))
    return { data: arg }
  })
)
```

### Simulating Sequential Responses

```typescript
const sequentialMock = createMockBoundary(
  jest.fn()
    .mockResolvedValueOnce({ attempt: 1, success: false })
    .mockResolvedValueOnce({ attempt: 2, success: false })
    .mockResolvedValueOnce({ attempt: 3, success: true })
)
```

### Conditional Responses

```typescript
const conditionalMock = createMockBoundary(
  jest.fn().mockImplementation(arg => {
    if (typeof arg === 'number' && arg > 0) {
      return Promise.resolve({ valid: true, value: arg })
    } else {
      return Promise.reject(new Error('Invalid input'))
    }
  })
)
```

## Testing Boundary Data

The `getRunData` method on the mock boundary is used by the task to collect information about boundary calls. This data is returned in the third element of the tuple from `safeRun`.

```typescript
it('should collect and return boundary data', async () => {
  // Create a custom mock that accumulates run data
  const customRunDataMock = createMockBoundary()

  // Override the getRunData method
  customRunDataMock.getRunData = jest.fn().mockImplementation(() => {
    return [
      { input: ['arg1'], output: 'result1' },
      { input: ['arg2'], output: 'result2' }
    ]
  })

  // Mock the boundary
  myTask.mockBoundary('boundaryName', customRunDataMock)

  // Use safeRun to access boundary data
  const [error, result, boundariesData] = await myTask.safeRun({ input: 'test' })

  // Verify boundary data
  expect(boundariesData?.boundaryName).toEqual([
    { input: ['arg1'], output: 'result1' },
    { input: ['arg2'], output: 'result2' }
  ])
})
```

## Best Practices

1. **Keep your testing utilities in a separate file**: This makes it easier to reuse them across multiple test files.

2. **Create specialized mock creators for common boundaries**: This reduces duplication and ensures consistency.

3. **Use type annotations**: Make sure your mocks have the correct types to catch type errors early.

4. **Reset mocks after each test**: Use `afterEach(() => task.resetMocks())` to ensure test isolation.

5. **Verify both calls and results**: Check both that the boundary was called with the expected arguments and that the task returned the expected result.

## Common Pitfalls

1. **Missing required methods**: If your mock doesn't implement all the required methods of `WrappedBoundaryFunction`, it may cause runtime errors.

2. **Not resetting mocks between tests**: This can cause test interference where one test affects the behavior of another.

3. **Incorrect return types**: Make sure your mock functions return values with the correct structure and types.

4. **Over-mocking**: Sometimes it's better to use the real implementation for simple boundaries.

## Conclusion

The `createMockBoundary` utility provides a simple and effective way to create mock boundaries for testing Forge tasks. By using this utility, you can ensure your mocks properly implement the required interface and work correctly with the task mocking system.