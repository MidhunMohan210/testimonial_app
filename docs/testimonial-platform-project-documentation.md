# Testimonial Collecting Platform

## Complete Project Documentation

### 1. Project Overview

The Testimonial Collecting Platform is a complete customer feedback, testimonial management, and reputation growth system for businesses.

It helps businesses collect customer feedback through public review links and WhatsApp, automatically separate positive and negative responses, manage private complaints internally, approve testimonials before publishing, and display trusted customer reviews publicly through testimonial pages and website widgets.

The platform is designed to help businesses build trust, improve service quality, increase public proof, and protect their brand reputation.

### 2. Core Purpose

Many businesses face the same feedback problems:

- They do not ask customers for reviews consistently.
- Happy customers often leave without sharing testimonials.
- Negative feedback may appear publicly before the business can respond.
- Customer complaints are not always tracked properly.
- Website visitors may not see enough social proof before making a decision.

This project solves those problems by creating a structured feedback-to-reputation workflow.

The platform allows businesses to:

- Collect customer feedback through a simple link or WhatsApp request.
- Route positive responses into a testimonial approval system.
- Route negative responses into a private feedback workspace.
- Track and resolve customer complaints internally.
- Publish only approved testimonials.
- Display testimonials publicly on a page or embedded website widget.
- Guide happy customers to leave Google reviews.

### 3. Target Users

This platform is useful for:

- Small and medium businesses
- Agencies
- Clinics and healthcare service providers
- Coaching and consulting businesses
- Local shops and service centers
- Online brands
- Freelancers and professionals
- Any team that wants to improve customer trust and reputation

### 4. Main Workflow

The complete user journey works like this:

1. A business creates an account.
2. The platform creates a unique business profile and review link.
3. The business shares the review link with customers or sends a WhatsApp review request.
4. The customer opens the link or replies through WhatsApp.
5. The customer gives a star rating.
6. If the rating is high, the response goes into the testimonial flow.
7. If the rating is low, the response goes into the private feedback flow.
8. The business reviews all submissions in the dashboard.
9. Testimonials can be approved, hidden, or kept pending.
10. Private feedback can be tracked and resolved internally.
11. Approved testimonials appear on a public testimonial page.
12. Testimonials can also be embedded on the business website.
13. Happy customers can be guided to leave a Google review.

### 5. Main Modules

#### 5.1 Authentication Module

The platform includes secure authentication for business users.

Features:

- Business owner registration
- Login using email or mobile number
- Password hashing
- JWT-based authentication
- Protected dashboard routes
- Business account linked to each user

During registration, the system creates both a user account and a business profile.

#### 5.2 Business Profile Module

Each registered business gets its own profile.

Business profile includes:

- Business name
- Unique business slug
- Public review link
- Public testimonial page
- Google review settings
- Public visibility settings
- WhatsApp connection details

The slug is used to create public URLs such as:

- `/r/business-slug`
- `/p/business-slug`
- `/widget/slider/business-slug`

#### 5.3 Public Review Link Module

Every business receives a unique public review link. This link is easy to share through WhatsApp, SMS, email, invoices, receipts, or customer follow-ups.

Example:

`https://yourdomain.com/r/business-name`

Customers can open this link and submit feedback without logging in.

#### 5.4 Customer Feedback Form

The customer feedback form is simple and mobile-friendly.

Flow:

1. Customer selects a star rating from 1 to 5.
2. Based on the rating, the platform decides the next step.
3. Customer writes a review or private feedback.
4. Customer submits the form.

Rating logic:

- 4 or 5 stars: testimonial flow
- 1, 2, or 3 stars: private feedback flow

The form includes:

- Star rating
- Customer name
- Review message
- Private feedback message
- Optional contact email
- Optional contact phone
- Follow-up permission checkbox
- Character limits
- Validation messages

#### 5.5 Smart Positive and Negative Routing

The platform automatically separates feedback based on customer rating.

Positive feedback:

- Ratings of 4 or 5
- Stored as testimonials
- Initially marked as pending
- Can be approved before public display

Negative feedback:

- Ratings of 1, 2, or 3
- Stored privately
- Not shown publicly
- Sent to the private feedback workspace

This protects the business reputation while still allowing honest customer feedback to be handled properly.

#### 5.6 Testimonial Management Module

Businesses can manage all testimonial submissions from the dashboard.

Testimonial statuses:

- Pending
- Approved
- Hidden

Features:

- View all testimonials
- Filter by status
- Approve testimonials
- Hide testimonials
- Move testimonials back to pending
- View testimonial details
- Track customer name, rating, text, source, and date
- Pagination support
- Unread testimonial count
- Mark testimonials as read

Testimonial sources:

