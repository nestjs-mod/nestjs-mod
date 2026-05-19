# NestJS-Mod Quick Reference Guide

## Overview
Quick reference guide for common NestJS-mod operations, commands, and patterns.

## Project Setup Commands

### Create New Project
```bash
# Create NX workspace
npx --yes create-nx-workspace@20.3.0 --name=<project-name> --preset=apps --interactive=false --ci=skip
cd <project-name>

# Install NestJS-mod schematics
npm install --save-dev @nestjs-mod/schematics@latest

# Create backend application
./node_modules/.bin/nx g @nestjs-mod/schematics:application \
  --linter=eslint \
  --unitTestRunner=jest \
  --directory=apps/server \
  --name=server \
  --strict=true

# Create Angular admin panel (optional)
./node_modules/.bin/nx g @nx/angular:application \
  --directory=apps/admin \
  --name=admin \
  --routing=true \
  --style=less
```

### Create Feature Library
```bash
./node_modules/.bin/nx g @nestjs-mod/schematics:library \
  --name=<feature-name> \
  --buildable \
  --publishable \
  --directory=libs/<feature-name> \
  --simpleName=true \
  --strict=true
```

## Essential Commands

### Development Workflow
```bash
# Full preparation (generate, build, docs, test)
npm run manual:prepare

# Start backend in watch mode
npm run serve:dev:server

# Start frontend in watch mode (if exists)
npm run serve:dev:admin

# Start infrastructure (Docker Compose)
npm run docker-compose:start

# Start with PM2
npm run pm2:start

# Stop PM2
npm run pm2:stop
```

### Build & Production
```bash
# Build backend
npm run build:prod:server

# Build frontend
npm run build:prod:admin

# Start production server
npm run start:prod:server

# Start production Docker Compose
npm run docker-compose:prod:start
```

### Testing
```bash
# Run all tests
npm run test

# Run specific app tests
npm run test:server
npm run test:admin

# Run e2e tests
./node_modules/.bin/nx e2e <app-name>-e2e
```

### Code Quality
```bash
# Lint all code
npm run lint

# Lint and fix
npm run lint:fix

# TypeScript type check
npm run tsc:lint

# Generate TypeScript indexes
npm run make-ts-list
```

### Documentation
```bash
# Generate infrastructure documentation
npm run docs:infrastructure

# Generate dependency graph
npm run dep-graph
```

## Module Creation Pattern

### Basic Module Structure
```typescript
// libs/feature-name/src/lib/feature-name.module.ts
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { FeatureNameController } from './feature-name.controller';
import { FeatureNameService } from './feature-name.service';

export const {
  AppModule: FeatureNameModule,
  AppAsyncModule: FeatureNameModuleAsync,
  AppSettings: FeatureNameModuleSettings,
  AppShared: FeatureNameModuleShared,
} = createNestModule({
  moduleName: 'FeatureNameModule',
  moduleDescription: 'Description of feature',
  moduleCategory: NestModuleCategory.feature,
  controllers: [FeatureNameController],
  providers: [FeatureNameService],
  exports: [FeatureNameService],
});
```

### Module with Configuration
```typescript
import { createNestModule, NestModuleCategory, ConfigModel, EnvModel, ConfigModelProperty, EnvModelProperty } from '@nestjs-mod/common';

@ConfigModel()
export class FeatureNameConfiguration {
  @ConfigModelProperty({
    description: 'Configuration description',
    default: 'default-value',
  })
  settingName: string;
}

@EnvModel()
export class FeatureNameEnvironments {
  @EnvModelProperty({
    description: 'Environment variable description',
    required: true,
  })
  apiKey: string;
}

export const { FeatureNameModule } = createNestModule({
  moduleName: 'FeatureNameModule',
  moduleCategory: NestModuleCategory.feature,
  configurationModel: FeatureNameConfiguration,
  environmentsModel: FeatureNameEnvironments,
  controllers: [FeatureNameController],
  providers: [FeatureNameService],
});
```

## Module Categories

### 1. System Modules
```typescript
NestModuleCategory.system
```
- Core application initialization
- DefaultNestApplicationInitializer
- DefaultNestApplicationListener
- ProjectUtils

### 2. Core Modules
```typescript
NestModuleCategory.core
```
- Database connections
- Authentication providers
- Shared services

### 3. Feature Modules
```typescript
NestModuleCategory.feature
```
- Business logic
- Use cases
- Controllers and services

### 4. Integration Modules
```typescript
NestModuleCategory.integrations
```
- Cross-module communication
- Event handlers

### 5. Infrastructure Modules
```typescript
NestModuleCategory.infrastructure
```
- Docker Compose
- PM2
- Documentation generators

## Common Infrastructure Setup

