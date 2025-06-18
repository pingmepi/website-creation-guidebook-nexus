# T-Shirt Design & Ordering Platform - Product Requirements Document

**Date**: 2025-04-04\
**Author**: [Your Name]\
**Status**: Work in Progress

## Overview

A personalized t-shirt design and ordering platform that enables users to create custom apparel through a dynamic, AI-assisted design flow with editable previews. Built for manual fulfillment today, the system is modular to enable automated printing and shipping tomorrow. The architecture will follow a modular design approach, allowing key components such as the design engine, fulfillment service, or payment gateway to be swapped or upgraded independently. The landing page will act as an entry point showcasing pre-designed templates. Users can preview these on various t-shirt colors before entering the design flow.

## Problem Statement

Users lack an intuitive platform to easily design, personalize, and order printed t-shirts with a smooth design experience and reliable fulfillment.

## Success Metrics

- % users who complete a design
- % design -> order conversions
- Manual fulfillment turnaround time
- Order feedback (CSAT)

## User Stories

```
As a customer
I want to answer a few simple design questions
So that I can create a personalized t-shirt that reflects my style

As a customer
I want a dashboard that shows a draft of a design (only give one draft option) to edit the generated design through a visual editor
So that I can personalize the output to match my preferences

As an admin
I want to manage, fulfill, and track orders
So that I can ensure smooth delivery and customer satisfaction
```

## Functional Requirements
- Landing page showcasing pre-designed t-shirts to inspire users
- T-shirt color selector to preview templates on different colors (e.g., black, white, grey)
- User authentication with email/password (basic implementation)
- Theme selection view with ~15 predefined themes shown as cards/toggles
- Step-by-step question flow with one question shown at a time and a progress bar
- Confirmation dialog to review question responses before proceeding
- Basic design editor with fabric.js for customization
- Question response sidebar during design editing to reference user preferences

- Role-based access control (Customer, Admin)
- Capture and store all user responses to questions
- Generate a preview design based on question inputs
- User dashboard to view saved designs and past orders

- If the user is not logged in, a sign-up pop-up should be shown
- Allow users to edit the generated design using a visual editor
- Store the original model-generated image and the final user-edited image
- Maintain metadata: themes, user responses, editor actions, timestamps
- Enable design reordering from saved history
- Collect shipping details including phone, address, and pin code
- Integrate payments using PhonePe (primary) or Razorpay/Stripe (fallback) with INR currency support
- Create orders with status tracking (pending, printing, shipped, delivered)
- Admin dashboard to manage and update order statuses
- Basic support section with contact number
- Track question usage statistics for analytics and improvement

### Must Have
 Landing page showcasing pre-designed t-shirts to inspire users

 T-shirt color selector to preview templates on different colors (e.g., black, white, grey)

 User authentication with email/password
 as V1, keep the signup/signin flow simpla:
 - user enters email and password
 - if the details already exist in the database, the user has successfully logged in
 - if details do not exist, throw error "incorrect username/password"
 - highlight "signup instead" button
 - if the user clicks on signup, reload the page and take user details to create a new user. 
 - details required in the signup form are name, email, and password 
 - once the user completes the signup flow, redirect them to login again

 Role-based access control (Customer, Admin)

 Theme selection view with ~15 predefined themes shown as cards/toggles

 API integration to fetch 5 context-relevant questions based on selected themes

 Step-by-step question flow with one question shown at a time and a progress bar

 If the user is not logged in now, then a sign-up pop-up should be shown.

 Once the user logs in, the design created from the previous step should be available on the user's landing page. 

 Capture and store all user responses to questions

 Generate a preview design based on question inputs (via model/API)

 Allow users to edit the generated design using a visual editor (fabric.js)

 Store the original model-generated image and the final user-edited image

 Maintain metadata: themes, user responses, editor actions, timestamps

 Enable design reordering from saved history

 Collect shipping details including phone, address, and pin code. This can also be edited from the user profile in user dashboard. 

 Integrate payments using PhonePe (primary) or Razorpay/Stripe (fallback) with INR currency support

 Create orders with status tracking (pending, printing, shipped, delivered)

 User dashboard to view saved designs and past orders

 Admin dashboard to manage and update order statuses

 Basic support section with contact number

 Track question usage statistics for analytics and improvement

 Store comprehensive user style preferences from responses

 Color input type support in the question flow

 Proper validation for all user inputs in the design flow

 Error handling for all API calls and form submissions

 Responsive layout for all design flow screens


