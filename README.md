# 🏢 HostelSync - Modern Hostel Complaint Management

**HostelSync** is a premium, high-performance hostel management portal built with **Next.js 15**, **Supabase**, and **Tailwind CSS**. It provides a seamless interface for students to report issues and for administrators to track and resolve them in real-time.

![HostelSync](public/logo.png)

---

## ✨ Features

### 👨‍🎓 For Students

- **Smart Dashboard**: Instant overview of pending, in-progress, and resolved complaints.
- **Easy Reporting**: High-definition forms with validation for quick issue submission.
- **Live Tracking**: Real-time status updates and a visual timeline for every complaint.
- **Personal History**: Full archive of all past reports for future reference.

### 👩‍💼 For Administrators

- **Executive Overview**: System-wide analytics and trend monitoring.
- **Operational Control**: Direct status management and triage for incoming complaints.
- **Real-time Sync**: Database integration for instantaneous updates across the portal.
- **Governance**: Manage categories, roles, and system-wide settings.

---

## 🎨 Design Aesthetics

- **Premium Dark Mode**: Deep-navy and slate theme designed for reduced eye strain and high readability.
- **Glassmorphism**: Subtle translucent effects and background blurs for a modern, sophisticated feel.
- **Micro-animations**: Smooth transitions and loading states that make the UI feel alive.
- **Fully Responsive**: Optimized for everything from mobile phones up to high-definition monitors.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Charts**: [Chart.js](https://www.chartjs.org/)

---

## 🏗️ Getting Started

### Prerequisites

- Node.js 20+
- A Supabase account and project

### 1. Clone & Install

```bash
git clone https://github.com/MD-Arif-Hasnat/hostelsync.git
cd hostelsync
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

Run the SQL script provided in `scripts/setup.sql` in your Supabase SQL Editor to initialize the required tables and RLS policies.

### 4. Launch

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## 📁 Project Structure

```text
src/
 ├── app/           # Routes and application logic
 ├── components/    # Reusable UI components and theme provider
 ├── lib/           # Supabase client and utilities
public/             # Brand assets and static files
scripts/            # Database initialization scripts
```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

Developed by **[Md Arif Hasnat](https://github.com/MD-Arif-Hasnat)**
