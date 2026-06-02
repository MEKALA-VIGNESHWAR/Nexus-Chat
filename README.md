# NexusChat — Production-Grade Real-Time Chat Platform

NexusChat is a secure, modern, real-time communication platform built for high-performance and premium user experiences. It is architected with a decoupled frontend single-page application (SPA) and a scalable backend API powered by WebSockets and PostgreSQL.

---

## 🚀 Key Features

* **Real-time Messaging**: Instant bi-directional communication using Socket.IO.
* **Encrypted Communication**: Client-server encryption at rest for message contents.
* **Channels & Group Chats**: Create public/private direct messages (DMs) or group chats with multiple members.
* **Presence & Activity Tracking**: Online/offline indicators and real-time typing indicators.
* **Rich Media Sharing**: Drag-and-drop file/image uploading backed by Cloudinary.
* **Real-time Notifications**: Dynamic in-app socket-based notifications and delivery/read receipts.
* **Voice Rooms**: WebRTC-based voice channel integration for group voice calls.
* **Premium Glassmorphic Design**: Curated dark-mode UX featuring micro-animations, animated overlays, transitions, and fully responsive breakpoints.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[React Client SPA / Vite] <-->|Socket.IO bi-directional| Server[Express Backend Server]
    Client <-->|HTTPS REST API| Server
    Server <-->|SQL Queries| DB[(PostgreSQL / Supabase)]
    Server <-->|Upload Streams| Cloudinary(Cloudinary Media Storage)
```

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React 18 (Vite)
* **Styling**: Tailwind CSS + Custom Vanilla CSS (Glassmorphism & animations)
* **Real-Time**: Socket.IO Client
* **Icons**: Lucide React
* **Network**: Axios (configured with intercepts for JWT refreshing)

### Backend
* **Core**: Node.js + Express
* **Database**: PostgreSQL (Supabase Pool / pg client)
* **Real-Time**: Socket.IO Server
* **Authentication**: JSON Web Tokens (JWT) + Bcrypt
* **Media Handling**: Multer + Cloudinary SDK
* **Validation**: Joi schemas

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development

# JWT Secret Keys
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# PostgreSQL / Supabase
DATABASE_URL=postgres://username:password@hostname:5432/dbname?sslmode=require

# Cloudinary Config (Required for File Uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS / Client URL
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚦 Getting Started

### Prerequisites
* Node.js (v18+)
* PostgreSQL instance running (Supabase or local PostgreSQL)

### Step 1: Clone and Install Dependencies
Install packages for both frontend and backend:
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### Step 2: Initialize Database Schema
Run the SQL queries in `server/src/config/schema.sql` against your PostgreSQL database to construct the tables and indexes.

### Step 3: Run the Application
Start both servers in development mode:
```bash
# Start backend server (from server directory)
npm run dev

# Start client development server (from client directory)
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```text
NexusChat/
├── client/                 # React Frontend SPA
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── auth/       # LoginForm, RegisterForm
│   │   │   ├── chat/       # ChatWindow, MessageBubble, MessageInput
│   │   │   ├── common/     # Avatar, Button, Input, Modal, Skeleton, Tooltip
│   │   │   ├── layout/     # Sidebar, Header, NotificationPanel
│   │   │   ├── profile/    # ProfilePanel, AvatarUpload
│   │   │   ├── voice/      # VoiceRoom, VoiceControls
│   │   ├── context/        # Auth, Chat, Socket, and Theme Providers
│   │   ├── hooks/          # useTyping, useMediaUpload, useVoice
│   │   ├── services/       # axios api.js configuration
│   │   └── utils/          # Constants, formatters, etc.
└── server/                 # Express REST & WebSocket Server
    ├── src/
    │   ├── config/         # Database, Cloudinary, schema.sql
    │   ├── controllers/    # Request controllers
    │   ├── middleware/     # Auth, error, rate-limiter, upload validation
    │   ├── models/         # Postgres queries mapping to Mongoose interfaces
    │   ├── routes/         # Router maps
    │   ├── services/       # Business logic (encryption, auth, rooms, media)
    │   ├── sockets/        # Socket handlers (presence, chat, voice, RTC)
    │   └── validators/     # Joi validation rules
```

---

## 📡 API Reference Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **POST** | `/api/v1/auth/register` | Register a new user | No |
| **POST** | `/api/v1/auth/login` | Login user, sets HTTP-only cookies | No |
| **POST** | `/api/v1/auth/logout` | Revokes refresh token, clears cookies | Yes |
| **GET** | `/api/v1/users/search` | Search online and offline users | Yes |
| **PATCH**| `/api/v1/users/profile` | Update profile information | Yes |
| **POST** | `/api/v1/users/avatar` | Upload profile picture | Yes |
| **GET** | `/api/v1/rooms` | Get user's conversation rooms | Yes |
| **POST** | `/api/v1/rooms/direct` | Initialize or get direct room (DM) | Yes |
| **POST** | `/api/v1/rooms/group` | Create group chat room | Yes |
| **GET** | `/api/v1/messages/:roomId`| Get paginated, decrypted messages | Yes |
| **POST** | `/api/v1/media/upload` | Upload file/image attachment | Yes |
| **GET** | `/api/v1/notifications`| Get user notifications list | Yes |
| **PATCH**| `/api/v1/notifications/read-all` | Mark all notifications as read | Yes |
| **PATCH**| `/api/v1/notifications/:id/read` | Mark a single notification as read | Yes |
