# NestJS-Mod Infrastructure Generation Skill

## Overview
This skill helps you generate and manage infrastructure for NestJS-mod applications including Docker Compose, PM2 configurations, environment files, and infrastructure documentation.

## When to Use
- Setting up development/production infrastructure
- Generating Docker Compose files for databases, caches, message brokers
- Creating PM2 configurations for process management
- Generating comprehensive infrastructure documentation
- Managing environment variables across deployments

## Infrastructure Generation Workflow

### Step 1: Install Infrastructure Libraries
```bash
# Core infrastructure generator
npm install @nestjs-mod/docker-compose @nestjs-mod/pm2

# Database infrastructure
npm install @nestjs-mod/prisma @nestjs-mod/postgresql @nestjs-mod/flyway

# Cache infrastructure
npm install @nestjs-mod/redis @nestjs-mod/keyv

# Message broker infrastructure
npm install @nestjs-mod/nats @nestjs-mod/rabbitmq

# Storage infrastructure
npm install @nestjs-mod/minio

# Mail infrastructure
npm install @nestjs-mod/maildev
```

### Step 2: Configure Infrastructure Module
```typescript
// apps/server/src/app/app.module.ts
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { DockerCompose } from '@nestjs-mod/docker-compose';
import { DockerComposePostgresql } from '@nestjs-mod/docker-compose/lib/features/docker-compose-postgresql';
import { DockerComposeRedis } from '@nestjs-mod/docker-compose/lib/features/docker-compose-redis';
import { PM2 } from '@nestjs-mod/pm2';
import { InfrastructureMarkdownReportGenerator } from '@nestjs-mod/common';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    // Infrastructure modules
    DockerCompose.forRoot({
      staticConfiguration: {
        dockerComposeFile: 'docker-compose.yml',
        exampleDockerComposeFile: 'docker-compose-example.yml',
        prodDockerComposeFile: 'docker-compose-prod.yml',
        prodDockerComposeEnvFile: 'docker-compose-prod.env',
      },
    }),
    DockerComposePostgresql.forRoot(),
    DockerComposeRedis.forRoot(),
    
    // PM2 configuration
    PM2.forRoot(),
    
    // Infrastructure documentation
    InfrastructureMarkdownReportGenerator.forRoot({
      staticConfiguration: {
        markdownFile: 'INFRASTRUCTURE.MD',
        skipEmptySettings: true,
        style: 'full',
      },
    }),
    
    // Your feature modules
    UsersModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
});
```

### Step 3: Run Infrastructure Generation
```bash
# Build the application first
npm run build

# Generate infrastructure files
export NESTJS_MODE=infrastructure
npm run start:prod:server

# Or use the dedicated script
npm run docs:infrastructure
```

### Step 4: Verify Generated Files
After running infrastructure generation, you should have:

```
your-project/
├── docker-compose.yml              # Development infrastructure
├── docker-compose-example.yml      # Example with placeholders
├── docker-compose-prod.yml         # Production infrastructure
├── docker-compose-prod.env         # Production environment variables (template)
├── .env                            # Development environment variables
├── example.env                     # Example environment variables
├── INFRASTRUCTURE.MD               # Complete infrastructure documentation
├── ecosystem.config.json           # PM2 configuration
└── ecosystem-prod.config.json      # PM2 production configuration
```

## Docker Compose Services

### Available Services

#### PostgreSQL
```typescript
import { DockerComposePostgresql } from '@nestjs-mod/docker-compose/lib/features/docker-compose-postgresql';

// In your module
imports: [
  DockerComposePostgresql.forRoot({
    staticConfiguration: {
      version: '15',
      databases: ['myapp_db'],
      networks: [{ name: 'backend-network', driver: 'bridge' }],
    },
  }),
]
```

**Generated Docker Compose**:
```yaml
services:
  postgresql:
    image: postgres:15
    container_name: myapp-postgresql
    environment:
      POSTGRES_DB: myapp_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${MYAPP_POSTGRESQL_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgresql-data:/var/lib/postgresql/data
    networks:
      - myapp-network

volumes:
  postgresql-data:
```

#### Redis
```typescript
import { DockerComposeRedis } from '@nestjs-mod/docker-compose/lib/features/docker-compose-redis';

imports: [
  DockerComposeRedis.forRoot({
    staticConfiguration: {
      version: '7',
    },
  }),
]
```

#### Minio (S3-compatible storage)
```typescript
import { DockerComposeMinio } from '@nestjs-mod/docker-compose/lib/features/docker-compose-minio';

imports: [
  DockerComposeMinio.forRoot({
    staticConfiguration: {
      version: 'latest',
      buckets: ['uploads', 'documents'],
    },
  }),
]
```

#### NATS (Message Broker)
```typescript
import { DockerComposeNats } from '@nestjs-mod/docker-compose/lib/features/docker-compose-nats';

imports: [
  DockerComposeNats.forRoot({
    staticConfiguration: {
      version: 'latest',
    },
  }),
]
```

#### Maildev (Email testing)
```typescript
import { DockerComposeMaildev } from '@nestjs-mod/docker-compose/lib/features/docker-compose-maildev';

imports: [
  DockerComposeMaildev.forRoot({
    staticConfiguration: {
      version: 'latest',
    },
  }),
]
```

