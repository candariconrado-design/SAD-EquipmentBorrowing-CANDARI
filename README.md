# Equipment Borrowing and Return Monitoring System

A web-based Equipment Borrowing and Return Monitoring System designed to track equipment inventory, manage borrow/return transactions, and store real-time data using **Supabase** for backend authentication and database management, deployed via **GitHub Pages**.

---

## 🚀 Live Demo

Access the live application here:  
👉 **[Equipment Borrowing System Live Site](https://candariconrado-design.github.io/SAD-EquipmentBorrowing-CANDARI/)**

---

## 🛠️ Features

- **User Authentication**: Secure Login and Registration powered by Supabase Auth.
- **Dashboard**: High-level overview of available, borrowed, and pending equipment status.
- **Equipment Inventory Management**: Add, update, view, and track individual equipment details.
- **Borrowing & Return Transactions**: Record student/staff borrowing requests and log returned items with dates and status.
- **Real-Time Database**: Instant database sync with Row Level Security (RLS) enabled on Supabase.

---

## 💻 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Backend / Database**: [Supabase](https://supabase.com) (PostgreSQL, Auth, RLS)
- **Deployment**: GitHub Pages
- **Version Control**: Git & GitHub

## Demo Accounts
- **Account 1**: `demo@gmail.com` | Password: `12345`
- **Account 2**: `demo2@gmail.com` | Password: `123`

## 📁 Project Structure

```text
SAD-EquipmentBorrowing-CANDARI/
│
├── index.html          # Main Dashboard
├── login.html          # Login & Authentication Page
├── css/                # Custom Stylesheets
├── js/
│   ├── supabase.js     # Supabase Client Initialization
│   ├── auth.js         # Authentication Handling (Login/Logout)
│   └── app.js          # Main System Logic & CRUD Operations
└── README.md           # Project Documentation
