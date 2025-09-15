# Store Rater

## Project Overview

Store Rater is a full-stack web application designed to allow users to rate various stores, discover new ones, and provide a platform for store owners to manage feedback and for administrators to oversee the entire system. It features a single login system with role-based access, ensuring a tailored experience for each user type.

## Tech Stack

*   **Backend**: Express.js
*   **Database**: PostgreSQL
*   **Frontend**: React.js

## Requirements & Functionalities

The application implements a comprehensive rating system (1 to 5 stars) for registered stores and provides distinct functionalities based on user roles: System Administrator, Normal User, and Store Owner.

### Core Features

*   **Single Login System**: Secure authentication for all user roles.
*   **Role-Based Access**: Different functionalities unlocked based on user roles.
*   **Store Rating**: Users can submit and modify ratings for stores.
*   **Responsive Design**: The application is accessible and functional across various devices (desktop, tablet, mobile).
*   **Data Sorting**: All key listings and tables support ascending/descending sorting.

### User Roles & Functionalities

#### 1. System Administrator

*   **User Management**: Can add new stores, normal users, and other admin users.
*   **Dashboard**: Access to a dashboard displaying key metrics:
    *   Total number of users
    *   Total number of stores
    *   Total number of submitted ratings
*   **User Creation**: Can add new users with:
    *   Name
    *   Email
    *   Password
    *   Address
*   **Store Listing**: View a list of stores with details:
    *   Name, Email, Address, Overall Rating
*   **User Listing**: View a list of normal and admin users with:
    *   Name, Email, Address, Role
*   **Filtering**: Apply filters on all listings (stores and users) based on Name, Email, Address, and Role.
*   **User Details**: View comprehensive details of all users, including Name, Email, Address, and Role.
    *   If the user is a Store Owner, their average store rating is also displayed.
*   **Logout**: Securely log out from the system.

#### 2. Normal User

*   **Authentication**: Can sign up and log in to the platform.
*   **Signup Form Fields**:
    *   Name
    *   Email
    *   Address
    *   Password
*   **Password Management**: Can update their password after logging in.
*   **Store Discovery**: View a list of all registered stores.
*   **Search**: Search for stores by Name and Address.
*   **Store Listing Details**: Each store listing displays:
    *   Store Name
    *   Address
    *   Overall Rating
    *   User's Previously Submitted Rating (if any)
    *   Option to submit a rating
    *   Option to modify their submitted rating
*   **Rating Submission**: Submit ratings (1 to 5 stars) for individual stores.
*   **Logout**: Securely log out from the system.

#### 3. Store Owner

*   **Authentication**: Can log in to the platform.
*   **Password Management**: Can update their password after logging in.
*   **Dashboard**: Access to a dedicated dashboard displaying:
    *   A list of users who have submitted ratings for their specific store(s).
    *   The average rating of their store(s).
*   **Logout**: Securely log out from the system.

### Form Validations

To ensure data integrity and security, the following validation rules are applied to form fields:

*   **Name**: Minimum 20 characters, Maximum 60 characters.
*   **Address**: Maximum 400 characters.
*   **Password**: 8-16 characters, must include at least one uppercase letter and one special character.
*   **Email**: Must follow standard email validation rules.

## Installation and Setup

To get this project up and running on your local machine, follow these steps:

### Prerequisites

*   Node.js (LTS version recommended)
*   npm or Yarn
*   PostgreSQL or MySQL installed and running

### 1. Clone the Repository

```bash
git clone https://github.com/Ayushsurvanshi/strore-rater.git
cd strore-rater
```

### 2. Backend Setup

```bash
cd backend
npm install # or yarn install
```

**Database Configuration:**

*   Create a database (e.g., `store_rater_db`).
*   Update the database connection details in `backend/database/init.js` (or a similar configuration file) to match your database credentials.
*   Run database migrations/seeding (if applicable, based on `init.js` or `schema.sql`).

**Run the Backend:**

```bash
npm start # or node index.js
```
The backend server will typically run on `http://localhost:5000` (or another port if configured).

### 3. Frontend Setup

```bash
cd ../frontend
npm install # or yarn install
```

**Environment Variables:**

*   Create a `.env` file in the `frontend` directory.
*   Add the backend API URL (e.g., `REACT_APP_API_URL=http://localhost:5000/api`).

**Run the Frontend:**

```bash
npm start # or yarn start
```
The frontend application will typically open in your browser at `http://localhost:3000`.

## Usage

1.  **Register**: If you are a new user, navigate to the `/register` page to create a Normal User account.
2.  **Login**: Use your credentials to log in.
3.  **Explore**: Based on your role, you will have access to different dashboards and functionalities.
    *   **Normal User**: Browse stores, submit/modify ratings.
    *   **System Administrator**: Manage users and stores through the admin dashboard.
    *   **Store Owner**: View ratings and user feedback for their stores on their dashboard.

## Contributing

We welcome contributions! Please feel free to fork the repository, make your changes, and submit a pull request.

## License

[Specify your license here, e.g., MIT License]

### MySQL Database Schema

```sql
--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(60) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `address` VARCHAR(400) NOT NULL,
  `role` ENUM('System Administrator', 'Normal User', 'Store Owner') NOT NULL DEFAULT 'Normal User',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `address` VARCHAR(400) NOT NULL,
  `owner_id` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `store_id` INT NOT NULL,
  `rating` INT CHECK (rating >= 1 AND rating <= 5),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (`user_id`, `store_id`), -- A user can only rate a store once
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE
);
```


