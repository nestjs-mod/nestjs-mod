# NestJS-Mod Project Specification to Deployment Skill

## Overview
This skill transforms formal project specifications into complete, deployable NestJS-mod applications with Docker Compose infrastructure, backend APIs, and admin panels. It provides a systematic approach to go from requirements to a fully functional application.

## When to Use
- User wants to describe a project formally and get a complete setup
- Converting business requirements into technical implementation
- Rapid prototyping with full infrastructure
- Creating production-ready applications from specifications

## Input: Project Specification Template

When a user provides a project specification, gather this information:

### Required Information
```yaml
Project Name: my-app
Project Description: Brief description of the application

Modules/Features:
  - Users Management
  - Product Catalog
  - Order Processing
  - Payment Integration

Database: postgresql (postgresql/mysql/mongodb)
Cache: redis (redis/keyv/none)
Message Broker: nats (nats/rabbitmq/none)
File Storage: minio (minio/s3/none)
Authentication: sso/jwt/none
Admin Panel: angular/react/vue/none

Deployment:
  - PM2 (port-based)
  - Docker Compose (containerized)
  - Kubernetes (cloud-native)

Environment:
  - Development (local)
  - Staging (testing)
  - Production (live)
```

## Step-by-Step Implementation Workflow

### Phase 1: Project Initialization

#### Step 1.1: Create Workspace
```bash
# Create NX workspace
npx --yes create-nx-workspace@20.3.0 \
  --name=<project-name> \
  --preset=apps \
  --interactive=false \
  --ci=skip

cd <project-name>
```

#### Step 1.2: Install Core Dependencies
```bash
# NestJS-mod core
npm install --save-dev @nestjs-mod/schematics@latest
npm install @nestjs-mod/common @nestjs-mod/fastify

# Infrastructure libraries (based on requirements)
npm install @nestjs-mod/docker-compose @nestjs-mod/pm2

# Database (choose based on spec)
# PostgreSQL
npm install @nestjs-mod/prisma @nestjs-mod/postgresql @nestjs-mod/flyway @prisma/client
# OR MySQL
npm install @nestjs-mod/mysql
# OR MongoDB
npm install @nestjs-mod/mongodb

# Cache (if required)
npm install @nestjs-mod/redis

# Message Broker (if required)
npm install @nestjs-mod/nats

# Storage (if required)
npm install @nestjs-mod/minio

# Authentication (if required)
npm install @nestjs-mod/sso @nestjs-mod/authorizer

# Documentation
npm install @nestjs-mod/swagger
```

#### Step 1.3: Create Applications
```bash
# Backend server
./node_modules/.bin/nx g @nestjs-mod/schematics:application \
  --linter=eslint \
  --unitTestRunner=jest \
  --directory=apps/server \
  --name=server \
  --strict=true

# Admin panel (if specified)
./node_modules/.bin/nx g @nx/angular:application \
  --directory=apps/admin \
  --name=admin \
  --strict=true \
  --minimal=false \
  --prefix=admin \
  --style=less \
  --routing=true \
  --e2eTestRunner=cypress \
  --bundler=webpack
```

### Phase 2: Backend Module Development

#### Step 2.1: Create Feature Libraries
For each module in the specification:

```bash
# Example: Users module
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

#### Step 2.2: Define Module Configuration & Environments

For each feature module, create:

**Configuration Model** (`libs/users/src/lib/users.configuration.ts`):
```typescript
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
    description: 'Password minimum length',
    default: 8,
  })
  minPasswordLength: number;
}
```

**Environment Model** (`libs/users/src/lib/users.environments.ts`):
```typescript
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
    description: 'Admin notification email',
  })
  adminEmail: string;
}
```

#### Step 2.3: Implement Service Layer

**Service** (`libs/users/src/lib/users.service.ts`):
```typescript
import { Injectable } from '@nestjs/common';
import { UsersModuleConfiguration } from './users.configuration';
import { UsersModuleEnvironments } from './users.environments';

