# work-sandbox-app

Small JSON API service (Node, no dependencies) used as a test target for work-console.

- `src/http.js` request/response helpers
- `src/store.js` in-memory collections
- `src/routes/*.js` one module per resource, each exporting `routes` (health, users, todos)
- `src/router.js` the route table

```bash
npm test
npm start   # PORT=3000
```
