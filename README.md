# WordMaster Web

The web client for the WordMaster vocabulary learning platform. Built with React 19, Vite, and modern UI libraries to provide a responsive and interactive learning experience.

## 🛠 Tech Stack

- **Core**: React 19, Vite 7
- **Routing**: React Router DOM 7
- **State Management**: Zustand
- **Styling**: Tailwind CSS, Tailwind Merge, CLSX
- **Animations**: Framer Motion, GSAP, Lenis
- **UI Components**: Headless UI, Heroicons, Lucide React
- **Forms & Validation**: React Hook Form, Zod
- **Data Fetching**: Axios
- **Charts**: Recharts
- **Utilities**: date-fns, xlsx

## ✨ Key Features

- **Dashboard**: Visual overview of learning progress and daily stats.
- **Wordbook Management**: Create, organize, and manage vocabulary lists.
- **Study Mode**: Interactive flashcards and learning tools with "Complete Review" mode.
- **Exam System**: Test your knowledge with generated quizzes.
- **Progress Tracking**: Detailed analytics using Recharts.
- **Responsive Design**: Mobile-friendly interface with fluid animations.

## 📂 Project Structure

```
web/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components (Routes)
│   │   ├── auth/        # Login & Register
│   │   ├── dashboard/   # User Dashboard
│   │   ├── exam/        # Exam & Testing interfaces
│   │   ├── messages/    # User notifications/messages
│   │   ├── study/       # Study session interfaces
│   │   ├── user/        # User profile and settings
│   │   ├── wordbook/    # Vocabulary management
│   │   └── Home.jsx     # Landing page
│   ├── lib/             # Utility functions and configurations
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Entry point
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.js       # Vite configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Backend server running (see `../backend/README.md` or root `CLAUDE.md`)

### Installation

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## ⚙️ Configuration

The application communicates with the WordMaster backend (FastAPI). Ensure the backend is running at `http://localhost:8000` (default) or configure the API base URL in the application settings/constants.

## 📝 Development Guidelines

- **Naming**: Use `CamelCase` for React components and `camelCase` for functions/variables.
- **Styling**: Use Tailwind CSS utility classes. For complex conditional classes, use `clsx` and `tailwind-merge`.
- **State**: Use `zustand` for global state (e.g., user session, theme) and local state for component-specific logic.
- **Icons**: Prefer `lucide-react` or `@heroicons/react`.
