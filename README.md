# LeaseMate

LeaseMate is a full-featured landlord–tenant platform designed to simplify property management, communication, and rental workflows.  
The platform provides a modern user experience using **Next.js** on the frontend and a scalable **Express.js** backend.

---

## Features

### 🏠 Unit Management
- Landlords can add, update, and manage rental units.
- Units include full details, images, and availability status.
- Tenants can browse and book available units.

### 📄 Booking & Contracts
- When a tenant books an available unit, a rental contract is created between both parties.
- Contracts have a defined duration.
- Upon contract expiration, both landlord and tenant receive notifications to review each other.
- Only **one review per contract** is allowed.

### ⭐ Reviews & AI Moderation
- Reviews are monitored using AI to detect offensive content.
- Offensive reviews are automatically deleted.
- A warning notification is sent to the user who submitted the review.
- Repeated violations may result in a platform block.
- Blocked users can contact the admin to resolve the issue.

### 💬 Chat System
- Real-time chat between tenants and landlords.
- Admin chat is available for reporting issues or resolving disputes.

### 🛠 Maintenance Service
- Tenants can submit maintenance requests.
- Landlords can view, manage, and respond to maintenance tickets.
- Maintenance updates trigger real-time notifications.

### 🔔 Real-Time Notifications
- Powered by Socket.IO.
- Notifications for:
  - Booking updates
  - Contract expiration
  - Reviews
  - Maintenance requests
  - Subscription and payment events

### 💳 Subscriptions & Payments
- Landlords manage subscriptions using **Stripe Connect**.
- Subscription is required to list units.
- Supports refunds based on platform rules.

### 🧑‍💼 Admin Dashboard
- Admin can view all listed units with their:
  - Current status
  - Images
  - Ownership details
- Admin approval is required during registration:
  - Landlords must submit a national ID.
  - Admin reviews and approves identity verification before account activation.
- Admin can manage users, handle reports, and resolve disputes.

---

## Tech Stack

- **Frontend:** Next.js  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Real-time Communication:** Socket.IO  
- **Payments & Subscriptions:** Stripe Connect  
- **AI Integration:** Offensive content classification  
- **Authentication:** JWT-based authentication  

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/OlaRedaAbdulrazeq/LEASEMATE.git
2. Navigate to the project directory:
   ```bash
   cd LEASEMATE
4. Install dependencies:
   ```bash
   npm install
5. Run the application:
   ```bash
   npm run dev   
   
