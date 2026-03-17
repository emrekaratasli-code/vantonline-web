# VANT Art — OpenClaw API Specification

## Authentication

All requests require a Bearer token:

```
Authorization: Bearer <API_SECRET_KEY>
```

Base URL: `https://www.vantonline.com`

---

## Endpoints

### 1. Products

#### List Products
```
GET /api/ai/products
```
Query params:
| Param     | Type   | Default | Description                |
|-----------|--------|---------|----------------------------|
| lang      | string | tr      | `tr` or `en`               |
| featured  | bool   | false   | Only featured products     |
| category  | string | —       | Filter by category slug    |

Response:
```json
{ "ok": true, "count": 5, "data": [{ "id": "...", "slug": "...", "name": "...", "price": 899, "currency": "TRY", "description": "...", "categorySlug": "tshirt", "sizes": ["S","M","L"], "color": "Black", "images": ["https://..."], "isOutOfStock": false, "isFeatured": true, "careInstructions": ["..."] }] }
```

#### Get Single Product
```
GET /api/ai/products/{slug}?lang=tr
```

#### Create Product
```
POST /api/ai/products
Content-Type: application/json

{
  "slug": "new-tshirt",
  "name": "New T-Shirt",
  "price": 899,
  "description_tr": "Türkçe açıklama",
  "description_en": "English description",
  "category_id": "uuid-of-category",
  "color": "Black",
  "sizes": ["S", "M", "L", "XL"],
  "images": ["https://example.com/img.jpg"],
  "is_out_of_stock": false,
  "is_featured": true,
  "care_instructions_tr": ["30°C'de yıkayın"],
  "care_instructions_en": ["Wash at 30°C"]
}
```
Required fields: `slug`, `name`, `price`

#### Update Product
```
PUT /api/ai/products/{slug}
Content-Type: application/json

{
  "price": 999,
  "is_featured": false
}
```
Only include the fields you want to update.

Updatable fields: `slug`, `name`, `price`, `description_tr`, `description_en`, `category_id`, `color`, `sizes`, `images`, `image_url`, `is_out_of_stock`, `is_featured`, `care_instructions_tr`, `care_instructions_en`

#### Delete Product
```
DELETE /api/ai/products/{slug}
```

---

### 2. Categories

#### List Categories
```
GET /api/ai/categories
```
Response:
```json
{ "ok": true, "count": 2, "data": [{ "id": "uuid", "slug": "tshirt" }, { "id": "uuid", "slug": "hoodie" }] }
```

#### Create Category
```
POST /api/ai/categories
Content-Type: application/json

{ "slug": "sweatshirt" }
```

#### Delete Category
```
DELETE /api/ai/categories?slug=sweatshirt
```

---

### 3. Hero Assets (Homepage Videos/Images)

#### List Hero Assets
```
GET /api/ai/hero
```
Response:
```json
{ "ok": true, "count": 1, "data": [{ "id": "uuid", "video_url": "https://...", "active": true, "updated_at": "..." }] }
```

#### Add Hero Asset
```
POST /api/ai/hero
Content-Type: application/json

{ "video_url": "https://example.com/video.mp4", "active": true }
```

#### Update Hero Asset
```
PUT /api/ai/hero
Content-Type: application/json

{ "id": "uuid-of-asset", "active": false }
```

#### Delete Hero Asset
```
DELETE /api/ai/hero?id=uuid-of-asset
```

---

### 4. Site Info (Read-Only)

```
GET /api/ai/site-info?lang=tr
```
Returns brand info, shipping/return policies, size guide, contact info.

---

## Response Format

Success:
```json
{ "ok": true, "data": { ... } }
```

Error:
```json
{ "ok": false, "error": "Error description" }
```

## Status Codes

| Code | Meaning                       |
|------|-------------------------------|
| 200  | Success                       |
| 201  | Created (POST success)        |
| 400  | Bad request / validation error|
| 401  | Unauthorized (bad/missing key)|
| 404  | Not found                     |
| 500  | Server error                  |
