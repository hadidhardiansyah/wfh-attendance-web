# WFH Attendance System - Frontend

This is the Frontend repository for the WFH Attendance System. It is built using **React**, **TypeScript**, **Vite**, and styled with **Tailwind CSS**.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed **Node.js** (version 18 or higher is recommended).
- You have a package manager like
  pm (comes with Node.js) or yarn.

## Getting Started (Local Development)

Follow these steps to run the project on your local machine:

1. **Clone the repository**
   `ash
git clone <repository-url>
cd wfh-attendance-web
`

2. **Install Dependencies**
   Install all the required packages using npm:
   `ash
npm install
`

3. **Run the Development Server**
   Start the Vite development server:
   `ash
npm run dev
`
   By default, the application will be accessible at http://localhost:5173.

   _Note: During local development, API requests starting with /api and WebSocket connections are automatically proxied to the local backend (usually http://localhost:3001) via Vite's proxy configuration in ite.config.ts to avoid CORS issues._

## Building for Production

To create a production-ready build:

`ash
npm run build
`
This will compile and bundle the React application into the dist/ directory, which can then be served by a web server like Nginx.

## Enterprise Deployment (Docker & OCP)

This project is fully ready for containerized deployment (e.g., Kubernetes, OpenShift Container Platform) using the provided Dockerfile. It uses a **multi-stage build** with **Nginx Alpine** to serve the static files.

### Dynamic Runtime Configuration (env-config.js)

Unlike standard Vite builds that hardcode environment variables, this project uses a dynamic runtime configuration strategy to support "Build Once, Deploy Anywhere".

When running in a container, you do not need to rebuild the image to change the backend URLs. Simply inject the following environment variables into your OCP Pod / Docker Container:

- API_BASE_URL: The full URL for REST API requests (e.g., https://api.company.com/api)
- WS_BASE_URL: The full URL for WebSocket connections (e.g., wss://socket.company.com/notifications)

The provided entrypoint.sh will automatically intercept these environment variables upon container startup and inject them into env-config.js for the frontend to consume.
