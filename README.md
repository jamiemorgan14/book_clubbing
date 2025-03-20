# Book Club Management Application

A modern full-stack application for managing book clubs, built with Next.js, Node.js/Express, and PostgreSQL.

## Project Structure

```
book_clubbing/
├── frontend/          # Next.js frontend application
├── backend/          # Node.js/Express backend application
└── README.md         # This file
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

## Getting Started

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd book_clubbing
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Create and configure your environment variables
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

4. Start the development servers:

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

   The frontend will be available at http://localhost:3000 and the backend at http://localhost:3001.

## Development

- Frontend: Next.js with TypeScript and Tailwind CSS
- Backend: Node.js/Express with TypeScript
- Database: PostgreSQL

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 