Additional Requirements:
- Remember me functionality for login
- Password visibility toggle in login/signup forms
- Forgot password functionality
- Form validation with proper error messages
- Redirect handling after login (return to previous page)
- Test credentials support for development (refer to test_file)
- User session management and persistence
- Background process handling for long-running operations
- Proper error handling for all API operations
- Loading states for async operations

### Nice to Have

 Toggle in user profile to enable/disable style-based design suggestions

 Track user design preferences for personalized suggestions

 Click-to-customize a prebuilt design from the landing page

 Dark mode support throughout the application

 Social media sharing of completed designs

 Bulk order discounts for team/group orders

 Design template marketplace where users can sell their designs

 Advanced color customization options with color harmony suggestions


Additional Nice to Have:
- Multi-factor authentication
- OAuth provider expansion (GitHub, Twitter)
- Session management across devices
- User activity logging
- Advanced password policies
- Account deletion functionality
- Export design history
- Batch operations for admin panel

## Technical Requirements

> **Note**: For a comprehensive list of all APIs (implemented, documented, and planned), including endpoints, payloads, and usage details, refer to [API Documentation](./api_details.md).


### Authentication Flow
- Email/Password authentication
- OAuth providers (Google, Facebook)
- Session management
- Remember me functionality 
- Password reset flow
- Email verification
- Test credentials handling

### State Management
- User session persistence
- Design state management
- Form state handling
- Loading states
- Error states
- Background process management

### Error Handling
- Form validation errors
- API error handling
- Network error handling
- Session timeout handling
- Graceful degradation
- Error logging and monitoring

- Modular component structure allowing services such as vendor APIs, payment processors, or the design editor to be replaced without affecting other parts of the system

- Supabase for authentication, database, and storage

- Custom API to return theme-based questions

- Razorpay/Stripe for payments

- Modular backend to enable future vendor integrations

## UI/UX Requirements - Implementation Status
- Theme selection view with predefined interest themes displayed as cards or toggles
- Progress bar for question design flow
- One-question-at-a-time design UI
- Confirmation dialog for reviewing responses before proceeding
- Basic DesignCanvas with fabric.js integration
- Dashboard for user profile, saved designs, and orders
- Clean dashboard for current design being edited
- Support page with email and phone
- Color picker input with visual selection and text input
- Clear error messages for failed operations
- Loading states for asynchronous operations
- Clean, Flowing UX/UI
- Landing page with a carousel or grid of already-made designs to inspire users
- Option for users to preview each design on different t-shirt colors (e.g., white, black, grey)
- Theme selection view with \~15 predefined interest themes displayed as cards or toggles
- Progress bar for 5-question design flow
- One-question-at-a-time design UI
- A DesignCanvas where there is a preloaded shirt image, with options to change the color
- The DesignCanvas also should give the option to add text, logo, and image on the already selected color tee
- Users should have an option to move and delete the added elements
- Clean dashboard for user profile, saved designs, orders, and the current design that is being edited
- Only one draft can be saved per profile
- Support page with email and phone
- If the user has logged in with 'Remember Me' then they should not be asked to login again (till cookies expire)
- Color picker input with support for both visual selection and text input
- Clear error messages for failed operations
- Loading states for all asynchronous operations
- Responsive layouts for all screen sizes
- Accessible form controls with proper labels


## Dependencies

- Supabase (Auth, DB, Storage)
- Razorpay/Stripe
- fabric.js / Konva.js for design engine
- Vercel (Hosting)

## Timeline

- Phase 1: Core auth, theme-based design flow, preview & editor setup
- Phase 2: Checkout, payment integration, and order management
- Phase 3: Admin panel, design history, fulfillment hooks

## Open Questions

- How can the modularity of each system component be maintained for long-term flexibility and scalability?

- How are designs versioned for edits post-order?
  → All orders are saved in a table with a reference to the specific version of the design used. When the user returns to reorder, designs from their order history are displayed, ensuring consistency and traceability.

- What criteria define 'user style' for personalization? 

- How will automated vendor APIs be integrated later?


## Security Considerations

- Row-Level Security (RLS) policies ensure users can only access their own designs and orders
- Admin roles have controlled access to manage questions and view order statistics
- Authentication tokens are properly managed with appropriate expiration and refresh
- User style metadata is stored securely and used only for enhancing personalization

## Performance Optimization

- Questions are cached to reduce database load
- Question usage statistics are updated asynchronously
- Design previews are optimized for fast loading
- Proper error handling prevents system failures during peak loads

## Accessibility Requirements

- All form inputs include proper aria labels
- Color inputs support both visual selection and text entry
- Progress indicators use both color and text to show completion status
- Error messages are clear and provide actionable information
