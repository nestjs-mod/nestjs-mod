# NestJS-Mod Module Development Skill

## Overview
This skill helps you create and work with NestJS-mod modules following the architecture's 5-layer pattern: System, Core, Feature, Integration, and Infrastructure.

## When to Use
- Creating new business logic modules
- Adding features to existing applications
- Building reusable libraries
- Implementing cross-module communication
- Adding infrastructure configurations

## Module Architecture

### The 5 Module Categories

#### 1. System Modules (`NestModuleCategory.system`)
**Purpose**: Core application initialization and bootstrapping

**Examples**:
- `DefaultNestApplicationInitializer` - Initializes NestJS application
- `DefaultNestApplicationListener` - Starts HTTP server
- `ProjectUtils` - Project configuration and utilities

**When to create**: Rarely - these are provided by nestjs-mod

#### 2. Core Modules (`NestModuleCategory.core`)
**Purpose**: Foundational services and data access

**Examples**:
- Database repositories
- Authentication providers
- Email services
- File storage services

**When to create**: When building shared services used across multiple features

**Structure**:
```typescript
import { createNestModule, NestModuleCategory, ConfigModel, EnvModel } from '@nestjs-mod/common';

@EnvModel()
export class DatabaseCoreEnvironments {
  @EnvModelProperty({ 
    description: 'Database connection string',
    required: true 
  })
  databaseUrl: string;
}

@ConfigModel()
export class DatabaseCoreConfiguration {
  @ConfigModelProperty({ 
    description: 'Connection pool size',
    default: 10 
  })
  poolSize: number;
}

export const { DatabaseCoreModule } = createNestModule({
  moduleName: 'DatabaseCoreModule',
  moduleCategory: NestModuleCategory.core,
  environmentsModel: DatabaseCoreEnvironments,
  configurationModel: DatabaseCoreConfiguration,
  providers: [DatabaseService, DatabaseRepository],
  exports: [DatabaseService, DatabaseRepository],
});
```

#### 3. Feature Modules (`NestModuleCategory.feature`)
**Purpose**: Business logic and use cases

**Examples**:
- UsersModule - User management
- OrdersModule - Order processing
- ProductsModule - Product catalog

**When to create**: For each distinct business capability

**Structure**:
```typescript
import { createNestModule, NestModuleCategory, ConfigModel, EnvModel } from '@nestjs-mod/common';

@EnvModel()
export class UsersModuleEnvironments {
  @EnvModelProperty({ 
    description: 'JWT secret for user tokens',
    required: true 
  })
  jwtSecret: string;
}

@ConfigModel()
export class UsersModuleConfiguration {
  @ConfigModelProperty({ 
    description: 'Users table name',
    default: 'users' 
  })
  tableName: string;
  
  @ConfigModelProperty({ 
    description: 'Password hash rounds',
    default: 10 
  })
  hashRounds: number;
}

export const { UsersModule } = createNestModule({
  moduleName: 'UsersModule',
  moduleCategory: NestModuleCategory.feature,
  environmentsModel: UsersModuleEnvironments,
  configurationModel: UsersModuleConfiguration,
  imports: [
    DatabaseCoreModule.forRoot(),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersValidator],
  exports: [UsersService],
});
```

#### 4. Integration Modules (`NestModuleCategory.integrations`)
**Purpose**: Cross-module communication and event handling

**Examples**:
- User created → send welcome email
- Order placed → update inventory
- Payment received → generate invoice

**When to create**: When features need to interact without direct coupling

**Structure**:
```typescript
import { createNestModule, NestModuleCategory, OnEvent } from '@nestjs-mod/common';

export const { UserOrderIntegrationModule } = createNestModule({
  moduleName: 'UserOrderIntegrationModule',
  moduleCategory: NestModuleCategory.integrations,
  imports: [
    UsersModule.forFeature({ featureModuleName: 'UserOrderIntegration' }),
    OrdersModule.forFeature({ featureModuleName: 'UserOrderIntegration' }),
    NotificationsModule.forFeature({ featureModuleName: 'UserOrderIntegration' }),
  ],
  providers: [
    {
      provide: 'USER_ORDER_INTEGRATION',
      useFactory: (usersService, ordersService, notificationsService) => {
        // Integration logic
        return new UserOrderIntegration(
          usersService,
          ordersService,
          notificationsService
        );
      },
      inject: [UsersService, OrdersService, NotificationsService],
    },
  ],
});
```

