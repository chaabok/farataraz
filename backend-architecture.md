# Nest.js Backend Architecture (Onion Architecture)

The user requested a Nest.js backend using Onion/Clean Architecture for modules (General, Financial, Warehouse, Logistics).
While this AI Studio environment runs the Next.js frontend, here is the exact folder structure and architectural pattern you should use for your separate Nest.js + PostgreSQL backend.

## Structure Overview

\`\`\`text
src/
├── app.module.ts
├── main.ts
│
├── core/                       # Core Layer (Entities, Boundaries/Interfaces)
│   ├── domain/
│   │   ├── general.entity.ts
│   │   ├── financial.entity.ts
│   │   └── logistics.entity.ts
│   ├── exceptions/
│   └── pagination.dto.ts
│
├── application/                # Application Layer (Use Cases / Services)
│   ├── general/
│   │   ├── general.service.ts
│   │   └── interfaces/
│   ├── financial/
│   │   ├── financial.service.ts
│   │   └── interfaces/
│   └── logistics/
│       ├── warehouse.service.ts
│       └── logistics.service.ts
│
├── infrastructure/             # Infrastructure Layer (TypeORM / Postgres, Adapters)
│   ├── database/
│   │   ├── pg.module.ts
│   │   ├── repositories/
│   │   │   ├── pg-financial.repository.ts
│   │   │   └── pg-general.repository.ts
│   │   └── typeorm.config.ts
│   ├── export/                 # PDF / Excel generators
│   └── auth/                   # JWT, Guards
│
└── presentation/               # Presentation Layer (Controllers, Resolvers)
    ├── controllers/
    │   ├── general.controller.ts
    │   ├── financial.controller.ts
    │   ├── warehouse.controller.ts
    │   └── logistics.controller.ts
    └── dtos/
        ├── create-financial.dto.ts
        └── update-logistics.dto.ts
\`\`\`

### Technology Stack for Backend:
- **Framework**: Nest.js (Express beneath)
- **Database**: PostgreSQL
- **ORM**: TypeORM or Prisma (TypeORM is standard with Nest.js)
- **Validation**: `class-validator` and `class-transformer`

### How the Layers interact (Onion Rule)
1. **Presentation Layer (Controllers)** handles HTTP requests. It calls Use-Cases in the Application Layer.
2. **Application Layer (Services)** coordinates business rules. It defines Repository Interfaces.
3. **Infrastructure Layer (Repositories)** implements the Database operations (Postgres) and provides the actual logic for the Interfaces defined in the Application Layer.
4. **Core Layer (Entities)** has zero dependencies on any framework or database technology.

### Running this alongside Next.js
You would build this Nest.js app as an API running on `localhost:4000` and point your Next.js frontend to it using environment variables.
