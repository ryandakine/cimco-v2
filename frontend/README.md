# CIMCO Inventory System v2 - Frontend

A React 18 + TypeScript frontend for the CIMCO Inventory Management System.

## Tech Stack

- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first styling
- **React Query (TanStack Query)** - Server state management
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **date-fns** - Date formatting

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

## Project Structure

```
src/
├── api/              # API client and endpoints
│   ├── client.ts     # Axios instance with interceptors
│   ├── auth.api.ts   # Authentication API
│   └── inventory.api.ts  # Inventory API
├── components/       # Reusable UI components
│   ├── Layout.tsx    # App shell with navigation
│   ├── Navigation.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Table.tsx
│   ├── Pagination.tsx
│   ├── Modal.tsx
│   └── Loading.tsx
├── features/         # Feature modules
│   ├── auth/         # Authentication feature
│   │   ├── AuthContext.tsx
│   │   ├── useAuth.ts
│   │   └── LoginForm.tsx
│   └── inventory/    # Inventory feature
│       ├── PartsTable.tsx
│       ├── PartFilters.tsx
│       ├── QuantityAdjustModal.tsx
│       ├── useParts.ts
│       └── inventory.api.ts
├── hooks/            # Custom React hooks
│   ├── useApi.ts
│   └── useLocalStorage.ts
├── pages/            # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Inventory.tsx
│   ├── PartDetail.tsx
│   ├── PartForm.tsx
│   └── NotFound.tsx
├── types/            # TypeScript types
│   └── index.ts
├── utils/            # Utility functions
│   ├── formatters.ts
│   └── validators.ts
├── App.tsx           # Root component
├── main.tsx          # Entry point
└── index.css         # Tailwind imports
```

## Features

- 🔐 **Authentication** - JWT-based auth with role support (admin/worker)
- 📦 **Inventory Management** - Full CRUD operations for parts
- 🔍 **Advanced Filtering** - Search, category, zone, stock state filters
- 📊 **Dashboard** - Statistics and recent activity
- 📱 **Responsive Design** - Mobile-first with card/table view switching
- 🎨 **Dark Theme** - Professional dark UI with cyan accents
- 📤 **CSV Export** - Export filtered results to CSV
- ♿ **Accessibility** - Keyboard navigation and screen reader support

## API Integration

The frontend expects a REST API with these endpoints:

```
POST   /api/v2/auth/login
POST   /api/v2/auth/logout
GET    /api/v2/auth/me
GET    /api/v2/parts
GET    /api/v2/parts/:id
POST   /api/v2/parts
PUT    /api/v2/parts/:id
DELETE /api/v2/parts/:id
POST   /api/v2/parts/:id/adjust
GET    /api/v2/parts/categories
GET    /api/v2/parts/zones
GET    /api/v2/parts/manufacturers
GET    /api/v2/dashboard/stats
```

## Development

### Code Style

- ESLint for linting
- Prettier for formatting (optional)
- TypeScript strict mode enabled

### Component Guidelines

1. Use functional components with hooks
2. Props interfaces should extend HTML attributes where applicable
3. Forward refs for interactive components
4. Use `clsx` for conditional classes
5. Follow the dark theme color palette

### Color Theme

| Purpose | Class |
|---------|-------|
| Background | `bg-slate-900` |
| Card | `bg-slate-800` |
| Primary | `text-cyan-400`, `bg-cyan-600` |
| Success | `text-emerald-400`, `bg-emerald-600` |
| Warning | `text-amber-400`, `bg-amber-600` |
| Danger | `text-red-400`, `bg-red-600` |
| Text | `text-white`, `text-slate-300`, `text-slate-400` |

## License

MIT
