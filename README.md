# Fundsroom ERP

A full-stack Enterprise Resource Planning (ERP) system for managing customers, products, inventory, stock movements, and sales challans.

## 🚀 Features

### 🔐 Authentication & Authorization
- User login with JWT authentication
- Protected application routes
- Role-based authorization
- Admin and Sales role support
- Secure token-based API requests

### 👥 Customer Management
- View customer records
- Search customers
- Create new customers
- Edit customer information
- Delete customers
- Customer status management
- Support for Lead, Active, and Inactive customers

### 📦 Product Management
- View products
- Search by name, SKU, category, or warehouse
- Create products
- Edit products
- Delete products
- Product SKU uniqueness validation
- Minimum stock configuration
- Automatic low-stock detection

### 📊 Inventory Management
- View current inventory
- Stock-in operations
- Stock-out operations
- Automatic stock quantity updates
- Stock movement history
- Stock movement reasons
- Insufficient-stock validation
- Low-stock and below-minimum indicators

### 🧾 Sales Challans
- Create sales challans
- View challan list
- Search and filter challans
- View complete challan details
- Customer and product information
- Challan status management
- Automatic inventory updates when stock is dispatched

### 📈 Dashboard
- Total customers
- Total products
- Low-stock products
- Total challans
- Recent challans
- Inventory summary
- Stock alerts

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
- JWT Authentication
- bcrypt

### Database

- PostgreSQL
- Prisma ORM
- Database migrations

### Development Tools

- Git
- GitHub
- VS Code
- npm

---

## 🏗️ Project Structure

```text
fundsroom-erp/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
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
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
