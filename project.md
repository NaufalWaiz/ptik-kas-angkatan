Tentu, mohon maaf atas ketidaknyamanannya. Berikut adalah **satu file penuh** dalam format Markdown. Anda bisa langsung menyalin seluruh blok kode di bawah ini dan menyimpannya sebagai file bernama `TECH_SPEC_KAS_ANGKATAN.md`.

````markdown
# Technical Specification Document: Backend Sistem Informasi Kas Angkatan

| Attribute | Details |
| :--- | :--- |
| **Project Name** | Backend Kas Angkatan API |
| **Version** | 1.0.0 |
| **Status** | Ready for Development |
| **Last Updated** | 18 November 2025 |
| **Tech Stack** | Golang, Supabase (PostgreSQL), REST API |

---

## 1. Project Overview

### 1.1 Background
Sistem ini dibangun untuk mengelola transparansi dana angkatan. Publik (anggota) dapat melihat saldo dan riwayat transaksi, sedangkan manipulasi data (tambah/ubah) dibatasi hanya untuk Admin dan Bendahara.

### 1.2 Scope
Fokus dokumen ini adalah **Backend REST API** menggunakan Golang yang bertindak sebagai penghubung antara Frontend dan Database Supabase.
* **Read-Only Access:** Dashboard saldo & list transaksi (Public).
* **Write Access:** CRUD Transaksi (Admin & Bendahara only).
* **Auth:** Validasi JWT Token dari Supabase.

---

## 2. Technology Stack

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Language** | **Golang** (v1.21+) | Backend logic. |
| **Framework** | **Gin Gonic** | Web framework (`github.com/gin-gonic/gin`). |
| **Database** | **PostgreSQL** | Managed by **Supabase**. |
| **ORM** | **GORM** | ORM library (`gorm.io/gorm`). |
| **Auth** | **Supabase Auth** | JWT Validation. |
| **Config** | **Godotenv** | Environment variables management. |

---

## 3. Database Design (Supabase)

### 3.1 ERD Schema

#### A. Table `profiles`
Tabel ini digunakan untuk menyimpan role user (RBAC). ID disinkronisasi dengan `auth.users` milik Supabase.

