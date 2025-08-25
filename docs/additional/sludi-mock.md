##SLUDI Mock Authentication Flow

We simulate SLUDI login and KYC using:
- `mock-sludi-service.js` for identity verification and KYC
- `POST /auth/sludi/login` → returns `authToken`, `individualId`, `role`
- `GET /auth/sludi/profile` → returns mocked KYC attributes
- JWT-based access control on routes like `/admin/users` or `/responder/dashboard`

