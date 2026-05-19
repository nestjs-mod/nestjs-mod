# NestJS-Mod Project Generator Skill

## Overview
This skill helps you create complete NestJS-mod projects with infrastructure (Docker Compose, PM2), backends, and admin panels from a formal project description.

## When to Use
- User wants to create a new NestJS-mod project
- User describes a project formally and wants infrastructure generated
- User needs a fullstack application with backend, admin panel, and Docker setup

## Workflow

### Step 1: Gather Project Requirements
Ask the user for:
1. **Project name** (e.g., "my-app")
2. **Project description** (e.g., "E-commerce platform")
3. **Application types needed**:
   - Backend API server
   - Admin panel (Angular)
   - Microservices
   - SSO/Authorizer
   - GraphQL API
4. **Infrastructure requirements**:
   - Database (PostgreSQL, MySQL, MongoDB)
   - Cache (Redis, Keyv)
   - Message broker (NATS, RabbitMQ)
   - Storage (Minio, S3)
   - Mail server (Maildev)
5. **Deployment mode**:
   - PM2 (port-based)
   - Docker Compose (containerized)
   - Kubernetes

### Step 2: Create NX Workspace
```bash
# Create empty nx project
npx --yes create-nx-workspace@20.3.0 --name=<project-name> --preset=apps --interactive=false --ci=skip

# Go to created project
cd <project-name>
```

### Step 3: Install NestJS-Mod Schematics
```bash
# Install all need main dev-dependencies
npm install --save-dev @nestjs-mod/schematics@latest
```

### Step 4: Generate Applications
Based on requirements, generate the needed applications:

```bash
# Create NestJS-mod application (backend server)
./node_modules/.bin/nx g @nestjs-mod/schematics:application \
  --linter=eslint \
  --unitTestRunner=jest \
  --directory=apps/server \
  --name=server \
  --strict=true

# Create Angular admin panel (if needed)
./node_modules/.bin/nx g @nx/angular:application \
  --directory=apps/admin \
  --name=admin \
  --strict=true \
  --minimal=true \
  --prefix=app \
  --style=less \
  --ssr=true \
  --viewEncapsulation=None \
  --e2eTestRunner=none \
  --bundler=webpack
```

### Step 5: Add Infrastructure Libraries
Install needed infrastructure libraries from nestjs-mod-contrib:

```bash
# Database (Prisma + PostgreSQL + Flyway)
npm install @nestjs-mod/prisma @nestjs-mod/postgresql @nestjs-mod/flyway

# Cache
npm install @nestjs-mod/redis @nestjs-mod/keyv

# Message Broker
npm install @nestjs-mod/nats

# Storage
npm install @nestjs-mod/minio

# Docker Compose infrastructure generator
npm install @nestjs-mod/docker-compose
```

### Step 6: Create Libraries for Features
```bash
# Create NestJS-mod library
./node_modules/.bin/nx g @nestjs-mod/schematics:library \
  --name=feature-name \
  --buildable \
  --publishable \
  --directory=libs/feature-name \
  --simpleName=true \
  --strict=true \
  --linter=eslint \
  --unitTestRunner=jest
```

### Step 7: Configure Project
Create/update these key files:

#### `package.json` - Add scripts
```json
{
  "scripts": {
    "manual:prepare": "npm run generate && npm run tsc:lint && npm run build && npm run docs:infrastructure && npm run test",
    "docs:infrastructure": "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@<project-name>/source --all -t=start --parallel=1",
    "serve:dev:server": "./node_modules/.bin/nx serve server --skip-nx-cache=true",
    "build:prod:server": "./node_modules/.bin/nx build server --configuration=production",
    "start:prod:server": "node dist/apps/server/main.js"
  }
}
```

#### `rucken.json` - Configure TypeScript list generation
```json
{
  "makeTsList": {
    "indexFileName": "index",
    "excludes": [
      "test-setup.ts",
      "*node_modules*",
      "*public_api.ts*",
      "*.spec*",
      "environment*",
      "*e2e*",
      "*.stories.ts",
      "*.d.ts"
    ]
  }
}
```

#### `.env` - Environment variables
Create example environment file with all needed variables.

### Step 8: Generate Infrastructure Documentation
```bash
# Build all applications and libraries
npm run build

# Generate markdown report and docker-compose files
npm run docs:infrastructure
```

