# Sakthi Dental Clinic Website

## Project Overview
Sakthi Dental Clinic is a web application designed to help patients request dental appointments and allow clinic administrators to manage bookings.

## Features
- Patient appointment booking
- Admin login and authentication
- Appointment dashboard and statistics
- Search and filter appointments
- Update appointment status
- MongoDB Atlas database integration
- Responsive user interface

## Technologies Used
- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

## Project Structure
- `admin/` — Admin login and dashboard
- `server/` — Backend API, routes, models, and configuration
- `index.html` — Public website
- `style.css` — Website styling
- `script.js` — Frontend interactions

## Setup Instructions
1. Install Node.js.
2. Open a terminal in the `server` directory.
3. Run `npm install`.
4. Configure the required environment variables in `server/.env`.
5. Start the backend using `npm run dev`.
6. Open the public website using VS Code Live Server.

## Security
- Store credentials in environment variables.
- Do not commit `.env` files or database passwords to GitHub.
- Use authenticated routes for admin-only operations.

## Future Improvements
- Automated email notifications
- Online appointment reminders
- Patient appointment status tracking
