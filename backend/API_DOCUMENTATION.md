# World of Books Explorer - API Documentation

## Overview
RESTful API for managing navigation, categories, and products in the World of Books Explorer application.

**Base URL:** `http://localhost:3000`

---

## Common Features

### Pagination
All list endpoints support pagination with the following query parameters:

- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Responses
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## Navigation Endpoints

### Create Navigation
**POST** `/navigation`

**Request Body:**
```json
{
  "title": "Fiction Books",
  "slug": "fiction-books",
  "sourceUrl": "https://example.com/fiction"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Fiction Books",
  "slug": "fiction-books",
  "sourceUrl": "https://example.com/fiction",
  "lastScrapedAt": null,
  "createdAt": "2024-01-11T10:00:00.000Z",
  "updatedAt": "2024-01-11T10:00:00.000Z"
}
```

### Get All Navigations
**GET** `/navigation?page=1&limit=10&search=fiction&slug=fiction-books`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by title (case-insensitive)
- `slug` (optional): Filter by slug

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Fiction Books",
      "slug": "fiction-books",
      "sourceUrl": "https://example.com/fiction",
      "lastScrapedAt": null,
      "createdAt": "2024-01-11T10:00:00.000Z",
      "updatedAt": "2024-01-11T10:00:00.000Z",
      "_count": {
        "categories": 5
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Get Navigation by ID
**GET** `/navigation/:id`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Fiction Books",
  "slug": "fiction-books",
  "sourceUrl": "https://example.com/fiction",
  "lastScrapedAt": null,
  "createdAt": "2024-01-11T10:00:00.000Z",
  "updatedAt": "2024-01-11T10:00:00.000Z",
  "categories": [
    {
      "id": "uuid",
      "title": "Mystery",
      "slug": "mystery",
      "...": "..."
    }
  ],
  "_count": {
    "categories": 5
  }
}
```

### Get Navigation by Slug
**GET** `/navigation/slug/:slug`

**Response:** `200 OK` (same as Get by ID)

### Update Navigation
**PUT** `/navigation/:id`

**Request Body:**
```json
{
  "title": "Updated Fiction Books",
  "lastScrapedAt": "2024-01-11T10:00:00.000Z"
}
```

**Response:** `200 OK`

### Delete Navigation
**DELETE** `/navigation/:id`

**Response:** `204 No Content`

---

## Category Endpoints

### Create Category
**POST** `/categories`

**Request Body:**
```json
{
  "navigationId": "uuid",
  "parentId": "uuid",  // optional
  "title": "Mystery",
  "slug": "mystery",
  "sourceUrl": "https://example.com/fiction/mystery",
  "productCount": 150  // optional
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "navigationId": "uuid",
  "parentId": "uuid",
  "title": "Mystery",
  "slug": "mystery",
  "sourceUrl": "https://example.com/fiction/mystery",
  "productCount": 150,
  "lastScrapedAt": null,
  "createdAt": "2024-01-11T10:00:00.000Z",
  "updatedAt": "2024-01-11T10:00:00.000Z",
  "navigation": { "id": "uuid", "title": "Fiction Books", "slug": "fiction-books" },
  "parent": null
}
```

### Get All Categories
**GET** `/categories?page=1&limit=10&search=mystery&navigationId=uuid&parentId=uuid&slug=mystery`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by title (case-insensitive)
- `navigationId` (optional): Filter by navigation
- `parentId` (optional): Filter by parent category
- `slug` (optional): Filter by slug

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "navigationId": "uuid",
      "parentId": null,
      "title": "Mystery",
      "slug": "mystery",
      "sourceUrl": "https://example.com/fiction/mystery",
      "productCount": 150,
      "lastScrapedAt": null,
      "createdAt": "2024-01-11T10:00:00.000Z",
      "updatedAt": "2024-01-11T10:00:00.000Z",
      "navigation": { "id": "uuid", "title": "Fiction Books", "slug": "fiction-books" },
      "parent": null,
      "_count": {
        "children": 3,
        "products": 150
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Get Category Tree
**GET** `/categories/tree/:navigationId`

Returns hierarchical category structure for a navigation.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Mystery",
    "slug": "mystery",
    "children": [
      {
        "id": "uuid",
        "title": "Detective",
        "slug": "detective",
        "children": []
      }
    ]
  }
]
```

### Get Category by ID
**GET** `/categories/:id`

**Response:** `200 OK`

### Get Category by Slug
**GET** `/categories/:navigationId/:slug`

**Response:** `200 OK`

### Update Category
**PUT** `/categories/:id`

**Request Body:**
```json
{
  "title": "Updated Mystery",
  "productCount": 175
}
```

**Response:** `200 OK`

### Delete Category
**DELETE** `/categories/:id`

**Response:** `204 No Content`

---

## Product Endpoints

### Create Product
**POST** `/products`

**Request Body:**
```json
{
  "categoryId": "uuid",  // optional
  "sourceId": "WOB-12345",
  "title": "The Great Mystery",
  "author": "John Doe",
  "price": 19.99,
  "currency": "USD",
  "imageUrl": "https://example.com/image.jpg",
  "sourceUrl": "https://example.com/product/12345"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "categoryId": "uuid",
  "sourceId": "WOB-12345",
  "title": "The Great Mystery",
  "author": "John Doe",
  "price": "19.99",
  "currency": "USD",
  "imageUrl": "https://example.com/image.jpg",
  "sourceUrl": "https://example.com/product/12345",
  "lastScrapedAt": null,
  "createdAt": "2024-01-11T10:00:00.000Z",
  "updatedAt": "2024-01-11T10:00:00.000Z",
  "category": { "id": "uuid", "title": "Mystery", "slug": "mystery" }
}
```

