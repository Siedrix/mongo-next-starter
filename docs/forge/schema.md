# Schema Library Documentation

The Schema library provides a powerful, type-safe way to define data structures and validate data against those structures. It's built on top of [Zod](https://github.com/colinhacks/zod) and provides a simplified, consistent API for schema definition and validation.

## Installation

```bash
npm install @forgehive/schema
# or
yarn add @forgehive/schema
# or
pnpm add @forgehive/schema
```

## Basic Usage

```typescript
import { Schema } from '@forgehive/schema';

// Define a schema
const userSchema = new Schema({
  name: Schema.string(),
  age: Schema.number(),
  email: Schema.string(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()),
  metadata: Schema.mixedRecord()
});

// Validate data against the schema
const isValid = userSchema.validate({
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
  isActive: true,
  tags: ['user', 'premium'],
  metadata: { lastLogin: '2023-01-01', loginCount: 5 }
});

// Parse and type data
const userData = userSchema.parse({
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
  isActive: true,
  tags: ['user', 'premium'],
  metadata: { lastLogin: '2023-01-01', loginCount: 5 }
});
// userData is now typed with the correct types
```

## Schema Types

The Schema library supports the following data types:

### Primitive Types

- `Schema.string()`: String values
- `Schema.number()`: Numeric values
- `Schema.boolean()`: Boolean values
- `Schema.date()`: Date objects

### Array Types

- `Schema.array(Schema.string())`: Array of strings
- `Schema.array(Schema.number())`: Array of numbers
- `Schema.array(Schema.boolean())`: Array of booleans
- `Schema.array(Schema.date())`: Array of dates

### Record Types

- `Schema.stringRecord()`: Record with string values
- `Schema.numberRecord()`: Record with number values
- `Schema.booleanRecord()`: Record with boolean values
- `Schema.mixedRecord()`: Record with mixed values (strings, numbers, booleans)

## Validation Options

Each schema type supports various validation options:

### String Validations

```typescript
// Email validation
const emailSchema = Schema.string().email();

// Length validation
const usernameSchema = Schema.string().min(3).max(20);

// Regex validation
const passwordSchema = Schema.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/);
```

### Number Validations

```typescript
// Range validation
const ageSchema = Schema.number().min(18).max(120);
```

### Optional Fields

Any field can be marked as optional:

```typescript
const userSchema = new Schema({
  name: Schema.string(),
  age: Schema.number().optional(),
  email: Schema.string().email()
});
```

## Schema Description

You can create schemas from a description object:

```typescript
const userSchema = Schema.from({
  name: { type: 'string' },
  age: { type: 'number', validations: { min: 18, max: 120 } },
  email: { type: 'string', validations: { email: true } },
  isActive: { type: 'boolean', optional: true },
  tags: { type: 'array', items: { type: 'string' } },
  metadata: { type: 'mixedRecord' }
});
```

## Type Inference

You can infer the TypeScript type from a schema:

```typescript
import { Schema, InferSchema } from '@forgehive/schema';

const userSchema = new Schema({
  name: Schema.string(),
  age: Schema.number(),
  email: Schema.string().email(),
  isActive: Schema.boolean()
});

// Infer the type from the schema
type User = InferSchema<typeof userSchema>;

// Now User is equivalent to:
// {
//   name: string;
//   age: number;
//   email: string;
//   isActive: boolean;
// }
```

## Schema Methods

### `validate(data: unknown): boolean`

Validates data against the schema and returns a boolean indicating whether the data is valid.

```typescript
const isValid = userSchema.validate(data);
```

### `parse(data: unknown): T`

Parses and validates data against the schema. Returns the data with the correct types if valid, or throws an error if invalid.

```typescript
try {
  const userData = userSchema.parse(data);
  // userData is now typed correctly
} catch (error) {
  console.error('Invalid data:', error);
}
```

### `safeParse(data: unknown): { success: boolean; data?: T; error?: ZodError }`

Safely parses data without throwing errors.

