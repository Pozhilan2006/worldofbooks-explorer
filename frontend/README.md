# World of Books Explorer - Frontend

Next.js frontend application for the World of Books Explorer project.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: Geist Sans & Geist Mono

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
npm install
```

### Environment Setup

Copy the environment example file:

```bash
cp .env.example .env.local
```

Update the variables in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with accessibility
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # Reusable React components
├── lib/
│   ├── api.ts             # API client
│   └── utils.ts           # Utility functions
├── public/                # Static assets
├── styles/                # Additional styles
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── next.config.mjs        # Next.js configuration
```

## Features

- ✅ App Router architecture
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Accessible layout with skip links
- ✅ Dark mode support
- ✅ Responsive design
- ✅ API client with error handling

## Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
