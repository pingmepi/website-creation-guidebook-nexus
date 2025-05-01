# API Documentation

This document provides a comprehensive overview of all APIs in the Custom T-Shirt Hub platform, including both implemented and planned endpoints.

## Table of Contents
- [Authentication APIs](#authentication-apis)
- [Design APIs](#design-apis)
- [Theme APIs](#theme-apis)
- [Question APIs](#question-apis)
- [Order APIs](#order-apis)
- [User APIs](#user-apis)
- [Sample Images APIs](#sample-images-apis)

## Implementation Status Legend
- ✅ **Implemented**: API is fully implemented and working
- 🚧 **Partially Implemented**: Some aspects of the API are implemented
- ❌ **Planned**: API is defined but not yet implemented

## Authentication APIs

### Supabase Auth Endpoints (✅ Implemented)
These endpoints are implemented using Supabase authentication.

#### Sign Up
- **Status**: ✅ Implemented
- **Endpoint**: `auth.signUp`
- **Description**: Creates a new user account
- **Used in**: `src/pages/auth/Signup.tsx`
- **Request**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "options": {
    "data": {
      "full_name": "User Name"
    }
  }
}
```

#### Sign In
- **Status**: ✅ Implemented
- **Endpoint**: `auth.signInWithPassword`
- **Description**: Authenticates a user
- **Used in**: `src/pages/auth/Login.tsx`
- **Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Sign Out
- **Status**: ✅ Implemented
- **Endpoint**: `auth.signOut`
- **Description**: Signs out the current user
- **Used in**: `src/context/AuthContext.tsx`

#### Get Session
- **Status**: ✅ Implemented
- **Endpoint**: `auth.getSession`
- **Description**: Retrieves the current user session
- **Used in**: `src/hooks/useAuth.tsx`

## Design APIs

### Get All Designs
- **Status**: ✅ Implemented
- **Endpoint**: Database query `designs` table
- **Description**: Fetches all designs for a user
- **Used in**: `src/pages/user/Dashboard.tsx`
- **Response**:
```json
{
  "designs": [
    {
      "id": "design-123",
      "user_id": "user-123",
      "design_data": {},
      "preview_url": "url",
      "created_at": "timestamp"
    }
  ]
}
```

### Save Design
- **Status**: ✅ Implemented
- **Endpoint**: Database insert to `designs` table
- **Description**: Saves a new design
- **Used in**: `src/hooks/useDesignState.ts`
- **Request**:
```json
{
  "user_id": "user-123",
  "question_responses": {},
  "design_data": {},
  "preview_url": "url"
}
```

### Get Design Preview (❌ Planned)
- **Status**: ❌ Planned
- **Endpoint**: `POST /generate-design-preview`
- **Description**: Generates a preview of the design
- **Request**:
```json
{
  "design_intent": {
    "text": "Design text",
    "colors": "color scheme",
    "layout": "layout type",
    "image": "image url"
  }
}
```
- **Response**:
```json
{
  "preview_url": "https://cdn.example.com/previews/design123.png"
}
```

## Theme APIs

### Get Themes
- **Status**: ✅ Implemented
- **Endpoint**: Database query `themes` table
- **Description**: Fetches available themes
- **Used in**: `src/services/themesService.ts`
- **Response**:
```json
{
  "themes": [
    {
      "id": "theme-1",
      "name": "Theme Name",
      "category": "Category",
      "is_active": true
    }
  ]
}
```

### Confirmation Dialog (✅ Implemented)
- **Status**: ✅ Implemented
- **Description**: Displays question responses for user confirmation before proceeding
- **Used in**: `src/components/design/ConfirmationDialog.tsx`

### Get Question Text (✅ Implemented)
- **Status**: ✅ Implemented
- **Endpoint**: Client-side function
- **Description**: Retrieves human-readable question text based on question IDs
- **Used in**: Various components that display question texts

### Track Theme Selection (Implemented)
- **Endpoint**: Database function `track_theme_selection`
- **Description**: Tracks user theme selections
- **Used in**: `src/services/themesService.ts`
- **Request**:
```json
{
  "p_user_id": "user-123",
  "p_theme_ids": ["theme-1", "theme-2"],
  "p_design_session_id": "session-123"
}
```

## Question APIs

### Get Theme-Based Questions (Implemented)
- **Endpoint**: Database function `get_theme_based_questions`
- **Description**: Fetches questions based on selected themes
- **Used in**: `src/services/questionsService.ts`
- **Request**:
```json
{
  "theme_ids": ["theme-1", "theme-2"],
  "limit_count": 5
}
```
- **Response**:
```json
[
  {
    "id": "q1",
    "question_text": "Question text",
    "type": "text/choice/color",
    "options": ["option1", "option2"],
    "is_active": true
  }
]
```

### Track Question Usage (Implemented)
- **Endpoint**: Database update on `questions` table
- **Description**: Increments question usage count
- **Used in**: `src/services/questionsService.ts`

## Sample Images APIs

### Get Sample Images (Implemented)
- **Endpoint**: Database query `sample_images` table
- **Description**: Fetches sample designs
- **Used in**: `src/api/sample-images.ts`
- **Response**:
```json
{
  "designs": [
    {
      "id": "sample-1",
      "title": "Sample Design",
      "image_url": "url",
      "is_featured": true,
      "category": "category"
    }
  ]
}
```

### Get Featured Images (Implemented)
- **Endpoint**: Database query `sample_images` table with filter
- **Description**: Fetches featured sample designs
- **Used in**: `src/api/sample-images.ts`

### Get Images by Category (Implemented)
- **Endpoint**: Database query `sample_images` table with category filter
- **Description**: Fetches sample designs by category
- **Used in**: `src/api/sample-images.ts`

## Order APIs (Documented but not implemented)

### Create Order
- **Endpoint**: `POST /create-order`
- **Description**: Creates a new order
- **Status**: Planned
- **Request**:
```json
{
  "user_id": "user-123",
  "design_id": "design-789",
  "shipping_info": {
    "name": "Customer Name",
    "address": "Street Address",
    "city": "City",
    "state": "State",
    "postal_code": "123456",
    "phone": "1234567890"
  },
  "payment_id": "payment-123"
}
```

### Get User Orders
- **Endpoint**: `GET /user-orders`
- **Description**: Fetches orders for a user
- **Status**: Planned
- **Request**:
```json
{
  "user_id": "user-123"
}
```

### Get Admin Orders
- **Endpoint**: `GET /admin-orders`
- **Description**: Fetches all orders (admin only)
- **Status**: Planned
- **Request**:
```json
{
  "filter": {
    "status": "pending"
  }
}
```

### Update Order Status
- **Endpoint**: `POST /update-order-status`
- **Description**: Updates order status
- **Status**: Planned
- **Request**:
```json
{
  "order_id": "order-123",
  "new_status": "shipped"
}
```

## New APIs Required

### Get Design Editor Initial State
- **Status**: 🚧 Partially Implemented
- **Description**: Initializes the design editor with appropriate state based on user responses
- **Used in**: `src/hooks/useCanvasInitialization.ts`
- **Implementation Needs**:
  - Improved loading performance
  - Better integration with fabric.js
  - Proper handling of t-shirt mockup images

### Navigate to Previous Question
- **Status**: 🚧 Partially Implemented
- **Description**: Handles navigation between questions in the question flow
- **Used in**: Question flow components
- **Implementation Needs**:
  - Better state management for question history
  - Proper handling of "Back" functionality

### Get User Preferences
- **Endpoint**: `GET /user-preferences/:userId`
- **Description**: Retrieves user's design preferences
- **Status**: Planned
- **Response**:
```json
{
  "color_preferences": ["blue", "pastel", "muted"],
  "style_preferences": ["minimal", "elegant"],
  "most_recent_design_id": "design-789",
  "total_designs": 4,
  "total_orders": 2
}
```

## User APIs

### Get User Profile
- **Endpoint**: `GET /user/:userId`
- **Description**: Retrieves user profile information
- **Status**: Planned
- **Response**:
```json
{
  "user_id": "user-123",
  "full_name": "User Name",
  "email": "user@example.com",
  "profile_image": "url"
}
```

### Update User Profile
- **Endpoint**: `PUT /user/:userId`
- **Description**: Updates user profile information
- **Status**: Planned
- **Request**:
```json
{
  "full_name": "New Name",
  "email": "newemail@example.com",
  "profile_image": "new url"
}
```

## Notes
- Implemented APIs are those currently being used in the codebase
- Documented APIs are those specified in the PRD but not yet implemented
- Some APIs use direct database queries via Supabase client
- Additional APIs may be needed for future features
