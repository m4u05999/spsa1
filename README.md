# Saudi Association for Political Science

This project is a comprehensive web application for the Saudi Association for Political Science, built with React and modern web technologies.

## Features

- Modern, responsive UI design
- Dynamic content management system
- User authentication and authorization
- Multilingual support (Arabic/English)
- Administrative dashboard
- News and events management
- Publications and research repository
- Member management system

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Headless UI
- Heroicons
- Redux Toolkit (State Management)

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v16 or higher)
- pnpm (v7 or higher)

## Installation

### Standard Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd saudi-political-science
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm run dev
```

4. Build for production:
```bash
pnpm run build
```

### Docker Setup

1. Using Docker Compose (recommended):
```bash
docker-compose up --build
```

2. Or using Docker directly:
```bash
# Build the image
docker build -t saudi-political-science .

# Run the container
docker run -p 5173:5173 saudi-political-science
```

The application will be available at http://localhost:5173


## Project Structure