### Custom Docker Compose Service
```typescript
import { Injectable } from '@nestjs/common';
import { DockerComposeFeaturesConfiguration } from '@nestjs-mod/docker-compose';

@Injectable()
export class CustomDockerComposeService implements DockerComposeFeaturesConfiguration {
  getDockerComposeFeatureConfigurations() {
    return [
      {
        services: {
          'custom-service': {
            image: 'custom-image:latest',
            container_name: 'myapp-custom',
            environment: {
              CUSTOM_VAR: '${MYAPP_CUSTOM_VAR:-default}',
            },
            ports: ['8080:8080'],
            volumes: ['custom-data:/data'],
            networks: ['myapp-network'],
          },
        },
      },
    ];
  }
}
```

## PM2 Configuration

### Development Configuration
```typescript
import { PM2 } from '@nestjs-mod/pm2';

imports: [
  PM2.forRoot({
    staticConfiguration: {
      ecosystemFile: 'ecosystem.config.json',
      watch: true,
      instances: 1,
      execMode: 'cluster',
    },
  }),
]
```

**Generated `ecosystem.config.json`**:
```json
{
  "apps": [
    {
      "name": "server",
      "script": "./node_modules/.bin/nx serve server --skip-nx-cache=true",
      "node_args": "-r dotenv/config",
      "watch": true,
      "instances": 1
    }
  ]
}
```

### Production Configuration
```typescript
imports: [
  PM2.forRoot({
    staticConfiguration: {
      ecosystemFile: 'ecosystem-prod.config.json',
      watch: false,
      instances: 'max',
      execMode: 'cluster',
    },
  }),
]
```

**Generated `ecosystem-prod.config.json`**:
```json
{
  "apps": [
    {
      "name": "server",
      "script": "dist/apps/server/main.js",
      "instances": "max",
      "exec_mode": "cluster",
      "node_args": "-r dotenv/config"
    }
  ]
}
```

### PM2 Commands
```bash
# Start in development mode
npm run pm2:start

# Start in production mode
npm run pm2:prod:start

# Stop all processes
npm run pm2:stop

# Restart processes
npm run pm2:restart

# View logs
npm run pm2:logs

# Monitor processes
npm run pm2:monit
```

## Environment Variables Management

### Auto-Generation
NestJS-mod automatically generates environment variables from your module definitions:

```typescript
@EnvModel()
export class UsersModuleEnvironments {
  @EnvModelProperty({
    description: 'JWT secret key',
    required: true,
  })
  jwtSecret: string;

  @EnvModelProperty({
    description: 'JWT expiration in seconds',
    default: 3600,
  })
  jwtExpiration: number;
}
```

**Generated in `.env`**:
```env
# UsersModule
USERS_JWT_SECRET=your-secret-key-here
USERS_JWT_EXPIRATION=3600
```

### Environment File Structure

#### `.env` (Development)
```env
# Server
SERVER_PORT=3000
SERVER_HOSTNAME=localhost

# PostgreSQL
MYAPP_POSTGRESQL_PASSWORD=postgres
MYAPP_POSTGRESQL_DATABASE=myapp_db

# Redis
MYAPP_REDIS_URL=redis://localhost:6379

# Users Module
USERS_JWT_SECRET=dev-secret-key
USERS_JWT_EXPIRATION=3600
```

#### `example.env` (Template)
```env
# Server
SERVER_PORT=
SERVER_HOSTNAME=

# PostgreSQL
MYAPP_POSTGRESQL_PASSWORD=
MYAPP_POSTGRESQL_DATABASE=

# Users Module
USERS_JWT_SECRET=
USERS_JWT_EXPIRATION=
```

#### `docker-compose-prod.env` (Production)
```env
# Server
SERVER_PORT=3000
SERVER_HOSTNAME=0.0.0.0

# PostgreSQL
MYAPP_POSTGRESQL_PASSWORD=secure-production-password
MYAPP_POSTGRESQL_DATABASE=myapp_db

# Users Module
USERS_JWT_SECRET=production-secret-key
USERS_JWT_EXPIRATION=3600
```

## Infrastructure Documentation

### INFRASTRUCTURE.MD Generation
The `InfrastructureMarkdownReportGenerator` creates comprehensive documentation:

```bash
npm run docs:infrastructure
```

**Generated documentation includes**:
- Project overview
- Installation instructions
- All available scripts with descriptions
- System modules with configurations
- Feature modules with environments and configurations
- Integration modules
- Infrastructure modules
- Environment variables reference
- Maintainers and license info

### Example INFRASTRUCTURE.MD Structure
```markdown
# Project Name
> Version: 1.0.0

Project description

## Installation
```bash
git clone <repo-url>
cd <project-name>
npm install
```

## Running the app in watch mode
```bash
npm run manual:prepare
npm run serve:dev:server
```

## All scripts
| Script | Description |
| --- | --- |
| **dev infra** | |
| `npm run serve:dev:server` | Running server in watch mode |
| **prod infra** | |
| `npm run start:prod:server` | Launching built server |

## System modules
### DefaultNestApplicationInitializer
...

## Feature modules
### UsersModule
#### Environments
| Key | Description | Default | Value |
| --- | --- | --- | --- |
| `jwtSecret` | JWT secret key | - | `dev-secret` |

## Infrastructure modules
### DockerCompose
...
```