### Docker Compose Configuration
```typescript
import { DockerCompose } from '@nestjs-mod/docker-compose';
import { DockerComposePostgresql } from '@nestjs-mod/docker-compose/lib/features/docker-compose-postgresql';
import { DockerComposeRedis } from '@nestjs-mod/docker-compose/lib/features/docker-compose-redis';

imports: [
  DockerCompose.forRoot({
    staticConfiguration: {
      dockerComposeFile: 'docker-compose.yml',
      exampleDockerComposeFile: 'docker-compose-example.yml',
      prodDockerComposeFile: 'docker-compose-prod.yml',
      prodDockerComposeEnvFile: 'docker-compose-prod.env',
    },
  }),
  DockerComposePostgresql.forRoot({
    staticConfiguration: {
      version: '15',
      databases: ['myapp_db'],
    },
  }),
  DockerComposeRedis.forRoot(),
]
```

### PM2 Configuration
```typescript
import { PM2 } from '@nestjs-mod/pm2';

imports: [
  PM2.forRoot({
    staticConfiguration: {
      ecosystemFile: 'ecosystem.config.json',
      watch: true,
      instances: 1,
    },
  }),
]
```

### Swagger Documentation
```typescript
import { SwaggerModule } from '@nestjs-mod/swagger';

imports: [
  SwaggerModule.forRoot({
    staticConfiguration: {
      swaggerPath: 'swagger',
      swaggerTitle: 'My API',
      swaggerDescription: 'API documentation',
    },
  }),
]
```

### Infrastructure Documentation
```typescript
import { InfrastructureMarkdownReportGenerator } from '@nestjs-mod/common';

imports: [
  InfrastructureMarkdownReportGenerator.forRoot({
    staticConfiguration: {
      markdownFile: 'INFRASTRUCTURE.MD',
      skipEmptySettings: true,
      style: 'full',
    },
  }),
]
```

## Application Module Example
```typescript
// apps/server/src/app/app.module.ts
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { DockerCompose } from '@nestjs-mod/docker-compose';
import { DockerComposePostgresql } from '@nestjs-mod/docker-compose/lib/features/docker-compose-postgresql';
import { PM2 } from '@nestjs-mod/pm2';
import { SwaggerModule } from '@nestjs-mod/swagger';
import { InfrastructureMarkdownReportGenerator } from '@nestjs-mod/common';
import { UsersModule } from '@myapp/users';
import { ProductsModule } from '@myapp/products';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    // Infrastructure
    DockerCompose.forRoot(),
    DockerComposePostgresql.forRoot(),
    PM2.forRoot(),
    SwaggerModule.forRoot(),
    InfrastructureMarkdownReportGenerator.forRoot(),
    
    // Features
    UsersModule.forRoot({
      configuration: {
        tableName: 'users',
      },
    }),
    ProductsModule.forRoot({
      configuration: {
        tableName: 'products',
      },
    }),
  ],
});
```

## Environment Variables

### Definition
```typescript
@EnvModel()
export class MyModuleEnvironments {
  @EnvModelProperty({
    description: 'API Key',
    required: true,
  })
  apiKey: string;

  @EnvModelProperty({
    description: 'Timeout',
    default: 5000,
  })
  timeout: number;
}
```

### Usage in .env
```env
MY_MODULE_API_KEY=your-api-key
MY_MODULE_TIMEOUT=5000
```

## Configuration Models

### Definition
```typescript
@ConfigModel()
export class MyModuleConfiguration {
  @ConfigModelProperty({
    description: 'Table name',
    default: 'my_table',
  })
  tableName: string;

  @ConfigModelProperty({
    description: 'Enable feature',
    default: true,
  })
  enableFeature: boolean;
}
```

### Usage
```typescript
MyModule.forRoot({
  configuration: {
    tableName: 'custom_table',
    enableFeature: false,
  },
})
```

## REST API Patterns

### CRUD Controller
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';

@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.resourceService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourceService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateResourceDto) {
    return this.resourceService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
    return this.resourceService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.resourceService.delete(id);
  }
}
```

## Frontend Patterns

### API Client Service
```typescript
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    private http: HttpClient,
    @Inject('API_URL') private baseUrl: string
  ) {}

  getItems() {
    return this.http.get(`${this.baseUrl}/items`);
  }

  createItem(item: any) {
    return this.http.post(`${this.baseUrl}/items`, item);
  }
}
```

### Auth Guard
```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
```

## File Structure

### Complete Project Structure
```
project-name/
├── apps/
│   ├── server/                    # Backend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   └── app.module.ts
│   │   │   └── main.ts
│   │   ├── webpack.config.js
│   │   └── project.json
│   └── admin/                     # Frontend (optional)
│       ├── src/
│       │   ├── app/
│       │   └── main.ts
│       └── webpack.config.js
├── libs/
│   ├── feature-1/                 # Feature library
│   │   └── src/
│   │       ├── lib/
│   │       └── index.ts
│   └── feature-2/
├── docker-compose.yml
├── docker-compose-example.yml
├── docker-compose-prod.yml
├── .env
├── example.env
├── INFRASTRUCTURE.MD
├── ecosystem.config.json
├── package.json
├── tsconfig.base.json
└── rucken.json
```

## Package.json Scripts Reference
```json
{
  "scripts": {
    "manual:prepare": "npm run generate && npm run tsc:lint && npm run build && npm run docs:infrastructure && npm run test",
    "generate": "nx run-many --all -t=generate && npm run make-ts-list && npm run lint:fix",
    "make-ts-list": "rucken make-ts-list",
    
    "serve:dev:server": "nx serve server",
    "serve:dev:admin": "nx serve admin",
    
    "build:prod:server": "nx build server --configuration=production",
    "build:prod:admin": "nx build admin --configuration=production",
    
    "start:prod:server": "node dist/apps/server/main.js",
    
    "pm2:start": "pm2 start ./ecosystem.config.json",
    "pm2:stop": "pm2 delete all",
    
    "docker-compose:start": "docker compose -f ./docker-compose.yml up -d",
    "docker-compose:stop": "docker compose -f ./docker-compose.yml down",
    
    "docs:infrastructure": "export NESTJS_MODE=infrastructure && nx run-many --all -t=start",
    
    "test": "nx run-many --all -t=test",
    "lint": "nx run-many --all -t=lint",
    "lint:fix": "nx run-many --all -t=lint --fix",
    "tsc:lint": "tsc --noEmit -p tsconfig.base.json"
  }
}
```

## Troubleshooting Quick Fixes

### Module Not Found
```bash
# Build the library
npm run build <lib-name>

