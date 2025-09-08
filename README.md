# WMX Services - Digital Agency Website

A modern, full-stack web application built with Next.js for a digital agency offering web development, mobile apps, and desktop application services.

## 🚀 Features

- **Public Website**: Modern homepage, portfolio showcase, services, and contact form
- **Client Portal**: Project dashboard with progress tracking and chat functionality
- **Admin Panel**: Complete project and portfolio management system
- **Authentication**: Secure login with NextAuth.js and GitHub OAuth
- **Real-time Features**: Chat system for client-admin communication
- **Payment Integration**: Midtrans payment gateway integration
- **Responsive Design**: Mobile-first, modern-retro design theme

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: NextAuth.js with GitHub provider
- **Database**: PostgreSQL with Prisma ORM
- **API**: tRPC for type-safe APIs
- **Styling**: Tailwind CSS with custom theme
- **UI Components**: Custom components with modern-retro design
- **Fonts**: Inter (body) and Playfair Display (headings)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- GitHub account for OAuth

## 🚀 Getting Started

### 1. Environment Setup

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random string for NextAuth.js
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: From GitHub OAuth App

### 2. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create a new OAuth App with:
   - Application name: "WMX Services"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID and Client Secret to your `.env` file

### 3. Database Setup

Run Prisma migrations to set up your database:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Design System

- **Colors**: 
  - Primary: Orange (#E57C23)
  - Background: Off-white (#F8F5F2)
  - Text: Dark gray (#333333)
- **Typography**: Inter (body) + Playfair Display (headings)
- **Theme**: Modern-retro professional

## 📱 Features Overview

### Public Pages
- **Homepage**: Hero section, services overview, featured portfolio
- **Portfolio**: Filterable project showcase
- **Services**: Detailed service descriptions and pricing
- **Contact**: Contact form and business information

### Client Portal
- **Dashboard**: Project overview with progress tracking
- **Project Details**: Milestone tracking and progress updates
- **Payment**: Invoice history and payment processing
- **Chat**: Direct communication with the team

### Admin Panel
- **Dashboard**: Overview of all projects and clients
- **Project Management**: CRUD operations for projects
- **Portfolio Management**: Add/edit portfolio items
- **Client Communication**: Chat management interface

## 🔐 User Roles

- **CLIENT**: Access to project dashboard, progress tracking, and chat
- **ADMIN**: Full access to project management, portfolio, and client communication

## 🔧 Development

### Database Operations

```bash
# Reset database
npx prisma migrate reset

# View database
npx prisma studio

# Generate client after schema changes
npx prisma generate
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🤝 Support

For support or questions, contact the development team.