## Deployment Modes

### Mode 1: PM2 (Port-based)
Best for: Simple deployments, VPS, dedicated servers

```bash
# Prepare
npm run manual:prepare

# Start
npm run pm2:prod:start

# Access
# http://your-server:3000
```

### Mode 2: Docker Compose (Containerized)
Best for: Development, staging, isolated environments

```bash
# Prepare
npm run manual:prepare

# Start infrastructure
npm run docker-compose:start

# Start application
npm run pm2:prod:start

# Or run everything in containers
npm run docker-compose-full:prod:start

# Access
# http://localhost:8080
```

### Mode 3: Kubernetes
Best for: Production, scaling, cloud deployment

```bash
# Generate Kubernetes manifests
npm run k8s:generate

# Deploy
kubectl apply -f k8s/
```

## Common Infrastructure Patterns

### Pattern 1: Full Stack with Database
```typescript
imports: [
  // Infrastructure
  DockerCompose.forRoot(),
  DockerComposePostgresql.forRoot(),
  DockerComposeRedis.forRoot(),
  PM2.forRoot(),
  InfrastructureMarkdownReportGenerator.forRoot(),
  
  // Core
  DatabaseCoreModule.forRootAsync({
    imports: [DockerComposePostgresql],
    configurationFactory: async () => ({
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/myapp',
    }),
  }),
  CacheCoreModule.forRootAsync({
    imports: [DockerComposeRedis],
    configurationFactory: async () => ({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    }),
  }),
  
  // Features
  UsersModule,
  OrdersModule,
]
```

### Pattern 2: Microservices with NATS
```typescript
imports: [
  DockerCompose.forRoot(),
  DockerComposeNats.forRoot(),
  DockerComposePostgresql.forRoot(),
  
  NatsMicroserviceModule.forRoot({
    staticConfiguration: {
      url: process.env.NATS_URL || 'nats://localhost:4222',
    },
  }),
  
  UsersModule,
  OrdersModule,
  PaymentsModule,
]
```

### Pattern 3: SSO + Authorizer
```typescript
imports: [
  DockerCompose.forRoot(),
  DockerComposePostgresql.forRoot(),
  DockerComposeRedis.forRoot(),
  
  SsoModule.forRoot({
    staticConfiguration: {
      issuer: process.env.SSO_ISSUER,
      clientId: process.env.SSO_CLIENT_ID,
      clientSecret: process.env.SSO_CLIENT_SECRET,
    },
  }),
  
  AuthorizerModule.forRoot({
    staticConfiguration: {
      jwtSecret: process.env.JWT_SECRET,
    },
  }),
  
  UsersModule,
  RolesModule,
  PermissionsModule,
]
```

## Troubleshooting

### Issue: Docker Compose not generating
**Solution**:
1. Check `NESTJS_MODE=infrastructure` is set
2. Ensure Docker Compose module is imported
3. Run `npm run docs:infrastructure` explicitly
4. Check application builds successfully

### Issue: Environment variables missing
**Solution**:
1. Verify `@EnvModel()` decorators are present
2. Check module is registered in `imports` array
3. Run `npm run manual:prepare` to regenerate
4. Check `.env` file is not in `.gitignore`

### Issue: PM2 not starting
**Solution**:
1. Check `ecosystem.config.json` exists
2. Verify script paths are correct
3. Run `pm2 logs` to see errors
4. Check Node.js version matches requirements

### Issue: Ports already in use
**Solution**:
1. Check `docker-compose.yml` port mappings
2. Modify ports in module configuration:
```typescript
DockerComposePostgresql.forRoot({
  staticConfiguration: {
    port: 5433, // Change from default 5432
  },
})
```

### Issue: Infrastructure documentation incomplete
**Solution**:
1. Ensure all modules use `createNestModule()`
2. Check `moduleCategory` is set for each module
3. Verify modules are imported in AppModule
4. Run with `style: 'full'` configuration

## Best Practices

### 1. Separate Dev and Prod Configs
- Use `docker-compose.yml` for development
- Use `docker-compose-prod.yml` for production
- Never commit production secrets

### 2. Use Environment Models
- Define all environment variables in `@EnvModel()` classes
- Set sensible defaults
- Mark required fields explicitly

### 3. Version Control
```gitignore
# Commit
docker-compose.yml
docker-compose-example.yml
example.env

# Don't commit
.env
docker-compose-prod.env
docker-compose-prod.yml
```

### 4. Infrastructure Documentation
- Run `npm run docs:infrastructure` before each release
- Review INFRASTRUCTURE.MD for accuracy
- Use it as deployment guide

### 5. Testing Infrastructure
```bash
# Test infrastructure locally
npm run docker-compose:start
npm run serve:dev:server

# Run integration tests
npm run test:integrations

# Test production build
npm run docker-compose-full:prod:start
```
