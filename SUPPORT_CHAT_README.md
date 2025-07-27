# Support Chat Feature Documentation

## Overview
The Support Chat feature allows tenants and landlords to communicate directly with administrators for support and assistance. This feature includes real-time messaging using Socket.IO and a dedicated admin interface for managing support requests.

## Features

### For Users (Tenants & Landlords)
- **Contact Support Link**: Available in the navbar dropdown menu
- **Real-time Chat**: Instant messaging with administrators
- **Chat History**: Persistent chat history across sessions
- **User-friendly Interface**: Clean and intuitive chat interface

### For Administrators
- **Support Messages Dashboard**: Dedicated section in admin dashboard
- **User Support Messages Button**: With mail icon for easy access
- **Real-time Notifications**: Instant updates when users send messages
- **Chat Management**: View and respond to all user support chats
- **Unread Message Counts**: Track unread messages per chat

## Technical Implementation

### Frontend Components

#### 1. Navbar Integration
- **File**: `frontend/src/components/Navbar.tsx`
- **Feature**: Added "التواصل مع الدعم" (Contact Support) link
- **Condition**: Only visible for 'landlord' and 'tenant' roles

#### 2. User Support Chat Page
- **File**: `frontend/src/app/dashboard/support-chat/page.tsx`
- **Features**:
  - Automatic chat creation/retrieval
  - Real-time message updates via Socket.IO
  - Message sending functionality
  - Chat history display

#### 3. Admin Dashboard Integration
- **File**: `frontend/src/app/admin/dashboard/page.tsx`
- **Features**:
  - New "رسائل دعم المستخدمين" (User Support Messages) tab
  - Support chat list with unread counts
  - Real-time message updates
  - Admin message sending functionality

### Backend Implementation

#### 1. Database Models

**SupportChat Model** (`backend/models/support-chat.model.js`)
```javascript
{
  user: ObjectId (ref: User),
  lastMessage: String,
  lastMessageAt: Date,
  isActive: Boolean (default: true),
  timestamps: true
}
```

**SupportMessage Model** (`backend/models/support-message.model.js`)
```javascript
{
  supportChat: ObjectId (ref: SupportChat),
  sender: ObjectId (ref: User),
  text: String,
  read: Boolean (default: false),
  timestamps: true
}
```

#### 2. API Endpoints

**Support Chat Routes** (`backend/routes/support-chat.route.js`)
- `POST /api/support-chat/create` - Create new support chat
- `GET /api/support-chat/user/:userId` - Get user's support chat
- `GET /api/support-chat/:chatId/messages` - Get chat messages
- `POST /api/support-chat/:chatId/messages` - Send message
- `GET /api/support-chat/admin` - Get all support chats (admin only)
- `POST /api/support-chat/:chatId/read` - Mark messages as read

#### 3. Socket.IO Events

**Support Chat Events** (`backend/socket.js`)
- `joinSupportChat` - Join support chat room
- `sendSupportMessage` - Send support message
- `newSupportMessage` - Receive new support message

## Usage Flow

### For Users
1. Click "التواصل مع الدعم" in navbar dropdown
2. System automatically creates or retrieves existing support chat
3. Send messages and receive real-time responses from admin
4. Chat history is preserved across sessions

### For Administrators
1. Access admin dashboard
2. Click "رسائل دعم المستخدمين" button with mail icon
3. View list of all active support chats
4. Select a chat to view messages and respond
5. Real-time updates when users send new messages

## Testing Instructions

### 1. Start the Backend Server
```bash
cd backend
node server.js
```

### 2. Start the Frontend Development Server
```bash
cd frontend
npm run dev
```

### 3. Test User Flow
1. **Login as a tenant or landlord**
2. **Click "التواصل مع الدعم" in the navbar**
3. **Send a message** - Check browser console for debugging logs
4. **Verify the message appears** in the chat interface

### 4. Test Admin Flow
1. **Login as an admin**
2. **Go to admin dashboard**
3. **Click "رسائل دعم المستخدمين"**
4. **Select a support chat** from the list
5. **Send a response** - Check browser console for debugging logs
6. **Verify real-time updates** work in both directions

## Debugging

### Console Logs to Watch For

#### Frontend (Browser Console)
- `🟢 User joining support chat room: [chatId]`
- `🟢 User sending message: [text]`
- `✅ New chat created: [data]`
- `✅ Message sent successfully: [message]`
- `🟢 User received new support message: [message]`
- `✅ Adding message to user chat`

#### Admin Dashboard
- `🟢 Admin sending message: [text] to chat: [chatId]`
- `✅ Admin message sent successfully: [message]`
- `🟢 Admin received new support message: [message]`
- `✅ Adding message to current chat`

#### Backend (Terminal)
- `🟢 Creating support chat: [data]`
- `✅ New support chat created: [chatId]`
- `✅ Message created: [messageId]`
- `🟢 Sending support message: [data]`
- `✅ Support message created: [messageId]`
- `🟢 User joined support chat room: [chatId]`
- `🟢 Support message received: [data]`
- `🟢 Support message broadcasted to room: [roomId]`
- `🟢 Getting admin support chats for user: [userId]`
- `✅ Found support chats: [count]`

### Common Issues and Solutions

#### 1. Socket Connection Issues
- **Problem**: Messages not appearing in real-time
- **Solution**: Check if Socket.IO is connected in browser console
- **Debug**: Look for "✅ WebSocket connected" logs

#### 2. Authentication Issues
- **Problem**: API calls returning 401/403 errors
- **Solution**: Ensure user is logged in and token is valid
- **Debug**: Check localStorage for 'leasemate_token'

#### 3. Database Issues
- **Problem**: Messages not being saved
- **Solution**: Check MongoDB connection and models
- **Debug**: Look for backend console logs

#### 4. Route Issues
- **Problem**: API endpoints not responding
- **Solution**: Ensure backend server is running and routes are properly configured
- **Debug**: Check backend terminal for route loading logs

## Security Features
- **Authentication Required**: All routes protected with JWT authentication
- **Role-based Access**: Admin routes require admin middleware
- **User Isolation**: Users can only access their own support chats
- **Admin Access**: Admins can access all support chats

## Error Handling
- Comprehensive error handling in all API endpoints
- User-friendly Arabic error messages
- Proper HTTP status codes
- Console logging for debugging

## Real-time Features
- **Socket.IO Integration**: Instant message delivery
- **Room-based Chatting**: Each support chat has its own room
- **Automatic Joining**: Users automatically join their chat room
- **Broadcast Messages**: Messages sent to all participants in chat

## Database Relationships
- **SupportChat** → **User** (One-to-One)
- **SupportMessage** → **SupportChat** (Many-to-One)
- **SupportMessage** → **User** (Many-to-One for sender)

## Future Enhancements
- File attachment support
- Chat status indicators (online/offline)
- Message read receipts
- Chat search functionality
- Support ticket categorization
- Automated responses for common queries

## Troubleshooting
If you encounter the error "Route.get() requires a callback function but got a [object Undefined]", ensure:
1. All controller functions are properly exported
2. Route order is correct (specific routes before parameterized routes)
3. No syntax errors in controller files
4. All required models are properly imported 