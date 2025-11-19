# Testing Notes

## Current Test Status

- ✅ Utility function tests pass (7/7)
- ⚠️ Database tests require native module support

## Database Testing

The database tests use `better-sqlite3`, which is a native module. Bun's test runner doesn't currently support native modules, so these tests will fail when running `bun test`.

### Solutions

1. **For development**: The application works correctly when running `bun run dev` or `bun run start` because Next.js handles the native module loading.

2. **For testing**: You can:
   - Run database tests separately using Node.js: `node --test lib/db.test.ts`
   - Use integration tests that test the API routes instead
   - Wait for Bun to add native module support

## Running Tests

```bash
# Run all tests (utility tests will pass)
bun test

# Run specific test file
bun test lib/utils.test.ts
```

## Integration Testing

For comprehensive testing, consider adding integration tests that:
- Test API routes end-to-end
- Use a test database
- Verify CRUD operations through HTTP requests
