# HIREOS - Frontend Only

A pure React frontend for HIREOS, an AI-powered job search automation platform.

## Project Structure

```
Hire-Os/
├── frontend/                    # All frontend code & config
│   ├── src/                    # React source code
│   │   ├── assets/            # Frontend assets
│   │   ├── components/        # React components
│   │   │   ├── site/         # Page sections
│   │   │   └── ui/           # UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities
│   │   ├── routes/           # TanStack Router pages
│   │   ├── main.tsx          # Entry point
│   │   ├── router.tsx        # Router config
│   │   ├── routeTree.gen.ts # Generated routes
│   │   └── styles.css        # Tailwind styles
│   ├── public/               # Static files
│   ├── index.html            # HTML entry
│   ├── vite.config.ts        # Vite build config
│   ├── tsconfig.json         # TypeScript config
│   ├── package.json          # Dependencies
│   └── ...config files       # ESLint, Prettier
├── .git/                       # Git repository
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+ (current: 22.11.0 - minor deprecation warning)
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
cd frontend
npm run dev
```

The dev server will start at `http://localhost:5174/` (or next available port)

### Build

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Preview Production Build

```bash
cd frontend
npm run preview
```

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool & dev server
- **TanStack Router** - Routing
- **Framer Motion** - Animations
- **GSAP** - Scroll animations
- **Lenis** - Smooth scrolling
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **TypeScript** - Type safety

## Features

- 🎨 Modern landing page with smooth animations
- 🔄 Client-side routing
- 📱 Fully responsive design
- ✨ Framer Motion animations
- 🎯 Tailwind CSS styling
- 🧩 Reusable UI components

## Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
```
