# Task Planner - Daily Task Management

A modern, professional daily task planner web application built with Next.js 16, TypeScript, and SQLite.

## Features

### Core Features

- **Lists**: Create custom lists with colors and emojis. "Inbox" is the default magic list.
- **Tasks**: Comprehensive task management with:
  - Name, Description
  - Date and Deadline
  - Reminders
  - Time tracking (Estimate and Actual time)
  - Labels (multiple with icons)
  - Priority levels (High, Medium, Low, None)
  - Subtasks/Checklists
  - Recurring tasks (Daily, Weekly, Weekday, Monthly, Yearly, Custom)
  - Attachments support
  - Complete change history logging

- **Views**:
  - Today: Tasks scheduled for today
  - Next 7 Days: Tasks for the next week
  - Upcoming: All future tasks
  - All: All tasks (scheduled and unscheduled)
  - Toggle completed tasks visibility

- **Task Management**:
  - Sidebar navigation with lists, views, and labels
  - Subtasks and checklist support
  - Overdue tasks badge count
  - Fast fuzzy search

### UI Features

- Clean, minimalistic design
- Dark and light theme support (defaults to system preference)
- Responsive design for desktop and mobile
- Smooth animations with Framer Motion
- View Transition API for page changes

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Database**: SQLite (better-sqlite3)
- **Forms**: React Hook Form with Zod validation
- **Testing**: Bun Test
- **Runtime**: Bun

## Getting Started

### Prerequisites

- Bun installed on your system

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd todo-composer-1
```

2. Install dependencies:
```bash
bun install
```

3. Run the development server:
```bash
bun run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database

The SQLite database is automatically created in the `data/` directory when you first run the application. The database schema includes:

- Lists
- Tasks
- Labels
- Subtasks
- Task Labels (many-to-many)
- Task Changes (audit log)

## Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run test` - Run tests
- `bun run lint` - Run ESLint

## Project Structure

```
todo-composer-1/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── sidebar.tsx       # Sidebar component
│   ├── task-card.tsx     # Task card component
│   ├── task-form.tsx     # Task form component
│   └── ...
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and database
│   ├── db.ts            # Database setup
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Utility functions
└── data/                # SQLite database (gitignored)
```

## Testing

Run tests with:
```bash
bun test
```

## License

MIT
