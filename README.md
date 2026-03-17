# CriptonPrime Angular Frontend

## Recommended ERP Structure

This project has been prepared for a scalable ERP-style architecture.

### Core principles
- `core/` contains app-wide infrastructure only.
- `shared/` contains reusable UI components, directives and pipes.
- `features/` contains business modules.
- Each large business module should own its own routes, models, services, pages and components.

### Example feature structure

```text
features/
  administration/
    administration.routes.ts
    users/
      components/
      mappers/
      models/
      pages/
      services/
```

### Service layering
- `ApiService` = low-level HTTP abstraction.
- `user-api.service.ts` = endpoint-specific backend calls.
- `user-facade.service.ts` = UI-facing orchestration.

### Routing
Feature routes are lazy-loaded through:
- `features/auth/auth.routes.ts`
- `features/administration/administration.routes.ts`
- `features/hrm/hrm.routes.ts`
- `features/prl/prl.routes.ts`

### Notes
The Users feature was prepared as the reference implementation for future ERP modules.
Use the same pattern for HRM, Sales, Purchase, Inventory, Accounts and other modules.