This will automatically generate:
- `INFRASTRUCTURE.MD` - Complete infrastructure documentation
- `docker-compose.yml` - Development infrastructure
- `docker-compose-example.yml` - Example with placeholder values
- `docker-compose-prod.yml` - Production infrastructure
- `docker-compose-prod.env` - Production environment variables
- `ecosystem.config.json` - PM2 configuration

### Step 9: Start Development
```bash
# Prepare all files
npm run manual:prepare

# Start in development mode with PM2
npm run pm2:start

# Or start with Docker Compose
npm run docker-compose:start
```

## Module Categories

NestJS-mod uses 5 module categories:

1. **System** (`NestModuleCategory.system`)
   - Core application initialization
   - DefaultNestApplicationInitializer
   - DefaultNestApplicationListener
   - ProjectUtils

2. **Core** (`NestModuleCategory.core`)
   - Foundational business logic
   - Database connections
   - Authentication providers

3. **Feature** (`NestModuleCategory.feature`)
   - Business features
   - Use cases
   - Controllers and services

4. **Integration** (`NestModuleCategory.integrations`)
   - Cross-module communication
   - Event handlers
   - Integration between features

5. **Infrastructure** (`NestModuleCategory.infrastructure`)
   - Docker Compose generators
   - PM2 configuration
   - Documentation generators
   - External service configurations

## Example Module Structure

```typescript
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  controllers: [AppController],
  providers: [AppService],
});
```

## Key Commands Reference

### Development
- `npm run manual:prepare` - Full preparation (generate, build, docs, test)
- `npm run serve:dev:<app-name>` - Start app in watch mode
- `npm run pm2:start` - Start with PM2
- `npm run pm2:stop` - Stop PM2 processes

### Production
- `npm run build:prod:<app-name>` - Build application
- `npm run start:prod:<app-name>` - Start built application
- `npm run docker-compose:start` - Start with Docker Compose
- `npm run docker-compose:stop` - Stop Docker Compose

### Testing
- `npm run test` - Run all tests
- `npm run test:<app-name>` - Run specific app tests
- `npm run e2e` - Run e2e tests

### Documentation
- `npm run docs:infrastructure` - Generate infrastructure docs
- `npm run dep-graph` - Generate dependency graph

### Code Quality
- `npm run lint` - Check code quality
- `npm run lint:fix` - Auto-fix issues
- `npm run tsc:lint` - TypeScript type checking

## Tips

1. **Always run `npm run manual:prepare`** before committing - it generates all necessary files
2. **Use schematics** for creating new applications and libraries - they follow the pattern
3. **Check INFRASTRUCTURE.MD** after changes - it shows the complete project structure
4. **Environment variables** are auto-generated from module definitions
5. **Docker Compose** files are auto-generated based on infrastructure modules used

## Common Patterns

### Creating a Feature Module with Configuration
```typescript
import { createNestModule, NestModuleCategory, ConfigModel, EnvModel, ConfigModelProperty, EnvModelProperty } from '@nestjs-mod/common';

@ConfigModel()
export class UsersModuleConfiguration {
  @ConfigModelProperty({ description: 'Users table name' })
  tableName: string = 'users';
}

@EnvModel()
export class UsersModuleEnvironments {
  @EnvModelProperty({ description: 'Database connection string' })
  databaseUrl: string;
}

export const { UsersModule } = createNestModule({
  moduleName: 'UsersModule',
  moduleCategory: NestModuleCategory.feature,
  configurationModel: UsersModuleConfiguration,
  environmentsModel: UsersModuleEnvironments,
  controllers: [UsersController],
  providers: [UsersService],
});
```

### Adding Docker Compose Service
The Docker Compose infrastructure modules automatically add services based on what you import:
- Import `DockerComposePostgresql` → adds PostgreSQL service
- Import `DockerComposeRedis` → adds Redis service
- Import `DockerComposeMinio` → adds Minio service

## Troubleshooting

### Issue: Docker Compose not generating
- Ensure infrastructure mode is enabled: `export NESTJS_MODE=infrastructure`
- Check that infrastructure modules are imported in your app module
- Run `npm run docs:infrastructure` explicitly

### Issue: Environment variables missing
- Check that `@EnvModel()` decorated classes are defined
- Ensure module is properly registered with `createNestModule()`
- Run `npm run manual:prepare` to regenerate .env files

### Issue: Module not found
- Verify library path in `tsconfig.base.json`
- Check that library is buildable: `npm run build <lib-name>`
- Ensure exports are in `public_api.ts` or `index.ts`