@Injectable()
export class UsersService {
  constructor(
    private readonly config: UsersModuleConfiguration,
    private readonly env: UsersModuleEnvironments
  ) {}

  async findAll(page: number = 1, limit: number = 20) {
    // Implementation with pagination
    const effectiveLimit = Math.min(limit, this.config.maxPageSize || 20);
    // Database query logic here
    return {
      data: [], // Replace with actual data
      total: 0,
      page,
      limit: effectiveLimit,
    };
  }

  async create(createUserDto: any) {
    if (!this.config.enableRegistration) {
      throw new Error('Registration is disabled');
    }
    // Implementation
    return { id: '1', ...createUserDto };
  }

  async findById(id: string) {
    // Implementation
    return { id, email: 'user@example.com', name: 'User' };
  }

  async update(id: string, updateUserDto: any) {
    // Implementation
    return { id, ...updateUserDto };
  }

  async delete(id: string) {
    // Implementation
    return { success: true };
  }
}
```

#### Step 2.4: Implement Controller Layer

**Controller** (`libs/users/src/lib/users.controller.ts`):
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  async create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
```

#### Step 2.5: Create Module

**Module** (`libs/users/src/lib/users.module.ts`):
```typescript
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
  AppFeatureModule: UsersModuleFeature,
} = createNestModule({
  moduleName: 'UsersModule',
  moduleDescription: 'User management and authentication',
  moduleCategory: NestModuleCategory.feature,
  configurationModel: UsersModuleConfiguration,
  environmentsModel: UsersModuleEnvironments,
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
});
```

#### Step 2.6: Export from Library

**Index** (`libs/users/src/index.ts`):
```typescript
export * from './lib/users.module';
export * from './lib/users.configuration';
export * from './lib/users.environments';
export * from './lib/users.controller';
export * from './lib/users.service';
```

### Phase 3: Application Assembly

#### Step 3.1: Configure Main Application Module

**App Module** (`apps/server/src/app/app.module.ts`):
```typescript
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { DockerCompose } from '@nestjs-mod/docker-compose';
import { DockerComposePostgresql } from '@nestjs-mod/docker-compose/lib/features/docker-compose-postgresql';
import { DockerComposeRedis } from '@nestjs-mod/docker-compose/lib/features/docker-compose-redis';
import { PM2 } from '@nestjs-mod/pm2';
import { SwaggerModule } from '@nestjs-mod/swagger';
import { InfrastructureMarkdownReportGenerator } from '@nestjs-mod/common';

// Import your feature modules
import { UsersModule } from '@<project-name>/users';
import { ProductsModule } from '@<project-name>/products';
import { OrdersModule } from '@<project-name>/orders';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleDescription: 'Main application module',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    // Infrastructure
    DockerCompose.forRoot({
      staticConfiguration: {
        dockerComposeFile: 'docker-compose.yml',
        exampleDockerComposeFile: 'docker-compose-example.yml',
        prodDockerComposeFile: 'docker-compose-prod.yml',
        prodDockerComposeEnvFile: 'docker-compose-prod.env',
      },
    }),
    
    // Database
    DockerComposePostgresql.forRoot({
      staticConfiguration: {
        version: '15',
        databases: ['<project-name>_db'],
      },
    }),
    
    // Cache (if needed)
    DockerComposeRedis.forRoot({
      staticConfiguration: {
        version: '7',
      },
    }),
    
    // PM2
    PM2.forRoot(),
    
    // Swagger Documentation
    SwaggerModule.forRoot({
      staticConfiguration: {
        swaggerPath: 'swagger',
        swaggerTitle: '<Project Name> API',
        swaggerDescription: 'API documentation for <Project Name>',
      },
    }),
    
    // Infrastructure Documentation
    InfrastructureMarkdownReportGenerator.forRoot({
      staticConfiguration: {
        markdownFile: 'INFRASTRUCTURE.MD',
        skipEmptySettings: true,
        style: 'full',
      },
    }),
    
    // Feature Modules
    UsersModule.forRoot({
      configuration: {
        tableName: 'users',
        enableRegistration: true,
        minPasswordLength: 8,
      },
    }),
    
    ProductsModule.forRoot({
      configuration: {
        tableName: 'products',
        enableInventoryTracking: true,
      },
    }),
    
    OrdersModule.forRoot({
      configuration: {
        tableName: 'orders',
        autoGenerateInvoice: true,
      },
    }),
  ],
  controllers: [],
  providers: [],
});
```