```sql
-- Table: public.profiles
CREATE TABLE public.profiles (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    -- Role membatasi akses: hanya 'admin' & 'bendahara' yang bisa input data
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'bendahara', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
````

#### B. Table `transactions`

Tabel utama untuk mencatat arus kas.

```sql
-- Table: public.transactions
CREATE TABLE public.transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id), -- Audit trail: siapa yang input
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(15, 2) NOT NULL, -- Menggunakan NUMERIC agar presisi
    category VARCHAR(50) NOT NULL, -- e.g., "Iuran", "Sumbangan", "Logistik"
    description TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes untuk performa dashboard
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
```

-----

## 4\. API Specifications

**Base URL:** `/api/v1`
**Format:** JSON

### 4.1 Public Endpoints (No Auth Required)

#### **1. Get Dashboard Summary**

Mengambil ringkasan keuangan real-time.

  * **Method:** `GET`
  * **Path:** `/dashboard`
  * **Response (200 OK):**
    ```json
    {
      "status": "success",
      "data": {
        "total_balance": 5500000,
        "total_income": 10000000,
        "total_expense": 4500000
      }
    }
    ```

#### **2. Get Transactions List**

Melihat daftar riwayat transaksi dengan pagination.

  * **Method:** `GET`
  * **Path:** `/transactions`
  * **Query Params:**
      * `page`: int (default 1)
      * `limit`: int (default 10)
      * `type`: string (optional: `income` or `expense`)
  * **Response (200 OK):**
    ```json
    {
      "status": "success",
      "data": [
        {
          "id": 10,
          "type": "income",
          "amount": 100000,
          "category": "Iuran Wajib",
          "description": "Iuran November",
          "date": "2025-11-18",
          "input_by": "Bendahara 1"
        }
      ],
      "meta": {
        "page": 1,
        "total_pages": 5,
        "total_rows": 50
      }
    }
    ```

-----

### 4.2 Protected Endpoints (Admin & Bendahara Only)

**Security Header:**
`Authorization: Bearer <SUPABASE_JWT_TOKEN>`

#### **3. Create Transaction**

  * **Method:** `POST`
  * **Path:** `/transactions`
  * **Body:**
    ```json
    {
      "type": "expense",
      "amount": 250000,
      "category": "Perlengkapan",
      "description": "Beli Spanduk",
      "date": "2025-11-18"
    }
    ```
  * **Response (201 Created):**
    ```json
    {
      "status": "success",
      "message": "Transaction created"
    }
    ```

#### **4. Update Transaction**

  * **Method:** `PUT`
  * **Path:** `/transactions/:id`
  * **Body:** (Kirim field yang ingin diubah saja)
    ```json
    {
      "amount": 270000,
      "description": "Revisi harga spanduk"
    }
    ```

#### **5. Delete Transaction**

  * **Method:** `DELETE`
  * **Path:** `/transactions/:id`

-----

## 5\. Authentication & Middleware Flow

Backend Golang tidak menangani login/register user. Login dilakukan di Frontend langsung ke Supabase. Backend hanya **memvalidasi** token yang dikirim Frontend.

**Algoritma Middleware:**

1.  Intercept request masuk.
2.  Cek Header `Authorization`.
3.  Parse JWT Token menggunakan `SUPABASE_JWT_SECRET`.
4.  Jika Token Valid:
      * Ambil `user_id` (UUID) dari claim token.
      * Query tabel `public.profiles` where `id = user_id`.
      * Cek kolom `role`.
      * **IF** `role` IN ('admin', 'bendahara') **THEN** `Next()`.
      * **ELSE** return `403 Forbidden`.
5.  Jika Token Invalid/Expired -\> return `401 Unauthorized`.

-----

## 6\. Project Structure

Struktur folder standar untuk Golang clean architecture (simplified).

```text
.
├── cmd
│   └── api
│       └── main.go          # Entry point
├── internal
│   ├── config               # Database & Env setup
│   ├── controllers          # HTTP Handlers (Logic Dashboard & CRUD)
│   ├── middleware           # Auth Middleware
│   ├── models               # Struct definitions (Transaction, Profile)
│   ├── repository           # GORM Database Queries
│   └── routes               # Gin Router setup
├── pkg
│   └── utils                # Helper (Response formatter, Error handler)
├── .env                     # Environment Variables
├── .gitignore
├── go.mod
└── go.sum
```

-----

## 7\. Environment Variables (.env)

Buat file `.env` di root project:

```env
# Server Configuration
PORT=8080
APP_ENV=development

# Database Configuration (Supabase)
# Gunakan Connection Pooling (Session Mode) dari Supabase Settings -> Database
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_USER=postgres.yourproject
DB_PASSWORD=your_db_password
DB_NAME=postgres
DB_PORT=6543

# Security
# Didapat dari Supabase Settings -> API -> JWT Secret
SUPABASE_JWT_SECRET=super-secret-jwt-token-from-supabase
```

-----

## 8\. Implementation Steps

1.  **Database Setup:**
      * Buka Supabase Dashboard -\> SQL Editor.
      * Copy-paste script SQL dari Section 3.1.
      * Insert 1 user dummy manual ke tabel `profiles` dengan role `admin` untuk testing.
2.  **Backend Init:**
      * `go mod init kas-angkatan`
      * `go get -u github.com/gin-gonic/gin`
      * `go get -u gorm.io/gorm`
      * `go get -u gorm.io/driver/postgres`
      * `go get -u github.com/golang-jwt/jwt/v5`
3.  **Coding:**
      * Setup koneksi database (`internal/config`).
      * Buat struct model (`internal/models`).
      * Buat repository & controller.
      * Pasang middleware Auth.
4.  **Testing:**
      * Gunakan Postman.
      * Login di client/frontend untuk dapat JWT, copy tokennya ke Postman Auth Header.
      * Test Endpoint Create & Read.

<!-- end list -->

```
```