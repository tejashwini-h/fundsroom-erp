# Fundsroom ERP

> A full-stack Enterprise Resource Planning (ERP) system for managing customers, products, inventory, stock movements, and sales challans.

![Status](https://img.shields.io/badge/Status-Complete-success)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)
![ORM](https://img.shields.io/badge/ORM-Prisma-purple)
![Build](https://img.shields.io/badge/Build-Passing-success)

---

## 📌 Overview

**Fundsroom ERP** is a full-stack business management application designed to centralize and simplify day-to-day ERP operations.

The system allows authorized users to manage:

- Customers
- Products
- Inventory
- Stock movements
- Sales challans
- Challan statuses
- Warehouse stock levels

The application provides a modern dashboard-based interface and a RESTful backend API with JWT authentication and role-based authorization.

---

## ✨ Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Secure password hashing using bcrypt
- Protected frontend routes
- Protected backend API routes
- Role-based authorization
- Admin and Sales role support
- Automatic token handling through Axios
- Automatic logout on unauthorized API responses

### 📊 Dashboard

The dashboard provides an overview of important ERP information:

- Total customers
- Total products
- Low-stock products
- Total challans
- Recent challans
- Inventory overview
- Stock alerts

### 👥 Customer Management

- View customers
- Search customers
- Create customers
- Edit customers
- Delete customers
- View customer details
- Customer status management
- Lead, Active, and Inactive statuses
- Pagination

### 📦 Product Management

- View products
- Search products
- Create products
- Edit products
- Delete products
- SKU validation
- Category management
- Warehouse management
- Unit price management
- Current stock management
- Minimum stock configuration
- Automatic low-stock detection
- Pagination
- Product details view

Products can be searched by:

- Product name
- SKU
- Category
- Warehouse

### 📋 Inventory Management

- View current inventory
- Stock In
- Stock Out
- Stock movement history
- Product-level stock tracking
- Stock quantity validation
- Insufficient-stock protection
- Minimum stock monitoring
- Low-stock indicators
- Movement reasons
- Pagination

#### Stock In

```text
Current Stock
      ↓
+ Added Quantity
      ↓
Updated Stock
      ↓
Stock Movement Recorded
```

#### Stock Out

```text
Current Stock
      ↓
Validate Available Stock
      ↓
- Removed Quantity
      ↓
Updated Stock
      ↓
Stock Movement Recorded
```

The system prevents stock from becoming negative.

### 🧾 Sales Challans

- Create challans
- View challans
- Search challans
- Filter challans
- View challan details
- Customer information
- Product information
- Quantity management
- Unit price
- Total quantity
- Challan status management
- Pagination

### 🔗 Challan & Inventory Integration

When a challan results in a stock dispatch:

```text
Create Challan
      ↓
Select Customer
      ↓
Select Product
      ↓
Enter Quantity
      ↓
Validate Stock
      ↓
Confirm Challan
      ↓
Inventory Stock Decreases
      ↓
Stock Movement Created
```

This keeps inventory synchronized with sales activity.

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Lucide React
- CSS

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT
- bcrypt

### Database

- PostgreSQL

### Development Tools

- Git
- GitHub
- npm
- VS Code

---

## 🏗️ Application Architecture

```text
                         ┌─────────────────┐
                         │      User       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ React Frontend  │
                         │   TypeScript    │
                         └────────┬────────┘
                                  │
                              Axios API
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Express Backend │
                         │    REST API     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Authentication  │
                         │ & Authorization │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Controllers   │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Prisma ORM    │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   PostgreSQL    │
                         └─────────────────┘
```

---

## 📁 Project Structure

```text
fundsroom-erp/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   │   ├── 20260811091901_init/
│   │   │   │   └── migration.sql
│   │   │   ├── migration_lock.toml
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │
│   ├── prisma.config.ts
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── challan.controller.ts
│   │   │   ├── customer.controller.ts
│   │   │   ├── inventory.controller.ts
│   │   │   └── product.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── role.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── challan.routes.ts
│   │   │   ├── customer.routes.ts
│   │   │   ├── inventory.routes.ts
│   │   │   └── product.routes.ts
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── layouts/
│   │   │   ├── MainLayout.tsx
│   │   │   └── MainLayout.css
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Dashboard.css
│   │   │   ├── Customers.tsx
│   │   │   ├── Customers.css
│   │   │   ├── Products.tsx
│   │   │   ├── Products.css
│   │   │   ├── Inventory.tsx
│   │   │   ├── Inventory.css
│   │   │   ├── Challans.tsx
│   │   │   ├── Challans.css
│   │   │   ├── Login.tsx
│   │   │   └── Login.css
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── screenshots/
│   ├── dashboard.png
│   ├── customers.png
│   ├── products.png
│   ├── inventory.png
│   ├── challans.png
│   └── challan-details.png
│
├── .gitignore
└── README.md
```

---

## 🔄 Core Business Workflow

### Customer Workflow

```text
Login
  ↓
Customers
  ↓
Create / View / Edit / Delete Customer
  ↓
Customer Available for Sales Operations
```

### Product Workflow

```text
Products
  ↓
Create Product
  ↓
Configure Stock Levels
  ↓
Product Available in Inventory
```

### Inventory Workflow

```text
Product
  ↓
Stock In
  ↓
Inventory Updated
  ↓
Stock Movement Recorded
```

```text
Product
  ↓
Stock Out
  ↓
Validate Available Stock
  ↓
Inventory Updated
  ↓
Stock Movement Recorded
```

### Challan Workflow

```text
Customer
    ↓
Create Challan
    ↓
Select Products
    ↓
Enter Quantities
    ↓
Validate Stock
    ↓
Confirm Challan
    ↓
Stock Updated
    ↓
Stock Movement Recorded
```

---

## 🔑 API Endpoints

### Authentication

```text
POST /api/auth/login
```

### Customers

```text
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
```

### Products

```text
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
```

### Inventory

```text
POST /api/inventory/stock-in
POST /api/inventory/stock-out
GET  /api/inventory/movements
```

### Challans

```text
GET   /api/challans
POST  /api/challans
GET   /api/challans/:id
PATCH /api/challans/:id/status
```

### Health Check

```text
GET /api/health
```

Example response:

```json
{
  "success": true,
  "message": "Fundsroom ERP API is running"
}
```

---

## 🔐 Security

The application implements:

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based authorization
- Protected frontend routes
- Bearer token authorization
- Environment variables excluded from Git
- Input validation
- Duplicate SKU validation
- Insufficient stock validation
- Invalid resource validation

Sensitive environment variables such as database credentials and JWT secrets are stored in `.env` and are not committed to the repository.

---

## 👤 User Roles

### ADMIN

Administrative users can manage major ERP operations including:

- Customers
- Products
- Inventory
- Challans
- Stock movements

### SALES

Sales users can perform sales-related operations such as:

- Customer management
- Challan creation
- Challan viewing
- Challan status management

### WAREHOUSE

Warehouse users can perform inventory operations such as:

- Stock In
- Stock Out
- Stock movement viewing

---

## 🗄️ Database

The application uses **PostgreSQL** with **Prisma ORM**.

The database contains relationships between users, customers, products, stock movements, and challans.

Conceptually:

```text
User
 │
 ├──────────────┐
 │              │
 ▼              ▼
Customers     Challans
                 │
                 ▼
            Challan Items
                 │
                 ▼
              Products
                 │
                 ▼
          Stock Movements
```

Prisma migrations are included in the repository to reproduce the database structure.

---

## ⚙️ Installation & Setup

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/tejashwini-h/fundsroom-erp.git
cd fundsroom-erp
```

---

## Backend Setup

### 2. Navigate to Backend

```bash
cd backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/fundsroom"
JWT_SECRET="your-secret-key"
PORT=5000
```

> Never commit `.env` to GitHub.

### 5. Run Database Migrations

```bash
npx prisma migrate dev
```

### 6. Generate Prisma Client

```bash
npx prisma generate
```

### 7. Seed the Database

```bash
npx prisma db seed
```

### 8. Start the Backend

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

## Frontend Setup

### 9. Open a New Terminal

From the project root:

```bash
cd frontend
```

### 10. Install Dependencies

```bash
npm install
```

### 11. Configure Frontend Environment Variables

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

### 12. Start the Frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🏗️ Production Build

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
npm run build
```

---

## 🧪 Testing the Application

The following workflows have been verified during development:

### Authentication

- Login
- Protected routes
- Unauthorized access redirect
- Token-based API requests

### Customers

- Create customer
- View customers
- Search customers
- Edit customer
- Delete customer

### Products

- Create product
- View products
- Search products
- Edit product
- Delete product
- Low-stock detection

### Inventory

- Stock In
- Stock Out
- Stock movement history
- Insufficient stock validation
- Low-stock detection

### Challans

- Create challan
- View challan
- Search challans
- Filter challans
- Update challan status
- Inventory integration
- Stock movement integration

### Build Verification

```text
Frontend → npm run build ✅
Backend  → npm run build ✅
```

---

## 📸 Screenshots

### 📊 Dashboard

The dashboard provides an overview of customers, products, inventory, low-stock alerts, and recent sales challans.

![Fundsroom ERP Dashboard](./screenshots/dashboard.png)

### 👥 Customer Management

Manage customer records, search customers, create new customers, edit customer information, and track customer status.

![Fundsroom ERP Customers](./screenshots/customers.png)

### 📦 Product Management

Manage products, SKUs, categories, pricing, warehouse information, and stock levels.

![Fundsroom ERP Products](./screenshots/products.png)

### 📋 Inventory Management

Monitor current stock levels, perform stock-in and stock-out operations, and view complete stock movement history.

![Fundsroom ERP Inventory](./screenshots/inventory.png)

### 🧾 Sales Challans

Create and manage sales challans, search and filter challans, and view customer and product information.

![Fundsroom ERP Challans](./screenshots/challans.png)

### 👁️ Challan Details

View complete challan details including customer information, products, quantities, pricing, status, and creation details.

![Fundsroom ERP Challan Details](./screenshots/challan-details.png)

---



---

## 💡 Key Technical Highlights

This project demonstrates practical implementation of:

- Full-stack application architecture
- REST API development
- React component architecture
- TypeScript
- JWT authentication
- Role-based authorization
- CRUD operations
- Prisma ORM
- PostgreSQL
- Database relationships
- Database migrations
- Database transactions
- Inventory management logic
- Stock validation
- Search and pagination
- Protected routes
- Axios interceptors
- Error handling
- Production builds

---

## 📚 What This Project Demonstrates

Fundsroom ERP demonstrates the ability to design and build a complete business application rather than only isolated frontend components.

The system connects multiple business workflows:

```text
Customers
    │
    ▼
Sales
    │
    ▼
Challans
    │
    ▼
Inventory
    │
    ▼
Stock Movements
```

This provides a consistent flow of information across the application and keeps inventory synchronized with sales operations.

---

## 🚀 Future Improvements

- PDF challan generation
- Invoice generation
- CSV/Excel report export
- Advanced inventory analytics
- Advanced dashboard charts
- Automated unit and integration testing
- CI/CD pipeline
- Docker containerization
- Production deployment
- Cloud PostgreSQL deployment
- Email notifications
- Inventory alerts
- Audit logs
- Mobile-responsive improvements

---

## 👩‍💻 Author

### Tejashwini H Naduvinamath

Computer Science Engineering Student

GitHub:

https://github.com/tejashwini-h

---

## 📄 License

This project was developed as an academic and portfolio project.

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.