#### Step 3.2: Configure Main Entry Point

**Main** (`apps/server/src/main.ts`):
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { wrapApplication } from '@nestjs-mod/common';

async function bootstrap() {
  const app = await wrapApplication({
    modules: {
      [NestModuleCategory.feature]: [AppModule],
    },
  });

  await app.start();
}

bootstrap();
```

### Phase 4: Frontend Admin Panel (If Specified)

#### Step 4.1: Create API Client Library
```bash
./node_modules/.bin/nx g @nx/angular:library \
  --directory=libs/api-client \
  --name=api-client \
  --simpleName=true \
  --buildable=true
```

**API Client Service** (`libs/api-client/src/lib/api-client.service.ts`):
```typescript
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface Order {
  id: string;
  userId: string;
  products: Array<{ productId: string; quantity: number }>;
  total: number;
  status: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject('API_URL') apiUrl: string
  ) {
    this.baseUrl = apiUrl;
  }

  // Users API
  getUsers(page = 1, limit = 20): Observable<{ data: User[]; total: number }> {
    return this.http.get<any>(`${this.baseUrl}/users?page=${page}&limit=${limit}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  // Products API
  getProducts(page = 1, limit = 20): Observable<{ data: Product[]; total: number }> {
    return this.http.get<any>(`${this.baseUrl}/products?page=${page}&limit=${limit}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`);
  }

  // Orders API
  getOrders(page = 1, limit = 20): Observable<{ data: Order[]; total: number }> {
    return this.http.get<any>(`${this.baseUrl}/orders?page=${page}&limit=${limit}`);
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${id}`);
  }

  updateOrderStatus(id: string, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/orders/${id}/status`, { status });
  }
}
```

#### Step 4.2: Implement Authentication

**Auth Service** (`apps/admin/src/app/auth/auth.service.ts`):
```typescript
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiClientService } from '@<project-name>/api-client';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiClient: ApiClientService,
    private router: Router
  ) {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.apiClient.http.post<any>('/auth/login', { email, password }).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
}
```

**Auth Guard** (`apps/admin/src/app/auth/auth.guard.ts`):
```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.isAuthenticated) {
      return true;
    }
    return this.router.createUrlTree(['/login']);
  }
}
```

#### Step 4.3: Create Admin Components

**Dashboard Component** (`apps/admin/src/app/dashboard/dashboard.component.ts`):
```typescript
import { Component, OnInit } from '@angular/core';
import { ApiClientService } from '@<project-name>/api-client';

@Component({
  selector: 'admin-dashboard',
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Users</h3>
          <p class="stat-value">{{ stats.totalUsers }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Products</h3>
          <p class="stat-value">{{ stats.totalProducts }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Orders</h3>
          <p class="stat-value">{{ stats.totalOrders }}</p>
        </div>
        <div class="stat-card">
          <h3>Revenue</h3>
          <p class="stat-value">${{ stats.revenue }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 20px; }
    .stats-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
      gap: 20px; 
      margin-top: 20px; 
    }
    .stat-card { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .stat-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
  `]
})
export class DashboardComponent implements OnInit {
  stats = {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
  };

