# Testing Tasks with Boundary Mocks

This document explains how to effectively test Forge tasks using boundary mocking, which allows you to isolate your task logic from external dependencies.

## Table of Contents

- [Introduction](#introduction)
- [Basic Concepts](#basic-concepts)
- [Setting Up Test Utilities](#setting-up-test-utilities)
- [Basic Mocking Examples](#basic-mocking-examples)
- [Advanced Mocking Techniques](#advanced-mocking-techniques)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Introduction

Tasks in the Forge framework are designed to interact with external systems through boundaries. When testing tasks, it's often necessary to mock these boundaries to:

1. Make tests faster and more reliable
2. Avoid hitting real external systems during testing
3. Simulate various responses, including success and error cases
4. Test edge cases that might be hard to produce with real systems

The `@forgehive/task` package provides a built-in mechanism for mocking boundaries through the `mockBoundary` method, which this guide will explore in detail.

## Basic Concepts

### What is a Boundary?

A boundary is a function that represents an interaction with an external system, such as a database, file system, or API. Boundaries are designed to be easily mocked for testing purposes.

### The Task Class

The `Task` class includes several methods for testing:

- `mockBoundary(name, mockFn)`: Replaces a specific boundary with a mock function
- `resetMock(name)`: Restores the original implementation of a specific boundary
- `resetMocks()`: Restores all original boundary implementations
- `safeRun(argv)`: Runs the task and returns a tuple of `[Error | null, Result | null, BoundaryLogs | null]`

## Setting Up Test Utilities

First, create a utility file to help with boundary mocking. Here's an example of what a `testUtils.ts` file might look like:

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

This utility function creates a mock boundary that satisfies the `WrappedBoundaryFunction` interface, making it compatible with the `mockBoundary` method.

## Basic Mocking Examples

### Example 1: Mocking a Simple Boundary

Let's say you have a task that fetches a stock price:

```typescript
// Task definition
export const getPrice = createTask(
  schema,
  {
    fetchStockPrice: async (ticker: string): Promise<{price: number}> => {
      // Implementation that calls an external API
    }
  },
  async function ({ ticker }, { fetchStockPrice }) {
    const { price } = await fetchStockPrice(ticker)
    return { ticker, price }
  }
)
```

Here's how you would test it:

```typescript
import { getPrice } from '../tasks/stock/getPrice'
import { createMockBoundary } from './testUtils'

describe('Stock Price Task', () => {
  afterEach(() => {
    // Reset all mocks after each test
    getPrice.resetMocks()
  })

  it('should fetch the correct price for a given ticker', async () => {
    // Create a mock for the fetchStockPrice boundary
    const fetchStockPriceMock = createMockBoundary(
      jest.fn().mockResolvedValue({ price: 175.50 })
    )

    // Mock the boundary
    getPrice.mockBoundary('fetchStockPrice', fetchStockPriceMock)

    // Run the task
    const result = await getPrice.run({ ticker: 'AAPL' })

    // Verify the result
    expect(result).toEqual({
      ticker: 'AAPL',
      price: 175.50
    })

    // Verify the boundary was called with the correct parameters
    expect(fetchStockPriceMock).toHaveBeenCalledWith('AAPL')
  })
})
```

### Example 2: Using safeRun to Access Boundary Data

The `safeRun` method returns a tuple that includes boundary data, which can be useful for testing:

```typescript
it('should provide boundary data with safeRun', async () => {
  // Create a mock
  const fetchStockPriceMock = createMockBoundary(
    jest.fn().mockResolvedValue({ price: 150 })
  )

  // Mock the boundary
  getPrice.mockBoundary('fetchStockPrice', fetchStockPriceMock)

  // Use safeRun to get the error, result, and boundary data
  const [error, result, boundariesData] = await getPrice.safeRun({ ticker: 'TEST' })

  // No error expected
  expect(error).toBeNull()

  // Check result
  expect(result).toEqual({
    ticker: 'TEST',
    price: 150
  })

  // Boundary data should be available
  expect(boundariesData).toBeDefined()
  expect(boundariesData).toHaveProperty('fetchStockPrice')
})
```

## Advanced Mocking Techniques

### Testing Error Handling

You can mock boundaries to throw errors to test error handling:

```typescript
it('should handle API errors correctly', async () => {
  // Create a mock that throws an error
  const fetchStockPriceMock = createMockBoundary(
    jest.fn().mockRejectedValue(new Error('API unavailable'))
  )

  // Mock the boundary
  getPrice.mockBoundary('fetchStockPrice', fetchStockPriceMock)

  // Expect the task to throw the error
  await expect(getPrice.run({ ticker: 'AAPL' }))
    .rejects
    .toThrow('API unavailable')
})
```

Alternatively, use `safeRun` to handle errors more gracefully:

```typescript
it('should handle API errors with safeRun', async () => {
  // Create a mock that throws an error
  const fetchStockPriceMock = createMockBoundary(
    jest.fn().mockRejectedValue(new Error('API unavailable'))
  )

  // Mock the boundary
  getPrice.mockBoundary('fetchStockPrice', fetchStockPriceMock)

  // Use safeRun to get the error
  const [error, result, boundariesData] = await getPrice.safeRun({ ticker: 'AAPL' })

  // Error should be defined
  expect(error).toBeDefined()
  expect(error?.message).toContain('API unavailable')

  // Result should be null
  expect(result).toBeNull()

  // Boundary data may still be available
  expect(boundariesData).toBeDefined()
})
```

### Testing Schema Validation

Tasks with schemas also validate inputs. You can test this behavior:

```typescript
it('should validate inputs', async () => {
  // Create a normal mock
  const fetchStockPriceMock = createMockBoundary(
    jest.fn().mockResolvedValue({ price: 100 })
  )

  // Mock the boundary
  getPrice.mockBoundary('fetchStockPrice', fetchStockPriceMock)

  // Use safeRun with invalid input (missing required field)
  const [error, result, boundariesData] = await getPrice.safeRun({} as any)

  // Should have a validation error
  expect(error).toBeDefined()
  expect(error?.message).toContain('Invalid input')

  // Result should be null
  expect(result).toBeNull()

  // Boundaries weren't run due to validation failure
  expect(boundariesData).toBeNull()

  // The boundary function shouldn't have been called
  expect(fetchStockPriceMock).not.toHaveBeenCalled()
})
```

### Resetting Mocks

You can reset specific mocks or all mocks:

```typescript
it('should reset mocks properly', async () => {
  // Create a mock with a specific return value
  const fetchStockPriceMock = createMockBoundary(
    jest.fn().mockResolvedValue({ price: 999.99 })
  )

  // Mock the boundary
  getPrice.mockBoundary('fetchStockPrice', fetchStockPriceMock)

  // Verify the mock is in use
  expect(getPrice.getBoundaries().fetchStockPrice).toBe(fetchStockPriceMock)

  // Reset the mock
  getPrice.resetMock('fetchStockPrice')

  // Verify the mock is no longer in use
  expect(getPrice.getBoundaries().fetchStockPrice).not.toBe(fetchStockPriceMock)
})
```

## Best Practices

1. **Always reset mocks**: Use `afterEach(() => task.resetMocks())` to ensure tests don't interfere with each other.

2. **Use type-safe mocks**: Create helper functions that return properly typed mocks for specific boundaries.

3. **Test the happy path first**: Start with tests that verify normal operation, then add tests for error cases.

4. **Verify mock calls**: Always check that your mock boundaries were called with the expected arguments.

5. **Use safeRun for detailed testing**: When you need to check boundary data or need more detailed error information, use `safeRun` instead of `run`.

6. **Create domain-specific helper functions**: For common boundaries, create specialized mock creators.

   ```typescript
   // Example of a specialized mock creator
   export const createFetchStockPriceMock = (prices: Record<string, number> = {}): jest.Mock => {
     return jest.fn().mockImplementation((ticker: string) => {
       const price = prices[ticker] || 100
       return Promise.resolve({ price })
     })
   }
   ```

## Troubleshooting

### Common Issues

1. **"TypeError: is not a function"**
   This usually means your mock isn't properly implementing the `WrappedBoundaryFunction` interface. Make sure you're using `createMockBoundary` to create properly structured mocks.

2. **Mock not being called**
   If your test shows the mock wasn't called when you expected it to be, check that you're properly mocking the correct boundary name and that validation isn't failing before the boundary is called.

3. **Unexpected boundary data**
   If the boundary data in your test doesn't match what you expected, make sure your mock properly implements `getRunData` and other required methods.

4. **Tests interfering with each other**
   If tests are affecting each other, make sure you're resetting mocks after each test with `resetMocks()`.

### Debugging Tips

1. Use `console.log` to inspect the mock and its calls during testing.
2. Check the structure of the boundary data returned by `safeRun`.
3. Use Jest's `.mockImplementation()` for complex mock behavior.
4. Use `spyOn` to verify that certain methods were called on the real implementation.

---

By following these guidelines and examples, you can effectively test Forge tasks with mocked boundaries, ensuring your tasks work correctly without depending on external systems.