#### 5. Infrastructure Modules (`NestModuleCategory.infrastructure`)
**Purpose**: External service configuration and deployment

**Examples**:
- Docker Compose configurations
- PM2 process management
- Kubernetes manifests
- CI/CD pipelines

**When to create**: When adding deployment or external service configuration

**Structure**:
```typescript
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

export const { DockerComposePostgresqlModule } = createNestModule({
  moduleName: 'DockerComposePostgresqlModule',
  moduleCategory: NestModuleCategory.infrastructure,
  providers: [DockerComposePostgresqlService],
});
```

## Creating a Complete Feature Module

### Step 1: Create Library with Schematic
```bash
./node_modules/.bin/nx g @nestjs-mod/schematics:library \
  --name=users \
  --buildable \
  --publishable \
  --directory=libs/users \
  --simpleName=true \
  --strict=true \
  --linter=eslint \
  --unitTestRunner=jest
```

### Step 2: Define Module Structure
```
libs/users/src/lib/
├── users.module.ts
├── users.configuration.ts
├── users.environments.ts
├── users.controller.ts
├── users.service.ts
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
└── entities/
    └── user.entity.ts
```

### Step 3: Create Configuration Model
```typescript
// users.configuration.ts
import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';

@ConfigModel()
export class UsersModuleConfiguration {
  @ConfigModelProperty({
    description: 'Users database table name',
    default: 'users',
  })
  tableName: string;

  @ConfigModelProperty({
    description: 'Enable user registration',
    default: true,
  })
  enableRegistration: boolean;

  @ConfigModelProperty({
    description: 'Maximum users per page in list',
    default: 20,
  })
  maxPageSize: number;
}
```

### Step 4: Create Environment Model
```typescript
// users.environments.ts
import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';

@EnvModel()
export class UsersModuleEnvironments {
  @EnvModelProperty({
    description: 'JWT secret key for token generation',
    required: true,
  })
  jwtSecret: string;

  @EnvModelProperty({
    description: 'JWT token expiration in seconds',
    default: 3600,
  })
  jwtExpiration: number;

  @EnvModelProperty({
    description: 'Admin email for notifications',
  })
  adminEmail: string;
}
```

### Step 5: Create Service
```typescript
// users.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { UsersModuleEnvironments } from './users.environments';
import { UsersModuleConfiguration } from './users.configuration';

@Injectable()
export class UsersService {
  constructor(
    private readonly config: UsersModuleConfiguration,
    private readonly env: UsersModuleEnvironments,
  ) {}

  async findAll(page: number = 1, limit: number = this.config.maxPageSize) {
    // Implementation
    return {
      data: [],
      total: 0,
      page,
      limit: Math.min(limit, this.config.maxPageSize),
    };
  }

  async create(createUserDto: any) {
    if (!this.config.enableRegistration) {
      throw new Error('Registration is disabled');
    }
    // Implementation
    return { id: '1', ...createUserDto };
  }
}
```

### Step 6: Create Controller
```typescript
// users.controller.ts
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

### Step 7: Create Module
```typescript
// users.module.ts
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersModuleConfiguration } from './users.configuration';
import { UsersModuleEnvironments } from './users.environments';

