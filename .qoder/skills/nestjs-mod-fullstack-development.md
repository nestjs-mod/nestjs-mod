# NestJS-Mod Fullstack Application Skill

## Overview
This skill helps you create complete fullstack applications with NestJS-mod backend, Angular admin panel, and integrated infrastructure for production deployment.

## When to Use
- Building complete web applications with admin panels
- Creating SaaS products with user management
- Developing enterprise applications with authentication
- Setting up full CI/CD pipeline with Docker/Kubernetes

## Fullstack Architecture

### Components
```
┌─────────────────────────────────────────┐
│         Frontend (Angular)              │
│   Admin Panel / Client Application      │
└─────────────────┬───────────────────────┘
                  │ HTTP/GraphQL
┌─────────────────▼───────────────────────┐
│      Backend API (NestJS)               │
│   ├─ Authentication (SSO)               │
│   ├─ Authorization                      │
│   ├─ Business Logic (Features)          │
│   └─ API Controllers                    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Infrastructure                   │
│   ├─ PostgreSQL (Database)              │
│   ├─ Redis (Cache)                      │
│   ├─ Minio (File Storage)               │
│   └─ NATS (Message Broker)              │
└─────────────────────────────────────────┘
```

## Creating a Fullstack Application

### Step 1: Create NX Workspace
```bash
npx --yes create-nx-workspace@20.3.0 \
  --name=my-fullstack-app \
  --preset=apps \
  --interactive=false \
  --ci=skip

cd my-fullstack-app
```

### Step 2: Install Dependencies
```bash
# NestJS-mod schematics
npm install --save-dev @nestjs-mod/schematics@latest

# Backend dependencies
npm install @nestjs-mod/common @nestjs-mod/fastify

# Infrastructure
npm install @nestjs-mod/docker-compose @nestjs-mod/pm2

# Database
npm install @nestjs-mod/prisma @prisma/client

# Authentication (optional)
npm install @nestjs-mod/sso @nestjs-mod/authorizer

# Frontend dependencies
npm install @nestjs-mod/angular
```

### Step 3: Create Backend Server
```bash
./node_modules/.bin/nx g @nestjs-mod/schematics:application \
  --linter=eslint \
  --unitTestRunner=jest \
  --directory=apps/server \
  --name=server \
  --strict=true
```

### Step 4: Create Admin Panel
```bash
./node_modules/.bin/nx g @nx/angular:application \
  --directory=apps/admin \
  --name=admin \
  --strict=true \
  --minimal=false \
  --prefix=admin \
  --style=less \
  --ssr=false \
  --viewEncapsulation=None \
  --routing=true \
  --e2eTestRunner=cypress \
  --bundler=webpack
```

### Step 5: Create Shared Libraries
```bash
# API client library (generated from Swagger)
./node_modules/.bin/nx g @nx/angular:library \
  --directory=libs/api-client \
  --name=api-client \
  --simpleName=true \
  --buildable=true \
  --publishable=false

# Shared UI components
./node_modules/.bin/nx g @nx/angular:library \
  --directory=libs/shared-ui \
  --name=shared-ui \
  --simpleName=true \
  --buildable=true
```

### Step 6: Configure Backend Module
```typescript
// apps/server/src/app/app.module.ts
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { DockerCompose } from '@nestjs-mod/docker-compose';
import { DockerComposePostgresql } from '@nestjs-mod/docker-compose/lib/features/docker-compose-postgresql';
import { DockerComposeRedis } from '@nestjs-mod/docker-compose/lib/features/docker-compose-redis';
import { PM2 } from '@nestjs-mod/pm2';
import { InfrastructureMarkdownReportGenerator } from '@nestjs-mod/common';
import { SwaggerModule } from '@nestjs-mod/swagger';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
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
    DockerComposePostgresql.forRoot({
      staticConfiguration: {
        version: '15',
        databases: ['myapp_db'],
      },
    }),
    DockerComposeRedis.forRoot(),
    
    // PM2
    PM2.forRoot(),
    
    // Documentation
    SwaggerModule.forRoot({
      staticConfiguration: {
        swaggerPath: 'swagger',
        swaggerTitle: 'My Fullstack App API',
        swaggerDescription: 'API documentation for My Fullstack App',
      },
    }),
    InfrastructureMarkdownReportGenerator.forRoot({
      staticConfiguration: {
        markdownFile: 'INFRASTRUCTURE.MD',
        style: 'full',
      },
    }),
    
    // Feature modules
    UsersModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
});
```

