# Backend Modules

## Overview
This directory contains the feature modules for the World of Books Explorer backend API.

## Modules

### 📚 Navigation Module
Manages top-level navigation items (e.g., "Fiction", "Non-Fiction", "Children's Books").

**Location:** `src/modules/navigation/`

**Features:**
- CRUD operations for navigation items
- Pagination support
- Search by title
- Unique slug and sourceUrl validation
- Includes category count

**Endpoints:**
- `POST /navigation` - Create navigation
- `GET /navigation` - List all navigations (with pagination)
- `GET /navigation/:id` - Get navigation by ID
- `GET /navigation/slug/:slug` - Get navigation by slug
- `PUT /navigation/:id` - Update navigation
- `DELETE /navigation/:id` - Delete navigation

---

### 🗂️ Category Module
Manages hierarchical categories within navigation items.

**Location:** `src/modules/category/`

**Features:**
- CRUD operations for categories
- Hierarchical tree structure (parent-child relationships)
- Pagination and filtering
- Search by title
- Filter by navigation or parent category
- Circular reference prevention
- Unique slug within navigation validation

**Endpoints:**
- `POST /categories` - Create category
- `GET /categories` - List all categories (with pagination & filters)
- `GET /categories/tree/:navigationId` - Get category tree
- `GET /categories/:id` - Get category by ID
- `GET /categories/:navigationId/:slug` - Get category by slug
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

---

### 📖 Product Module
Manages products (books) and their detailed information.

**Location:** `src/modules/product/`

**Features:**
- CRUD operations for products
- Product detail management (separate entity)
- Advanced search (title, author)
- Price range filtering
- Category filtering
- Sorting (by title, price, date)
- Pagination support
- Unique sourceId and sourceUrl validation

**Endpoints:**
- `POST /products` - Create product
- `GET /products` - List all products (with pagination, search, filters, sorting)
- `GET /products/:id` - Get product by ID (includes reviews)
- `GET /products/source/:sourceId` - Get product by source ID
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `POST /products/:id/detail` - Create product detail
- `PUT /products/:id/detail` - Update product detail
- `GET /products/:id/detail` - Get product detail

---

## Common Utilities

### Pagination DTO
**Location:** `src/common/dto/pagination.dto.ts`

Provides standardized pagination for all list endpoints:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- Returns metadata with total count and page info

### Prisma Service
**Location:** `src/database/prisma.service.ts`

Manages database connections and lifecycle:
- Auto-connects on module initialization
- Auto-disconnects on module destruction
- Singleton service injected into all modules

---

## Architecture

### Module Structure
```
modules/
├── navigation/
│   ├── dto/
│   │   └── navigation.dto.ts      # DTOs for create, update, query
│   ├── navigation.controller.ts   # REST endpoints
│   ├── navigation.service.ts      # Business logic
│   └── navigation.module.ts       # Module configuration
├── category/
│   ├── dto/
│   │   └── category.dto.ts
│   ├── category.controller.ts
│   ├── category.service.ts
│   └── category.module.ts
└── product/
    ├── dto/
    │   └── product.dto.ts
    ├── product.controller.ts
    ├── product.service.ts
    └── product.module.ts
```

### Data Flow
```
Client Request
    ↓
Controller (validation, routing)
    ↓
Service (business logic)
    ↓
Prisma Service (database access)
    ↓
PostgreSQL Database
```

---

## Validation

All DTOs use `class-validator` decorators:
- `@IsString()`, `@IsNotEmpty()` - Required strings
- `@IsOptional()` - Optional fields
- `@IsUUID()` - UUID validation
- `@IsUrl()` - URL validation
- `@IsInt()`, `@IsDecimal()` - Number validation
- `@Type()` - Type transformation

---

## Error Handling

### Common Errors
- `400 Bad Request` - Validation errors, invalid references
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate slug, sourceUrl, or sourceId

### Example Error Response
```json
{
  "statusCode": 409,
  "message": "Navigation with this slug or sourceUrl already exists",
  "error": "Conflict"
}
```

---

## Database Relations

```
Navigation (1) ──→ (N) Category
                        ↓
Category (1) ──→ (N) Category (self-referencing)
                        ↓
Category (1) ──→ (N) Product
                        ↓
Product (1) ──→ (1) ProductDetail
Product (1) ──→ (N) Review
```

---

## Usage Examples

### Create a Navigation
```bash
curl -X POST http://localhost:3000/navigation \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fiction Books",
    "slug": "fiction-books",
    "sourceUrl": "https://worldofbooks.com/fiction"
  }'
```

### Get Categories with Pagination
```bash
curl "http://localhost:3000/categories?page=1&limit=20&navigationId=uuid"
```

### Search Products
```bash
curl "http://localhost:3000/products?search=mystery&minPrice=10&maxPrice=30&sortBy=price&sortOrder=asc"
```

---

## Testing

Run the development server:
```bash
npm run start:dev
```

Test endpoints with:
- **Postman** - Import the API documentation
- **cURL** - Use the examples above
- **Thunder Client** (VS Code extension)

---

## Next Steps

1. **Add Authentication** - Protect endpoints with JWT
2. **Add Rate Limiting** - Prevent API abuse
3. **Add Caching** - Redis for frequently accessed data
4. **Add Swagger** - Auto-generated API documentation
5. **Add Tests** - Unit and E2E tests for all modules
6. **Add Scraping Module** - Populate data from external sources

---

For detailed API documentation, see [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)