export const { 
  AppModule: UsersModule,
  AppAsyncModule: UsersModuleAsync,
  AppSettings: UsersModuleSettings,
  AppShared: UsersModuleShared,
} = createNestModule({
  moduleName: 'UsersModule',
  moduleDescription: 'User management feature module',
  moduleCategory: NestModuleCategory.feature,
  configurationModel: UsersModuleConfiguration,
  environmentsModel: UsersModuleEnvironments,
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
});
```

### Step 8: Export from Library
```typescript
// libs/users/src/index.ts
export * from './lib/users.module';
export * from './lib/users.configuration';
export * from './lib/users.environments';
export * from './lib/users.controller';
export * from './lib/users.service';
export * from './lib/dto/create-user.dto';
export * from './lib/dto/update-user.dto';
export * from './lib/entities/user.entity';
```

### Step 9: Use in Application
```typescript
// apps/server/src/app/app.module.ts
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { UsersModule } from '@nestjs-mod-example/users';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    UsersModule.forRoot({
      configuration: {
        tableName: 'app_users',
        enableRegistration: true,
        maxPageSize: 50,
      },
      environments: {
        jwtSecret: process.env.JWT_SECRET || 'secret',
        jwtExpiration: 3600,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
});
```

## Module Communication Patterns

### Pattern 1: Direct Import (Core → Feature)
```typescript
export const { OrdersModule } = createNestModule({
  moduleName: 'OrdersModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    DatabaseCoreModule.forRoot(),
    UsersModule.forFeature({ featureModuleName: 'Orders' }),
  ],
  // ...
});
```

### Pattern 2: ForFeature (Feature-specific config)
```typescript
export const { NotificationsModule } = createNestModule({
  moduleName: 'NotificationsModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    UsersModule.forFeature({
      featureModuleName: 'Notifications',
      featureConfiguration: {
        // Feature-specific config
      },
      featureEnvironments: {
        // Feature-specific env
      },
    }),
  ],
  // ...
});
```

### Pattern 3: Integration Module (Cross-feature)
```typescript
export const { UserNotificationIntegrationModule } = createNestModule({
  moduleName: 'UserNotificationIntegrationModule',
  moduleCategory: NestModuleCategory.integrations,
  imports: [
    UsersModule.forFeature({ featureModuleName: 'UserNotificationIntegration' }),
    NotificationsModule.forFeature({ featureModuleName: 'UserNotificationIntegration' }),
  ],
  providers: [UserNotificationIntegrationService],
});
```

## Configuration Patterns

### Static Configuration
Values known at compile time, passed when importing module:
```typescript
UsersModule.forRoot({
  staticConfiguration: {
    tableName: 'users',
    enableRegistration: true,
  },
});
```

### Dynamic Configuration
Values determined at runtime:
```typescript
UsersModule.forRootAsync({
  imports: [ConfigModule],
  configurationFactory: async (configService) => ({
    tableName: configService.get('USERS_TABLE'),
    enableRegistration: configService.get('ENABLE_REGISTRATION') === 'true',
  }),
  inject: [ConfigService],
});
```

### Environment Variables
Values from environment (auto-generated to .env):
```typescript
UsersModule.forRoot({
  environments: {
    jwtSecret: process.env.USERS_JWT_SECRET,
    jwtExpiration: Number(process.env.USERS_JWT_EXPIRATION) || 3600,
  },
});
```

## Best Practices

### 1. Module Naming
- Use descriptive names: `UsersModule`, `OrdersModule`
- Add suffix for category: `DatabaseCoreModule`, `UserOrderIntegrationModule`
- Use consistent prefixes for related modules

### 2. Configuration vs Environment
- **Configuration**: Complex objects, business rules, feature flags
- **Environment**: Connection strings, secrets, deployment-specific values

### 3. Module Exports
- Export only what other modules need
- Keep internal providers private
- Use shared providers for cross-cutting concerns

### 4. Dependencies
- Import modules in correct category order:
  1. System
  2. Core
  3. Feature
  4. Integration
  5. Infrastructure

### 5. Feature Module Isolation
- Each feature module should be independently testable
- Use `forFeature()` for feature-specific configuration
- Avoid direct dependencies between feature modules (use Integration modules)

## Testing Modules

### Unit Test Service
```typescript
describe('UsersService', () => {
  let service: UsersService;
  let config: UsersModuleConfiguration;
  let env: UsersModuleEnvironments;

  beforeEach(async () => {
    config = new UsersModuleConfiguration();
    config.tableName = 'users';
    config.enableRegistration = true;
    config.maxPageSize = 20;

    env = new UsersModuleEnvironments();
    env.jwtSecret = 'test-secret';
    env.jwtExpiration = 3600;

    service = new UsersService(config, env);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should respect maxPageSize', async () => {
    const result = await service.findAll(1, 100);
    expect(result.limit).toBe(20); // maxPageSize
  });
});
```

### Integration Test Module
```typescript
describe('UsersModule Integration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await wrapApplication({
      modules: {
        [NestModuleCategory.feature]: [UsersModule],
      },
      current: {
        category: NestModuleCategory.feature,
        index: 0,
        asyncModuleOptions: {
          environments: {
            jwtSecret: 'test-secret',
          },
        },
      },
    });

    app = module.app;
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should start application', () => {
    expect(app).toBeDefined();
  });
});
```

## Common Issues

### Issue: Module not generating environment variables
**Solution**: Ensure `@EnvModel()` decorator is used and module is registered properly

### Issue: Configuration not accessible in service
**Solution**: Inject configuration via constructor, check module exports

### Issue: Circular dependency between modules
**Solution**: Use Integration module pattern instead of direct imports

### Issue: forFeature() not working
**Solution**: Ensure module defines `featureConfigurationModel` and `featureEnvironmentsModel`
