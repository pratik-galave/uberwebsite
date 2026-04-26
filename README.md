# Velocity (formerly Uber Clone)

Velocity is a high-performance, modern ride-hailing platform engineered for speed, reliability, and total control. It provides a seamless experience for both passengers (users) and drivers (captains).

## Project Structure
The project is divided into two main components:
- **Frontend (`/frontend`)**: A modern React application built with Vite, styled with Tailwind CSS, providing a responsive and dynamic user interface. It includes separate flows for users and captains.
- **Backend (`/backend`)**: A robust Node.js and Express backend that handles user authentication, ride matching, location tracking, and real-time communication.

## Core Features
- **Dual Interfaces**: Dedicated portals for Users (passengers) and Captains (drivers).
- **Real-time Tracking**: Live location updates and route tracking using OpenStreetMap (OSRM/Nominatim) and Leaflet (recently migrated from Google Maps).
- **Secure Authentication**: JWT-based authentication for both users and captains.
- **Real-time Communication**: WebSocket integration for instant ride requests, OTP verification, and status updates.
- **Modern UI/UX**: A sleek, "Neo-Premium" design aesthetic featuring a solid, high-contrast UI (Velocity Light migration).

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS v4, React Router, GSAP for animations, Leaflet for maps.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT, bcrypt.
- **Maps & Routing**: OpenStreetMap (OSRM for routing, Nominatim for geocoding).

## Getting Started
To run the application locally:
1. Navigate to the `/backend` directory and run `npm install` followed by `npm run dev`.
2. Navigate to the `/frontend` directory and run `npm install` followed by `npm run dev`.