# Check tsconfig.base.json paths
# Verify exports in libs/<name>/src/index.ts
```

### Environment Variables Not Loading
```bash
# Check .env file exists
# Verify @EnvModel() decorator
# Ensure dotenv is loaded: node -r dotenv/config
```

### Docker Compose Not Generating
```bash
# Set infrastructure mode
export NESTJS_MODE=infrastructure

# Run generation
npm run docs:infrastructure
```

### CORS Errors
```typescript
// Add to app.module.ts
DefaultNestApplicationListener.forRoot({
  staticConfiguration: {
    cors: {
      origin: 'http://localhost:4200',
      credentials: true,
    },
  },
})
```

### TypeScript Errors
```bash
# Run type checking
npm run tsc:lint

# Fix linting issues
npm run lint:fix
```

## Useful Links

- **NestJS-mod Docs**: https://nestjs-mod.com
- **NestJS Docs**: https://nestjs.com
- **NX Docs**: https://nx.dev
- **GitHub Examples**: https://github.com/nestjs-mod/nestjs-mod-contrib

## Common Docker Compose Services

### PostgreSQL
```typescript
DockerComposePostgresql.forRoot({
  staticConfiguration: {
    version: '15',
    databases: ['myapp_db'],
  },
})
```

### Redis
```typescript
DockerComposeRedis.forRoot({
  staticConfiguration: {
    version: '7',
  },
})
```

### Minio
```typescript
DockerComposeMinio.forRoot({
  staticConfiguration: {
    version: 'latest',
    buckets: ['uploads'],
  },
})
```

### NATS
```typescript
DockerComposeNats.forRoot({
  staticConfiguration: {
    version: 'latest',
  },
})
```

## Testing Patterns

### Unit Test
```typescript
describe('MyService', () => {
  let service: MyService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MyService],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### E2E Test
```typescript
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World');
  });
});
```

## Best Practices Checklist

- [ ] Use `@nestjs-mod/schematics` for generating apps and libraries
- [ ] Define configuration with `@ConfigModel()`
- [ ] Define environment variables with `@EnvModel()`
- [ ] Use appropriate module categories
- [ ] Export only necessary items from libraries
- [ ] Write tests for all services
- [ ] Run `npm run manual:prepare` before committing
- [ ] Keep INFRASTRUCTURE.MD updated
- [ ] Use Swagger for API documentation
- [ ] Separate dev and prod configurations
- [ ] Never commit production secrets
- [ ] Use TypeScript strict mode

## Environment Variable Naming Convention

Pattern: `<MODULE_NAME>_<VARIABLE_NAME>`

Examples:
```env
USERS_JWT_SECRET=secret
USERS_JWT_EXPIRATION=3600
PRODUCTS_CACHE_TTL=300
ORDOMS_WEBHOOK_URL=https://example.com/webhook
```

## Module Naming Convention

- **Module**: `FeatureNameModule`
- **Configuration**: `FeatureNameConfiguration`
- **Environments**: `FeatureNameEnvironments`
- **Service**: `FeatureNameService`
- **Controller**: `FeatureNameController`
- **DTO**: `CreateFeatureNameDto`, `UpdateFeatureNameDto`

## Quick Start Template

For rapid project creation:

```bash
#!/bin/bash
# create-nestjs-mod.sh

PROJECT_NAME=$1

# Create workspace
npx --yes create-nx-workspace@20.3.0 --name=$PROJECT_NAME --preset=apps --interactive=false
cd $PROJECT_NAME

# Install dependencies
npm install --save-dev @nestjs-mod/schematics@latest
npm install @nestjs-mod/common @nestjs-mod/fastify @nestjs-mod/docker-compose @nestjs-mod/pm2

# Create server
./node_modules/.bin/nx g @nestjs-mod/schematics:application --directory=apps/server --name=server --strict=true

echo "Project $PROJECT_NAME created successfully!"
echo "Run: npm run manual:prepare"
```

Usage:
```bash
chmod +x create-nestjs-mod.sh
./create-nestjs-mod.sh my-new-project
```
