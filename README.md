# RescueGR Project
This project is a web platform designed to help coordinate volunteers during natural disasters. The platform allows citizens to request or offer essential supplies, while volunteer rescuers can view and manage requests and offers on a map. The administrator can manage the warehouse stock and coordinate deliveries through a map interface. This project was created as part of an academic exercise for the 2023-2024 academic year and it is written in greek.

## Table of Contents
- [Project Description](#project-description)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributors](#contributors)

## Project Description

This platform helps coordinate relief efforts in areas affected by natural disasters. The system allows citizens to report their needs or offer supplies, and volunteer rescuers can deliver these supplies to the required locations. The system is divided into three types of users: administrators, rescuers, and citizens. The main functionalities include:
- **Administrator**: Manage warehouse inventory, view requests and offers on a map  and create announcements for items in shortage.
- **Rescuers**: View and manage their tasks and routes on the map. They can choose tasks like delivering requested items or picking up surplus items
- **Citizens**: Submit requests for essential items or offer surplus items for pickup.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with the Express framework
- **Database**: MySQL for data management
- **Maps**: Leaflet.js for displaying locations on a map
- **Graphs**: Chart.js for visualizing data through graphs


## Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:tsamo13/RescueGR-Project.git
2. Navigate to the Server_files directory:
   ```bash
   cd .../RescueGR-Project/Server_files
3. Install the required dependencies:
   ```bash
   npm install
4. Set up the MySQL database:

- Create a MySQL database named with whatever you like (we have named it web_project).
- Use the provided SQL script (if available) to set up the necessary tables.
- Configure the database credentials in the .env file.
5. Run the server:
   ```bash
   node server.js
**Make sure you are in the Server_files directory when running this command.**

# Usage
1. After starting the server, navigate to http://localhost:3000 to access the login page.
2. Depending on the user role (administrator, rescuer, or citizen), log in to access different parts of the platform.

# Features
## Administrator:

- Manage warehouse inventory, including adding or removing items.
- View tasks and rescuers on a map.
- View supply requests and offers from citizens.
- Create announcements for required supplies.
## Rescuer:

- View and manage assigned tasks.
- Pick up and deliver supplies.
- View the map with tasks and locations.
- Choose tasks to complete (requests or offers) based on their availability.
## Citizen:

- Create requests for essential supplies.
- Offer surplus supplies to be picked up by rescuers.
- View task statuses and updates.

# Contributors
This project was developed by Angelos Tsamopoulos, Christos Karamanos and Nikos Belibasakis as part of the course "Programming & Systems on the World Wide Web" during the 2023-2024 academic year at the Department of Computer Engineering & Informatics (CEID).