```typescript
const result = userSchema.safeParse(data);
if (result.success) {
  const userData = result.data;
  // Use the validated data
} else {
  console.error('Validation errors:', result.error);
}
```

### `describe(): SchemaDescription`

Returns a description of the schema structure.

```typescript
const description = userSchema.describe();
console.log(JSON.stringify(description, null, 2));
```

## Integration with Task Library

The Schema library is designed to work seamlessly with the Task library:

```typescript
import { createTask } from '@forgehive/task';
import { Schema } from '@forgehive/schema';

const userSchema = new Schema({
  name: Schema.string(),
  age: Schema.number()
});

const createUserTask = createTask(
  userSchema,
  {
    saveToDatabase: async (user) => { /* ... */ }
  },
  async (input, boundaries) => {
    // input is typed as { name: string, age: number }
    await boundaries.saveToDatabase(input);
    return { success: true, userId: '123' };
  }
);
```

## Best Practices

1. **Define schemas at the module level** for better reusability and performance.
2. **Use type inference** to ensure type safety throughout your application.
3. **Compose schemas** for complex data structures.
4. **Validate early** in your application flow to catch errors as soon as possible.
5. **Use descriptive error messages** to help users understand validation failures.

## Examples

### User Registration Form

```typescript
const registrationSchema = new Schema({
  username: Schema.string().min(3).max(20),
  email: Schema.string().email(),
  password: Schema.string().min(8),
  confirmPassword: Schema.string(),
  agreeToTerms: Schema.boolean()
});

function validateRegistration(formData) {
  const result = registrationSchema.safeParse(formData);
  if (!result.success) {
    return { valid: false, errors: result.error.format() };
  }
  
  // Additional custom validation
  if (formData.password !== formData.confirmPassword) {
    return { valid: false, errors: { confirmPassword: 'Passwords do not match' } };
  }
  
  if (!formData.agreeToTerms) {
    return { valid: false, errors: { agreeToTerms: 'You must agree to the terms' } };
  }
  
  return { valid: true, data: result.data };
}
```

### API Request Validation

```typescript
const searchParamsSchema = new Schema({
  query: Schema.string(),
  page: Schema.number().optional(),
  limit: Schema.number().optional(),
  sort: Schema.string().optional(),
  filters: Schema.mixedRecord().optional()
});

async function handleSearchRequest(req, res) {
  const result = searchParamsSchema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid search parameters', details: result.error.format() });
  }
  
  const { query, page = 1, limit = 10, sort = 'relevance', filters = {} } = result.data;
  
  // Process the search with validated and typed parameters
  const searchResults = await performSearch(query, page, limit, sort, filters);
  
  return res.json(searchResults);
}
```

## Advanced Usage

### Custom Validation Logic

You can extend schemas with custom validation logic:

```typescript
const passwordSchema = Schema.string().refine(
  (password) => {
    // Custom password strength validation
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  },
  {
    message: 'Password must contain uppercase, lowercase, number, and special character'
  }
);
```

### Schema Composition

You can compose schemas for more complex data structures:

```typescript
const addressSchema = new Schema({
  street: Schema.string(),
  city: Schema.string(),
  state: Schema.string(),
  zipCode: Schema.string(),
  country: Schema.string()
});

const userSchema = new Schema({
  name: Schema.string(),
  email: Schema.string().email(),
  address: addressSchema.schema // Use the inner Zod schema
});
```

## Troubleshooting

### Common Validation Errors

- **Type errors**: The data type doesn't match the schema (e.g., string instead of number)
- **Constraint errors**: The data doesn't meet the constraints (e.g., string too short)
- **Missing required fields**: Required fields are missing from the data
- **Extra fields**: The data contains fields not defined in the schema

### Debugging Tips

1. Use `safeParse` instead of `parse` to get detailed error information
2. Log the schema description to verify it's defined correctly
3. Check for typos in field names
4. Ensure all required fields are provided

## Conclusion

The Schema library provides a powerful, type-safe way to define and validate data structures in your application. By using schemas, you can ensure data integrity, improve type safety, and catch errors early in your application flow. 