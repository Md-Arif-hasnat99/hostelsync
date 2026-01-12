# 🏢 HostelSync – Premium Hostel Management Portal

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ec78c?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**HostelSync** is a high-performance, enterprise-grade management portal designed to bridge the gap between students and hostel administration. Built with an obsession for speed, modern aesthetics, and real-time synchronization.

---

## 🌟 Key Features

### 👨‍🎓 For Students

- **Smart Triage Reporting**: Simplified forms with pre-categorized issue types for faster filing.
- **Visual Status Timeline**: Track the journey of your complaint from "Received" to "Fixed" with a beautiful, color-coded timeline.
- **Account Governance**: Manage your profile details and security settings directly from the dashboard.
- **Searchable Archives**: Instantly find past complaints using a powerful keyword-search system.

### 👩‍💼 For Administrators

- **Executive Operations Center**: A unified command center to monitor all hostel systems and pending tasks.
- **Real-Time Database Sync**: Powered by Supabase Realtime, the admin dashboard updates the moment a student hits "Submit".
- **Dynamic Analytics**: Visualized trends showing the most common maintenance issues (WiFi, Water, Electricity).
- **Audit Logs**: Comprehensive tracking of system updates and complaint status changes.

---

## 🎨 Design Philosophy

### Premium Dark Mode & Glassmorphism

HostelSync utilizes a custom-built **semantic theme engine** (Tailwind CSS v4 + @theme).

- **Glassmorphism**: Headers and cards utilize backdrop-blur and specific translucency tokens for a modern, sophisticated look.
- **Dynamic Theming**: One-click toggle between a deep "Midnight Navy" dark mode and a clean "Arctic Slate" light mode.
- **Aesthetic Precision**: Every button, input field, and badge has been tuned for high contrast and perfect visibility in both themes.

---

## 🛠️ Technical Implementation

- **Next.js 15 (App Router)**: Utilizing server-side rendering for speed and client-side transitions for smoothness.
- **Supabase Integration**:
  - **Authentication**: Secure email/password login and registration.
  - **Database**: PostgreSQL with built-in Row Level Security (RLS).
  - **Realtime**: Instant UI updates via publication/subscription channels.
- **Data Integrity**: All forms are validated client-side and server-side using **Zod** and **React Hook Form**.
- **Charts**: Interactive data visualization using **Chart.js** with theme-adaptive colors.

---

## 🏗️ Getting Started

### Prerequisites

- Node.js 20+
- A Supabase Project ([Create one here](https://app.supabase.com))

### 1. Installation

```bash
git clone https://github.com/Md-Arif-hasnat99/hostelsync.git
cd hostelsync
npm install
```

### 2. Environment Configuration

Create a `.env.local` file and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Database Initialization

Execute the following SQL commands in your Supabase SQL Editor to prepare the schema:

```sql
-- Create the Complaints Table
create table complaints (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'in_progress', 'resolved')),
  priority text default 'normal' check (priority in ('normal', 'urgent')),
  student_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Enable Realtime Sync
alter publication supabase_realtime add table complaints;

-- Configure Security (RLS)
alter table complaints enable row level security;

create policy "Enable select for all authenticated users"
on complaints for select using (auth.role() = 'authenticated');

create policy "Students can insert their own complaints"
on complaints for insert with check (auth.role() = 'authenticated');

create policy "Admins can update all status fields"
on complaints for update using (true);
```

### 4. Development

```bash
npm run dev
```

---

## 📁 Project Structure

```text
├── src/
│   ├── app/            # Next.js Routes & App Logic
│   ├── components/
│   │   ├── ui/         # Atomic UI Components (Buttons, Inputs, etc.)
│   │   └── theme/      # Theme Management & Providers
│   └── lib/            # Shared Utilities (Supabase Client)
├── public/             # Optimized Static Assets
└── scripts/            # Database Migration Scripts
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🛡️ License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

**Developed with ❤️ by [Md Arif Hasnat](https://github.com/Md-Arif-Hasnat99)**