- Public review link
- WhatsApp
- Manual entry

#### 5.7 Manual Testimonial Entry

Businesses can manually add testimonials.

This is useful for:

- Offline reviews
- In-store feedback
- Phone call praise
- Legacy testimonials
- Feedback collected from other platforms

Manual testimonials are added directly into the testimonial system and can be approved for public use.

#### 5.8 Private Feedback Workspace

Low-rated customer feedback is stored privately and is never shown on public pages or widgets.

Private feedback includes:

- Customer name
- Rating
- Feedback message
- Contact email
- Contact phone
- Follow-up permission
- Internal business response
- Status
- Created date
- Resolved date

Private feedback statuses:

- New
- In Progress
- Resolved
- Closed

This helps businesses handle complaints professionally and avoid ignoring customer issues.

#### 5.9 Private Feedback Response System

The platform includes tools to help businesses respond to unhappy customers.

Features:

- Add internal business response
- Save response notes
- Change feedback status
- Mark feedback as resolved
- Track response time
- Track resolved time
- Use pre-written response templates

Response templates include:

- Apology
- Ask for more details
- Resolution update
- Second chance / recovery
- Thank you for honest feedback

#### 5.10 Dashboard Module

The dashboard gives businesses a quick overview of their reputation activity.

Dashboard includes:

- Total testimonials
- Approved testimonials
- Pending testimonials
- Hidden testimonials
- Private feedback count
- Average rating
- Approval rate
- Recent testimonials
- Public review link copy option
- Widget embed code copy option
- Quick access to settings
- Quick access to send review request

The dashboard is designed for at-a-glance decision making.

#### 5.11 Advanced Filtering and Pagination

The platform supports advanced filtering for both testimonials and private feedback.

Filters include:

- Status filter
- Date filter
- Today
- Yesterday
- This week
- Previous week
- This month
- Previous month
- Previous three months
- Custom date range
- Rating sort
- High to low
- Low to high
- Word count filter
- Short feedback
- Medium feedback
- Long feedback
- Custom minimum and maximum word count

Pagination helps businesses manage large volumes of feedback without clutter.

#### 5.12 Google Review Link Feature

Businesses can add their Google Review URL in settings.

Purpose:

- Redirect happy customers to Google
- Increase public Google reviews
- Improve search trust
- Support local SEO
- Convert internal positive feedback into external reputation growth

Businesses can add, enable, disable, and update the Google Review link anytime.

#### 5.13 Public Testimonials Page

Each business has a public testimonial page.

Example:

`/p/business-slug`

This page displays only approved testimonials.

Public page includes:

- Business name
- Approved testimonials
- Customer names
- Ratings
- Review text
- Average rating
- Total testimonial count

Businesses can share this page with potential customers to build trust.

#### 5.14 Embeddable Testimonial Widget

The platform includes a website widget that businesses can embed on their own websites.

Widget purpose:

- Show testimonials directly on business websites
- Improve website credibility
- Increase conversion trust
- Display real customer proof near important sections

Embed example:

```html
<div
  class="woice-testimonial-widget"
  data-business-slug="business-slug"
  data-theme="light"
  data-layout="slider"
  data-height="420"
></div>

<script
  src="https://yourdomain.com/embed.js"
  data-base-url="https://yourdomain.com"
  defer
></script>
```

Widget features:

- Slider layout
- Grid layout support
- Lazy loading
- Iframe-based embed
- Auto height resizing
- Public cross-origin support
- Fallback message if testimonials cannot load
- Works on external websites

#### 5.15 Embed Documentation Page

The project includes an embed documentation page.

This page helps businesses understand:

- How to copy embed code
- How to place widget code on their website
- How to configure business slug
- How to choose layout
- How to set widget height
- How the embed script works

#### 5.16 WhatsApp Review Request Module

The platform includes WhatsApp-based review request sending.

Businesses can send review requests directly to customer WhatsApp numbers.

Features:

- Send WhatsApp review request
- Customer name support
- Customer phone number support
- WhatsApp template message support
- Request status tracking
- Request history
- Failed request tracking

Request statuses:

- Sent
- Replied
- Failed

This helps businesses collect more feedback by reaching customers on a familiar channel.

#### 5.17 WhatsApp Embedded Signup

The platform supports WhatsApp Business embedded signup.

Purpose:

- Connect business WhatsApp account
- Store WhatsApp Business Account ID
- Store phone number ID
- Connect WhatsApp sending flow to each business

Stored WhatsApp account data includes:

- WABA ID
- Phone number ID
- Business ID
- Access token
- Connected time

#### 5.18 WhatsApp Webhook Review Collection

The backend includes webhook support for WhatsApp replies.

WhatsApp flow:

1. Business sends review request.
2. Customer replies with a rating from 1 to 5.
3. System stores the temporary rating.
4. System asks the customer to write a short review.
5. Customer replies with review text.
6. System saves the response as a pending testimonial.
7. System marks the request as replied.
8. System sends a thank-you message.

This creates a conversational review collection flow inside WhatsApp.

#### 5.19 Business Settings Module

Business owners can manage platform settings.

Settings include:

- Business name
- Review link
- Google Review link
- Google Review enable/disable
- Public testimonial visibility
- Notification setting

The settings module allows businesses to control how their public reputation flow works.

#### 5.20 Landing and Public Pages

The project includes public marketing and information pages.

Pages include:

- Landing page
- Contact page
- Privacy policy page
- Terms page
- Login page
- Register page
- Embed documentation page

The landing page includes product preview sections and explains how the platform works.

### 6. Backend API Overview

Main backend API groups:

- `/api/auth`
- `/api/business`
- `/api/testimonials`
- `/api/feedback`
- `/api/r`
- `/api/p`
- `/api/whatsapp`
- `/webhook/whatsapp`

Important API responsibilities:

- Authentication
- Business settings
- Testimonial management
- Private feedback management
- Public review submission
- Public testimonial display
- WhatsApp request sending
- WhatsApp account connection
- WhatsApp webhook handling

### 7. Data Models

#### 7.1 User Model

Stores business user account details.

Includes:

- Name
- Email
- Mobile
- Password
- Business ID
- Created date

#### 7.2 Business Model

Stores business profile and settings.

Includes:

- User ID
- Business name
- Slug
- Google Review link
- Google Review enabled
- Public testimonials enabled
- Notifications enabled
- WhatsApp phone number ID
- WhatsApp business account ID
- API key
- Created date

#### 7.3 Testimonial Model

Stores positive feedback and testimonials.

Includes:

- Business ID
- Customer name
- Customer phone
- Rating
- Testimonial text
- Status
- Source
- WhatsApp message ID
- IP address
- Collected date
- Read/unread state

Statuses:

- Pending
- Approved
- Hidden

Sources:

- WhatsApp
- Manual
- Link

#### 7.4 Private Feedback Model

Stores low-rated feedback privately.

Includes:

- Business ID
- Customer name
- Rating
- Feedback text
- Contact email
- Contact phone
- Allow follow-up
- Status
- Business response
- Responded date
- Resolved date
- Created date
- Read/unread state

Statuses:

- New
- In Progress
- Resolved
- Closed

#### 7.5 WhatsApp Request Model

Stores WhatsApp review request activity.

Includes:

- Business ID
- Customer phone
- Customer name
- Status
- Step
- Temporary rating
- Sent date

Statuses:

- Sent
- Replied
- Failed

#### 7.6 WhatsApp Account Model

Stores connected WhatsApp Business account details.

Includes:

- WABA ID
- Phone number ID
- Business ID
- Access token
- Connected date
- Linked platform business
- Linked user

### 8. Security and Validation

The project includes several security and reliability features:

- Password hashing with bcrypt
- JWT authentication
- Protected dashboard routes
- Zod request validation
- Rate limiting for public review submissions
- Rate limiting for public testimonial reads
- Helmet security headers
- Session storage with MongoDB
- CORS support
- Webhook signature verification in production
- Input validation for URLs, ratings, phone numbers, and messages

### 9. Technology Stack

Frontend:

- React
- Vite
- Tailwind CSS
- React Router
- TanStack React Query
- React Hook Form
- Framer Motion
- Lucide React Icons
- Sonner Toasts
- Axios

Backend:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Zod
- Helmet
- CORS
- Express Rate Limit
- Express Session
- Connect Mongo
- WhatsApp Cloud API

### 10. Business Benefits

The platform helps businesses:

1. Collect more testimonials consistently.
2. Increase public trust using approved reviews.
3. Reduce reputation risk by keeping complaints private.
4. Improve customer service through structured feedback tracking.
5. Recover unhappy customers with follow-up workflows.
6. Increase Google reviews from happy customers.
7. Improve website conversion using embedded social proof.
8. Centralize feedback collection, moderation, and publishing.
9. Use WhatsApp to collect reviews more naturally.
10. Build a repeatable reputation management process.

### 11. Final Project Summary

The Testimonial Collecting Platform is a complete feedback-to-reputation system for businesses. It allows businesses to collect customer feedback through public links and WhatsApp, automatically separate positive testimonials from private complaints, manage and resolve negative feedback internally, approve testimonials before publishing, display social proof through public pages and embeddable widgets, and guide happy customers toward Google reviews.

It combines testimonial collection, private feedback management, WhatsApp review automation, Google review growth, and website social proof into one organized platform.