### Step 7: Configure Admin Panel
```typescript
// apps/admin/src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
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
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent },
      { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'users', 
        component: UsersComponent,
        canActivate: [AuthGuard]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### Step 8: Create API Client Service
```typescript
// libs/api-client/src/lib/api-client.service.ts
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
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

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, credentials);
  }

  getUsers(page: number = 1, limit: number = 20): Observable<{ data: User[], total: number }> {
    return this.http.get<{ data: User[], total: number }>(
      `${this.baseUrl}/users?page=${page}&limit=${limit}`
    );
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
}
```

### Step 9: Implement Authentication
```typescript
// apps/admin/src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiClientService, LoginRequest, LoginResponse, User } from '@my-fullstack-app/api-client';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiClient: ApiClientService,
    private router: Router
  ) {
    // Load user from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiClient.login(credentials).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
```

### Step 10: Create Auth Guard
```typescript
// apps/admin/src/app/auth/auth.guard.ts
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

### Step 11: Create Admin Components
```typescript
// apps/admin/src/app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { User } from '@my-fullstack-app/api-client';

@Component({
  selector: 'admin-dashboard',
  template: `
    <div class="dashboard">
      <h1>Welcome, {{ currentUser?.name }}</h1>
      <div class="stats">
        <div class="stat-card">
          <h3>Total Users</h3>
          <p>{{ stats.totalUsers }}</p>
        </div>
        <div class="stat-card">
          <h3>Active Orders</h3>
          <p>{{ stats.activeOrders }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 20px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
    .stat-card { background: #f5f5f5; padding: 20px; border-radius: 8px; }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats = { totalUsers: 0, activeOrders: 0 };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    // Load stats from API
  }
}
```

## Project Configuration

### Package.json Scripts
```json
{
  "scripts": {
    "manual:prepare": "npm run generate && npm run tsc:lint && npm run build && npm run docs:infrastructure && npm run test",
    
    "serve:dev:server": "./node_modules/.bin/nx serve server --skip-nx-cache=true",
    "serve:dev:admin": "./node_modules/.bin/nx serve admin --skip-nx-cache=true",
    
    "build:prod:server": "./node_modules/.bin/nx build server --configuration=production",
    "build:prod:admin": "./node_modules/.bin/nx build admin --configuration=production",
    
    "start:prod:server": "node dist/apps/server/main.js",
    
    "pm2:start": "./node_modules/.bin/pm2 start ./ecosystem.config.json",
    "pm2:stop": "./node_modules/.bin/pm2 delete all",
    
    "docker-compose:start": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./docker-compose.yml up -d",
    "docker-compose:stop": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./docker-compose.yml down",
    
    "docs:infrastructure": "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --all -t=start --parallel=1",
    
    "generate-api-client": "./node_modules/.bin/openapi-generator-cli generate -i http://localhost:3000/swagger-json -g typescript-angular -o libs/api-client/src/lib"
  }
}
```

### PM2 Ecosystem Configuration
```json
{
  "apps": [
    {
      "name": "server",
      "script": "./node_modules/.bin/nx serve server --skip-nx-cache=true",
      "node_args": "-r dotenv/config",
      "watch": true
    },
    {
      "name": "admin",
      "script": "./node_modules/.bin/nx serve admin --skip-nx-cache=true",
      "watch": true
    }
  ]
}
```

### Environment Configuration
```env
# Server
SERVER_PORT=3000
SERVER_HOSTNAME=localhost

# Database
MYAPP_POSTGRESQL_PASSWORD=postgres
MYAPP_POSTGRESQL_DATABASE=myapp_db
DATABASE_URL=postgresql://postgres:${MYAPP_POSTGRESQL_PASSWORD}@localhost:5432/${MYAPP_POSTGRESQL_DATABASE}

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600

# Admin
ADMIN_API_URL=http://localhost:3000/api
ADMIN_PORT=4200
```

## Development Workflow

### Starting Development Environment
```bash
# 1. Prepare project
npm run manual:prepare

# 2. Start infrastructure
npm run docker-compose:start

# 3. Start backend and frontend with PM2
npm run pm2:start

# 4. Access applications
# Backend API: http://localhost:3000
# Swagger Docs: http://localhost:3000/swagger
# Admin Panel: http://localhost:4200
```

### Generating API Client from Swagger
```bash
# 1. Start backend server
npm run serve:dev:server

# 2. Generate API client
npm run generate-api-client

# 3. Rebuild API client library
./node_modules/.bin/nx build api-client
```

### Working with Database
```bash
# Generate Prisma client
./node_modules/.bin/prisma generate

# Create migration
./node_modules/.bin/prisma migrate dev --name add_users_table

# Apply migrations
./node_modules/.bin/prisma migrate deploy

# Open Prisma Studio
./node_modules/.bin/prisma studio
```

## Production Deployment

### Docker Compose Production
```bash
# Build applications
npm run build:prod:server
npm run build:prod:admin

# Start production infrastructure
npm run docker-compose:prod:start

# Start applications
npm run pm2:prod:start
```

### Docker Compose Full (All in Containers)
```bash
# Build and start everything in Docker
npm run docker-compose-full:prod:start

# Access
# http://localhost:8080
```

### Kubernetes Deployment
```bash
# Generate Kubernetes manifests
npm run k8s:generate

# Deploy to Kubernetes
kubectl apply -f k8s/dev/

# For production
kubectl apply -f k8s/prod/
```

## CI/CD Pipeline

### GitHub Actions Example
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Test
        run: npm run test
      
      - name: Lint
        run: npm run lint

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        run: |
          ssh ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }} << 'EOF'
            cd /opt/myapp
            git pull
            npm ci
            npm run build
            npm run docker-compose:prod:start
          EOF
```

## Common Patterns

### Pattern 1: CRUD Module (Full Stack)

#### Backend
```typescript
// libs/products/src/lib/products.module.ts
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

export const { ProductsModule } = createNestModule({
  moduleName: 'ProductsModule',
  moduleCategory: NestModuleCategory.feature,
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
});

// libs/products/src/lib/products.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.productsService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.productsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
```

#### Frontend
```typescript
// apps/admin/src/app/products/products.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiClientService, Product } from '@my-fullstack-app/api-client';

@Component({
  selector: 'admin-products',
  template: `
    <div class="products">
      <h1>Products</h1>
      <button (click)="createProduct()">Add Product</button>
      <table>
        <tr *ngFor="let product of products">
          <td>{{ product.name }}</td>
          <td>{{ product.price }}</td>
          <td>
            <button (click)="editProduct(product)">Edit</button>
            <button (click)="deleteProduct(product.id)">Delete</button>
          </td>
        </tr>
      </table>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];

  constructor(private api: ApiClientService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.api.getProducts().subscribe(data => {
      this.products = data.data;
    });
  }

  createProduct(): void {
    // Open modal or navigate to create page
  }

  editProduct(product: Product): void {
    // Open edit modal or navigate to edit page
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure?')) {
      this.api.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }
}
```

### Pattern 2: Real-time Updates with WebSockets
```typescript
// Backend
import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';

