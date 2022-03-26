# Testing

**NOTE:** I would strongly recommend performing the tests in a separate database, 
just in case if you had information you use frequently at development

## Testing with Jest

Each route should have its own unit test file. In order to execute tests, launch

```
npm run test
```

Or if you want to test individual routes and modules:

```
npm run test -- <filename>
```