  constructor(private api: ApiClientService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.api.getUsers(1, 1).subscribe(res => {
      this.stats.totalUsers = res.total;
    });
    this.api.getProducts(1, 1).subscribe(res => {
      this.stats.totalProducts = res.total;
    });
    this.api.getOrders(1, 1).subscribe(res => {
      this.stats.totalOrders = res.total;
    });
  }
}
```

**Users Management Component** (`apps/admin/src/app/users/users.component.ts`):
```typescript
import { Component, OnInit } from '@angular/core';
import { ApiClientService, User } from '@<project-name>/api-client';

@Component({
  selector: 'admin-users',
  template: `
    <div class="users-page">
      <div class="header">
        <h1>Users Management</h1>
        <button class="btn-primary" (click)="showCreateForm = !showCreateForm">
          {{ showCreateForm ? 'Cancel' : 'Add User' }}
        </button>
      </div>

      <div *ngIf="showCreateForm" class="form-card">
        <h3>Create New User</h3>
        <form (ngSubmit)="createUser()" #userForm="ngForm">
          <input [(ngModel)]="newUser.email" name="email" placeholder="Email" required />
          <input [(ngModel)]="newUser.name" name="name" placeholder="Name" required />
          <input [(ngModel)]="newUser.password" name="password" type="password" placeholder="Password" required />
          <button type="submit" class="btn-primary">Create User</button>
        </form>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td>{{ user.id }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.role }}</td>
            <td>{{ user.createdAt | date }}</td>
            <td>
              <button class="btn-edit" (click)="editUser(user)">Edit</button>
              <button class="btn-delete" (click)="deleteUser(user.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button [disabled]="page === 1" (click)="loadUsers(page - 1)">Previous</button>
        <span>Page {{ page }}</span>
        <button (click)="loadUsers(page + 1)">Next</button>
      </div>
    </div>
  `,
  styles: [`
    .users-page { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .form-card { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .data-table th { background: #f5f5f5; font-weight: 600; }
    .pagination { display: flex; justify-content: center; gap: 20px; margin-top: 20px; align-items: center; }
    .btn-primary { background: #667eea; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
    .btn-edit { background: #4CAF50; color: white; padding: 5px 10px; border: none; border-radius: 3px; margin-right: 5px; cursor: pointer; }
    .btn-delete { background: #f44336; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer; }
    input { padding: 8px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  page = 1;
  limit = 20;
  showCreateForm = false;
  newUser: Partial<User> = {};

  constructor(private api: ApiClientService) {}

  ngOnInit(): void {
    this.loadUsers(this.page);
  }

  loadUsers(page: number): void {
    this.page = page;
    this.api.getUsers(page, this.limit).subscribe(res => {
      this.users = res.data;
    });
  }

  createUser(): void {
    this.api.createUser(this.newUser).subscribe(() => {
      this.loadUsers(this.page);
      this.showCreateForm = false;
      this.newUser = {};
    });
  }

  editUser(user: User): void {
    // Implement edit logic
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.api.deleteUser(id).subscribe(() => {
        this.loadUsers(this.page);
      });
    }
  }
}
```

#### Step 4.4: Configure App Routing

**App Module** (`apps/admin/src/app/app.module.ts`):
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { AuthGuard } from './auth/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    UsersComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]),
  ],
  providers: [
    { provide: 'API_URL', useValue: environment.apiUrl || 'http://localhost:3000' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### Phase 5: Configuration Files

#### Step 5.1: Package.json Scripts
```json
{
  "scripts": {
    "manual:prepare": "npm run generate && npm run tsc:lint && npm run build && npm run docs:infrastructure && npm run test",
    "generate": "./node_modules/.bin/nx run-many --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix",
    "make-ts-list": "./node_modules/.bin/rucken make-ts-list",
    
    "serve:dev:server": "./node_modules/.bin/nx serve server --skip-nx-cache=true",
    "serve:dev:admin": "./node_modules/.bin/nx serve admin --skip-nx-cache=true",
    
    "build:prod:server": "./node_modules/.bin/nx build server --configuration=production",
    "build:prod:admin": "./node_modules/.bin/nx build admin --configuration=production",
    
    "start:prod:server": "node dist/apps/server/main.js",
    
    "pm2:start": "./node_modules/.bin/pm2 start ./ecosystem.config.json",
    "pm2:stop": "./node_modules/.bin/pm2 delete all",
    "pm2:restart": "./node_modules/.bin/pm2 restart all",
    "pm2:logs": "./node_modules/.bin/pm2 logs",
    
    "docker-compose:start": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./docker-compose.yml up -d",
    "docker-compose:stop": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./docker-compose.yml down",
    "docker-compose:prod:start": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./docker-compose-prod.yml --env-file ./docker-compose-prod.env up -d",
    "docker-compose:prod:stop": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./docker-compose-prod.yml down",
    
    "docs:infrastructure": "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --all -t=start --parallel=1",
    
    "test": "./node_modules/.bin/nx run-many --all -t=test --skip-nx-cache=true",
    "test:server": "./node_modules/.bin/nx test server",
    "test:admin": "./node_modules/.bin/nx test admin",
    
    "lint": "./node_modules/.bin/nx run-many --all -t=lint",
    "lint:fix": "./node_modules/.bin/nx run-many --all -t=lint --fix",
    "tsc:lint": "./node_modules/.bin/tsc --noEmit -p tsconfig.base.json"
  }
}
```

#### Step 5.2: Environment File (.env)
```env
# Server Configuration
SERVER_PORT=3000
SERVER_HOSTNAME=localhost

# PostgreSQL
<PROJECT_NAME>_POSTGRESQL_PASSWORD=postgres
<PROJECT_NAME>_POSTGRESQL_DATABASE=<project-name>_db
DATABASE_URL=postgresql://postgres:${<PROJECT_NAME>_POSTGRESQL_PASSWORD}@localhost:5432/${<PROJECT_NAME>_POSTGRESQL_DATABASE}

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=3600

# Admin Panel
ADMIN_API_URL=http://localhost:3000
ADMIN_PORT=4200
```

#### Step 5.3: Rucken Configuration (rucken.json)
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

### Phase 6: Generate Infrastructure

#### Step 6.1: Build and Generate
```bash
# 1. Generate TypeScript index files
npm run make-ts-list

# 2. Build all applications and libraries
npm run build

# 3. Generate infrastructure documentation and files
npm run docs:infrastructure

# 4. Run tests
npm run test
```

#### Step 6.2: Verify Generated Files
After running `docs:infrastructure`, verify these files exist:
- ✅ `docker-compose.yml`
- ✅ `docker-compose-example.yml`
- ✅ `docker-compose-prod.yml`
- ✅ `docker-compose-prod.env`
- ✅ `.env`
- ✅ `example.env`
- ✅ `INFRASTRUCTURE.MD`
- ✅ `ecosystem.config.json`

### Phase 7: Start Development

#### Step 7.1: Start Infrastructure
```bash
# Start Docker Compose (database, redis, etc.)
npm run docker-compose:start

# Verify services are running
docker compose ps
```

#### Step 7.2: Start Applications
```bash
# Option 1: Using PM2
npm run pm2:start

# Option 2: Manual start
# Terminal 1 - Backend
npm run serve:dev:server

# Terminal 2 - Frontend
npm run serve:dev:admin
```

#### Step 7.3: Access Applications
```
Backend API:     http://localhost:3000
Swagger Docs:    http://localhost:3000/swagger
Admin Panel:     http://localhost:4200
```

### Phase 8: Testing

#### Step 8.1: Backend Tests
```bash
# Run all backend tests
npm run test:server

# Run specific module tests
./node_modules/.bin/nx test users
```

#### Step 8.2: Frontend Tests
```bash
# Run unit tests
npm run test:admin

# Run e2e tests
./node_modules/.bin/nx e2e admin-e2e
```

### Phase 9: Production Deployment

#### Option 1: PM2 Deployment
```bash
# Build applications
npm run build:prod:server
npm run build:prod:admin

# Start with PM2
npm run pm2:prod:start

# Access
# Backend: http://your-server:3000
# Admin: http://your-server:8080 (serve admin dist with nginx)
```

#### Option 2: Docker Compose Deployment
```bash
# Build applications
npm run build:prod:server
npm run build:prod:admin

# Start production infrastructure
npm run docker-compose:prod:start

# Access
# http://localhost:8080
```

#### Option 3: Kubernetes Deployment
```bash
# Generate Kubernetes manifests (if available)
npm run k8s:generate

# Deploy
kubectl apply -f k8s/prod/
```

## Example: Complete Project Generation

### User Specification
```
I want to build an e-commerce platform with:
- Product catalog
- Shopping cart
- Order management
- Payment processing (Stripe)
- User authentication
- Admin panel to manage everything
- PostgreSQL database
- Redis for caching
- Deploy with Docker Compose
```

### Generated Structure
```
ecommerce-platform/
├── apps/
│   ├── server/                    # Backend API
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   └── app.module.ts
│   │   │   └── main.ts
│   │   └── webpack.config.js
│   └── admin/                     # Angular Admin Panel
│       ├── src/
│       │   ├── app/
│       │   │   ├── auth/
│       │   │   ├── dashboard/
│       │   │   ├── products/
│       │   │   ├── orders/
│       │   │   └── users/
│       │   └── main.ts
│       └── webpack.config.js
├── libs/
│   ├── users/                     # Users feature module
│   ├── products/                  # Products feature module
│   ├── orders/                    # Orders feature module
│   ├── payments/                  # Payments feature module
│   ├── cart/                      # Cart feature module
│   └── api-client/                # Angular API client
├── docker-compose.yml
├── docker-compose-prod.yml
├── .env
├── example.env
├── INFRASTRUCTURE.MD
├── ecosystem.config.json
├── package.json
└── tsconfig.base.json
```

### Implementation Steps
```bash
# 1. Create workspace
npx --yes create-nx-workspace@20.3.0 --name=ecommerce-platform --preset=apps --interactive=false
cd ecommerce-platform

# 2. Install dependencies
npm install --save-dev @nestjs-mod/schematics@latest
npm install @nestjs-mod/common @nestjs-mod/fastify @nestjs-mod/docker-compose @nestjs-mod/pm2 @nestjs-mod/prisma @nestjs-mod/postgresql @nestjs-mod/redis @nestjs-mod/swagger

# 3. Create applications
./node_modules/.bin/nx g @nestjs-mod/schematics:application --directory=apps/server --name=server --strict=true
./node_modules/.bin/nx g @nx/angular:application --directory=apps/admin --name=admin --routing=true --style=less

# 4. Create feature libraries
./node_modules/.bin/nx g @nestjs-mod/schematics:library --name=users --directory=libs/users --buildable --simpleName=true
./node_modules/.bin/nx g @nestjs-mod/schematics:library --name=products --directory=libs/products --buildable --simpleName=true
./node_modules/.bin/nx g @nestjs-mod/schematics:library --name=orders --directory=libs/orders --buildable --simpleName=true
./node_modules/.bin/nx g @nestjs-mod/schematics:library --name=payments --directory=libs/payments --buildable --simpleName=true
./node_modules/.bin/nx g @nestjs-mod/schematics:library --name=cart --directory=libs/cart --buildable --simpleName=true

# 5. Implement modules (follow Phase 2 for each module)
# ... (implement users, products, orders, payments, cart modules)

# 6. Assemble application (Phase 3)
# ... (configure app.module.ts with all modules)

# 7. Generate infrastructure
npm run manual:prepare

# 8. Start development
npm run docker-compose:start
npm run pm2:start

# 9. Access applications
# Backend: http://localhost:3000
# Swagger: http://localhost:3000/swagger
# Admin: http://localhost:4200
```

## Best Practices

### 1. Always Use Schematics
- Use `@nestjs-mod/schematics` for generating applications and libraries
- Ensures consistent structure and configuration

### 2. Separate Concerns
- Core modules: Infrastructure and shared services
- Feature modules: Business logic
- Integration modules: Cross-module communication
- Infrastructure modules: Deployment configuration

### 3. Use Environment Models
- Define all environment variables with `@EnvModel()`
- Set sensible defaults
- Mark required fields explicitly

### 4. Document Everything
- Run `npm run docs:infrastructure` before each release
- Keep Swagger documentation updated
- Maintain INFRASTRUCTURE.MD

### 5. Test Thoroughly
- Write unit tests for all services
- Write e2e tests for critical user flows
- Run integration tests before deployment

### 6. Version Control
```gitignore
# Commit
docker-compose.yml
docker-compose-example.yml
example.env

# Don't commit
.env
docker-compose-prod.yml
docker-compose-prod.env
node_modules/
dist/
```

## Troubleshooting

### Issue: Module not found in imports
**Solution**: 
1. Check library path in `tsconfig.base.json`
2. Ensure library is built: `npm run build <lib-name>`
3. Verify exports in `libs/<name>/src/index.ts`

### Issue: Environment variables not loading
**Solution**:
1. Check `@EnvModel()` decorator is present
2. Verify `.env` file exists and has correct values
3. Ensure `dotenv` is loaded: `node -r dotenv/config`

### Issue: Docker Compose not generating
**Solution**:
1. Set `NESTJS_MODE=infrastructure`
2. Import DockerCompose module in AppModule
3. Run `npm run docs:infrastructure`

### Issue: Admin panel CORS errors
**Solution**:
```typescript
// In app.module.ts
DefaultNestApplicationListener.forRoot({
  staticConfiguration: {
    cors: {
      origin: 'http://localhost:4200',
      credentials: true,
    },
  },
})
```

### Issue: Database connection fails
**Solution**:
1. Check Docker Compose is running: `docker compose ps`
2. Verify DATABASE_URL in `.env`
3. Check PostgreSQL is healthy: `docker compose logs postgresql`

## Quick Reference Commands

```bash
# Development
npm run manual:prepare          # Full preparation
npm run serve:dev:server        # Start backend
npm run serve:dev:admin         # Start frontend
npm run docker-compose:start    # Start infrastructure

# Production
npm run build:prod:server       # Build backend
npm run build:prod:admin        # Build frontend
npm run pm2:start               # Start with PM2
npm run docker-compose:prod:start  # Start with Docker

# Testing
npm run test                    # All tests
npm run test:server             # Backend tests
npm run test:admin              # Frontend tests

# Documentation
npm run docs:infrastructure     # Generate docs
npm run dep-graph               # Dependency graph

# Code Quality
npm run lint                    # Check code
npm run lint:fix                # Fix issues
npm run tsc:lint                # Type checking
```

## Next Steps

After generating your project:

1. ✅ **Customize Modules**: Implement your business logic in feature modules
2. ✅ **Design Database**: Create Prisma schema or database models
3. ✅ **Implement APIs**: Build RESTful or GraphQL APIs
4. ✅ **Build Admin UI**: Create admin panel components and pages
5. ✅ **Write Tests**: Add unit and e2e tests
6. ✅ **Deploy**: Use PM2, Docker Compose, or Kubernetes
7. ✅ **Monitor**: Set up logging and monitoring
8. ✅ **Document**: Keep Swagger and INFRASTRUCTURE.MD updated

## Resources

- **NestJS-mod Documentation**: https://nestjs-mod.com
- **NestJS Documentation**: https://nestjs.com
- **NX Documentation**: https://nx.dev
- **GitHub Examples**: https://github.com/nestjs-mod/nestjs-mod-contrib