### Get All Products
**GET** `/products?page=1&limit=10&search=mystery&categoryId=uuid&author=John&minPrice=10&maxPrice=50&sortBy=price&sortOrder=asc`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by title or author (case-insensitive)
- `categoryId` (optional): Filter by category
- `author` (optional): Filter by author (partial match)
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `sortBy` (optional): Sort field (title, price, createdAt, updatedAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "categoryId": "uuid",
      "sourceId": "WOB-12345",
      "title": "The Great Mystery",
      "author": "John Doe",
      "price": "19.99",
      "currency": "USD",
      "imageUrl": "https://example.com/image.jpg",
      "sourceUrl": "https://example.com/product/12345",
      "lastScrapedAt": null,
      "createdAt": "2024-01-11T10:00:00.000Z",
      "updatedAt": "2024-01-11T10:00:00.000Z",
      "category": { "id": "uuid", "title": "Mystery", "slug": "mystery" },
      "detail": {
        "productId": "uuid",
        "description": "A thrilling mystery novel",
        "ratingsAvg": "4.5",
        "reviewsCount": 120
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Get Product by ID
**GET** `/products/:id`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "categoryId": "uuid",
  "sourceId": "WOB-12345",
  "title": "The Great Mystery",
  "author": "John Doe",
  "price": "19.99",
  "currency": "USD",
  "imageUrl": "https://example.com/image.jpg",
  "sourceUrl": "https://example.com/product/12345",
  "lastScrapedAt": null,
  "createdAt": "2024-01-11T10:00:00.000Z",
  "updatedAt": "2024-01-11T10:00:00.000Z",
  "category": {
    "id": "uuid",
    "title": "Mystery",
    "slug": "mystery",
    "navigation": {
      "id": "uuid",
      "title": "Fiction Books",
      "slug": "fiction-books"
    }
  },
  "detail": {
    "productId": "uuid",
    "description": "A thrilling mystery novel",
    "specs": { "pages": 350, "format": "Hardcover" },
    "ratingsAvg": "4.5",
    "reviewsCount": 120,
    "publisher": "Mystery Press",
    "publicationDate": "2023-01-15T00:00:00.000Z",
    "isbn": "978-1234567890",
    "lastScrapedAt": null
  },
  "reviews": [
    {
      "id": "uuid",
      "productId": "uuid",
      "author": "Jane Smith",
      "rating": 5,
      "text": "Excellent book!",
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  ]
}
```

### Get Product by Source ID
**GET** `/products/source/:sourceId`

**Response:** `200 OK`

### Update Product
**PUT** `/products/:id`

**Request Body:**
```json
{
  "price": 24.99,
  "lastScrapedAt": "2024-01-11T10:00:00.000Z"
}
```

**Response:** `200 OK`

### Delete Product
**DELETE** `/products/:id`

**Response:** `204 No Content`

---

## Product Detail Endpoints

### Create Product Detail
**POST** `/products/:id/detail`

**Request Body:**
```json
{
  "description": "A thrilling mystery novel that keeps you on the edge of your seat",
  "specs": {
    "pages": 350,
    "format": "Hardcover",
    "language": "English"
  },
  "ratingsAvg": 4.5,
  "reviewsCount": 120,
  "publisher": "Mystery Press",
  "publicationDate": "2023-01-15T00:00:00.000Z",
  "isbn": "978-1234567890"
}
```

**Response:** `201 Created`

### Update Product Detail
**PUT** `/products/:id/detail`

**Request Body:**
```json
{
  "ratingsAvg": 4.6,
  "reviewsCount": 125,
  "lastScrapedAt": "2024-01-11T10:00:00.000Z"
}
```

**Response:** `200 OK`

### Get Product Detail
**GET** `/products/:id/detail`

**Response:** `200 OK`
```json
{
  "productId": "uuid",
  "description": "A thrilling mystery novel",
  "specs": { "pages": 350, "format": "Hardcover" },
  "ratingsAvg": "4.5",
  "reviewsCount": 120,
  "publisher": "Mystery Press",
  "publicationDate": "2023-01-15T00:00:00.000Z",
  "isbn": "978-1234567890",
  "lastScrapedAt": null,
  "product": {
    "id": "uuid",
    "title": "The Great Mystery",
    "author": "John Doe"
  }
}
```

---

## Validation Rules

### Navigation
- `title`: Required, non-empty string
- `slug`: Required, non-empty string, unique
- `sourceUrl`: Required, valid URL, unique

### Category
- `navigationId`: Required, valid UUID, must exist
- `parentId`: Optional, valid UUID, must exist and belong to same navigation
- `title`: Required, non-empty string
- `slug`: Required, non-empty string, unique within navigation
- `sourceUrl`: Required, valid URL, unique
- `productCount`: Optional, integer

### Product
- `categoryId`: Optional, valid UUID, must exist
- `sourceId`: Required, non-empty string, unique
- `title`: Required, non-empty string
- `author`: Optional, string
- `price`: Optional, decimal number
- `currency`: Optional, string
- `imageUrl`: Optional, valid URL
- `sourceUrl`: Required, valid URL, unique

### Product Detail
- `description`: Optional, string
- `specs`: Optional, JSON object
- `ratingsAvg`: Optional, decimal number
- `reviewsCount`: Optional, integer
- `publisher`: Optional, string
- `publicationDate`: Optional, ISO date string
- `isbn`: Optional, string

---

## Status Codes

- `200 OK`: Successful GET/PUT request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Invalid request data or validation error
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource (slug, sourceUrl, etc.)
- `500 Internal Server Error`: Server error