@WebSocketGateway()
export class OrdersGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log('Client connected:', client.id);
  }

  notifyOrderCreated(order: any) {
    this.server.emit('order.created', order);
  }
}

// Frontend
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  onOrderCreated(callback: (order: any) => void) {
    this.socket.on('order.created', callback);
  }
}
```

## Testing

### Backend Unit Tests
```typescript
describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should create a product', async () => {
    const product = await service.create({
      name: 'Test Product',
      price: 99.99,
    });
    expect(product).toBeDefined();
    expect(product.name).toBe('Test Product');
  });
});
```

### Frontend E2E Tests
```typescript
// apps/admin-e2e/src/e2e/login.cy.ts
describe('Login', () => {
  beforeEach(() => cy.visit('/login'));

  it('should display login form', () => {
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should login successfully', () => {
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Troubleshooting

### Issue: CORS errors
**Solution**: Configure CORS in backend
```typescript
DefaultNestApplicationListener.forRoot({
  staticConfiguration: {
    cors: {
      origin: 'http://localhost:4200',
      credentials: true,
    },
  },
})
```

### Issue: API client not updating
**Solution**: Regenerate from Swagger
```bash
npm run generate-api-client
./node_modules/.bin/nx build api-client
```

### Issue: Admin panel can't connect to backend
**Solution**: Check API_URL environment variable
```typescript
// apps/admin/src/app/app.module.ts
providers: [
  { provide: 'API_URL', useValue: environment.apiUrl }
]
```

### Issue: Production build fails
**Solution**: Check TypeScript compilation
```bash
npm run tsc:lint
./node_modules/.bin/nx build server --configuration=production
```

## Best Practices

### 1. Separation of Concerns
- Backend: Business logic, data access, API
- Frontend: UI, user interaction, state management
- Shared: Types, interfaces, API client

### 2. Security
- Use HTTPS in production
- Implement proper authentication
- Validate all inputs
- Use environment variables for secrets
- Enable CORS only for specific origins

### 3. Performance
- Implement caching (Redis)
- Use pagination for lists
- Optimize database queries
- Enable gzip compression
- Use CDN for static assets

### 4. Monitoring
- Add logging (Pino)
- Implement health checks (Terminus)
- Set up error tracking
- Monitor application metrics

### 5. Documentation
- Keep Swagger docs updated
- Maintain INFRASTRUCTURE.MD
- Document API endpoints
- Add comments to complex logic
