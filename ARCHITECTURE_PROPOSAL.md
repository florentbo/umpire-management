# Clean Architecture Proposal

## Current Issues
- Mixed concerns across directories
- No clear hexagonal boundaries
- Scattered hooks and components
- Inconsistent naming conventions

## Proposed Structure

```
src/
├── domain/                    # Domain Layer (Core Business Logic)
│   ├── entities/             # Domain entities (Assessment, Match, etc.)
│   ├── repositories/         # Repository interfaces
│   ├── services/             # Domain services
│   └── value-objects/        # Value objects (ID, Date, etc.)
│
├── application/              # Application Layer (Use Cases)
│   ├── usecases/            # Application use cases
│   ├── ports/               # Port interfaces (in/out)
│   └── dto/                 # Data Transfer Objects
│
├── infrastructure/           # Infrastructure Layer (Adapters)
│   ├── repositories/        # Repository implementations
│   ├── config/             # Configuration
│   ├── di/                 # Dependency injection
│   └── external/           # External services (API clients, etc.)
│
├── presentation/            # Presentation Layer (UI)
│   ├── pages/              # Page components
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── routes/             # Route definitions
│   └── viewmodels/         # View models for pages
│
├── shared/                  # Shared utilities
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   ├── constants/          # Constants
│   └── i18n/               # Internationalization
│
└── lib/                     # Framework-specific setup
    ├── supabase.ts         # Supabase client
    ├── auth.ts             # Auth utilities
    └── api.ts              # API utilities
```

## Migration Plan

### Phase 1: Consolidate Presentation Layer
- Move all UI components to `src/presentation/components/`
- Move all hooks to `src/presentation/hooks/`
- Move routes to `src/presentation/routes/`
- Create view models in `src/presentation/viewmodels/`

### Phase 2: Clean Domain Layer
- Ensure domain entities are pure
- Move value objects to dedicated directory
- Clean up domain services

### Phase 3: Organize Infrastructure
- Group all external dependencies
- Clean up repository implementations
- Organize configuration

### Phase 4: Create Shared Layer
- Move common types and utilities
- Organize constants and i18n

## Benefits
- Clear separation of concerns
- Easy to test each layer independently
- Better maintainability
- Follows DDD principles
- Proper hexagonal architecture 