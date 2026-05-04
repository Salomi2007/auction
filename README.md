# Online Mini Auction System

## Features

### User Features
- Register / Login
- View listed products
- Place a bid
- See highest bid
- View auction end time

### Admin Features
- Add product
- Set starting price
- Set auction timer
- Delete auction

## Tech Stack
- Frontend: React
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Create Admin User
Register a user, then manually update in MongoDB:
```javascript
db.users.updateOne({email: "admin@example.com"}, {$set: {isAdmin: true}})
```

## API Endpoints

### Auth
- POST /api/auth/register - Register user
- POST /api/auth/login - Login user

### Products
- GET /api/products - Get all products
- POST /api/products - Create product (Admin)
- DELETE /api/products/:id - Delete product (Admin)

### Bids
- POST /api/bids - Place a bid

## Default Ports
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
