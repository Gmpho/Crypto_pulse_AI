# Using Zod for Data Validation

This guide explains how we use Zod for data validation in the CryptoPulse AI project to ensure data integrity and type safety across the full stack.

## What is Zod?

Zod is a TypeScript-first schema declaration and validation library. It allows us to define a schema for our data and then validate that data against the schema at runtime. This is especially useful for validating data from external sources, such as user input and API responses.

### Key Benefits

*   **Type Safety:** Zod automatically infers TypeScript types from your schemas, ensuring that your static types and runtime validations are always in sync.
*   **Runtime Validation:** It provides robust runtime validation, which is crucial for catching errors early and preventing invalid data from flowing through your application.
*   **Clear and Concise Schemas:** Zod's fluent API makes it easy to define complex validation rules in a clear and readable way.

## Frontend Validation (React + TypeScript)

In our React frontend, we use Zod for two main purposes: form validation and API response validation.

### Form Validation with `react-hook-form`

We use the `react-hook-form` library for managing forms, and we integrate it with Zod using the `@hookform/resolvers/zod` package. This allows us to define our form schemas with Zod and get automatic validation and type inference.

**Example: Login Form**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Define the form schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// 2. Infer the form data type
type LoginFormInputs = z.infer<typeof loginSchema>;

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormInputs) => {
    console.log(data);
    // Send data to the backend
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form inputs and error messages */}
    </form>
  );
}
```

### API Response Validation

We also use Zod to validate the data we receive from our FastAPI backend. This ensures that the data conforms to the expected schema before we use it in our application.

```typescript
import { z } from 'zod';

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  // Validate the data against the schema
  const user = userSchema.parse(data);

  return user;
}
```

## Backend Validation (FastAPI + Pydantic)

In our FastAPI backend, we use Pydantic for data validation. While Pydantic is the default for FastAPI, we can share validation schemas between the frontend and backend to ensure consistency.

We can generate Zod schemas from our Pydantic models or use a shared format like JSON Schema. This allows us to have a single source of truth for our data models, which reduces code duplication and prevents inconsistencies.

**Example: Pydantic model and Zod schema**

```python
# backend/app/schemas.py
from pydantic import BaseModel, EmailStr

class User(BaseModel):
    id: str
    email: EmailStr
```

We can then create a corresponding Zod schema in our frontend:

```typescript
// frontend/src/schemas.ts
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});
```

By using Zod in conjunction with Pydantic, we can ensure end-to-end type safety and data validation in our application.
