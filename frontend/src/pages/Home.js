import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import '../App.css'; // Import App.css for general styles

const Home = () => {
    // Removed useEffect for automatic role-based redirection

    return (
        <div className="home-container">
            <h1 className="hero-title">Rate Your Favorite Stores, Discover New Gems!</h1>
            <p className="hero-subtitle">
                Join our community to share your shopping experiences and find the best local stores. Whether you're a customer looking for quality or an owner tracking feedback, we've got you covered.
            </p>
            <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary btn-large">Get Started - Register</Link>
                <Link to="/login" className="btn btn-secondary btn-large">Log In</Link>
            </div>

            <div className="features-section container">
                <h2>Key Features</h2>
                <div className="feature-cards-container">
                    <div className="feature-card">
                        <i className="fas fa-star feature-icon"></i>
                        <h3>Submit Ratings</h3>
                        <p>Share your experience by rating stores from 1 to 5 stars. Your feedback helps others make informed decisions.</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-search feature-icon"></i>
                        <h3>Discover Stores</h3>
                        <p>Easily browse and search through a diverse list of registered stores. Find exactly what you need!</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-tachometer-alt feature-icon"></i>
                        <h3>Admin & Owner Dashboards</h3>
                        <p>Dedicated intuitive dashboards for System Administrators and Store Owners to manage and monitor their respective data efficiently.</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-shield-alt feature-icon"></i>
                        <h3>Secure Authentication</h3>
                        <p>A robust single login system ensures secure access for all user roles, protecting your data.</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-sort-alpha feature-icon"></i>
                        <h3>Sortable Listings</h3>
                        <p>All data tables across the platform support sorting by key fields for easy navigation and analysis.</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-mobile-alt feature-icon"></i>
                        <h3>Responsive Design</h3>
                        <p>Access the platform seamlessly from any device, whether desktop, tablet, or mobile phone.</p>
                    </div>
                </div>
            </div>

            <div className="how-it-works-section container">
                <h2>How It Works</h2>
                <div className="steps-container">
                    <div className="step-card">
                        <div className="step-icon"><i className="fas fa-user-plus"></i></div>
                        <h3>1. Register</h3>
                        <p>Create your free account in just a few clicks. It's quick and easy!</p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon"><i className="fas fa-store"></i></div>
                        <h3>2. Find Stores</h3>
                        <p>Search for your favorite stores or discover new ones in your area.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon"><i className="fas fa-comment-alt"></i></div>
                        <h3>3. Submit Your Rating</h3>
                        <p>Share your honest feedback with a simple 1-5 star rating.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon"><i className="fas fa-chart-bar"></i></div>
                        <h3>4. See the Impact</h3>
                        <p>Your ratings help others and provide valuable insights to store owners.</p>
                    </div>
                </div>
            </div>

            <div className="about-section container">
                <h2>About Us</h2>
                <p>Our platform aims to connect customers with the best stores by providing a transparent and easy-to-use rating system. We believe in empowering both shoppers and business owners with valuable feedback.</p>
                <p>We are committed to building a reliable community where every voice is heard, helping local businesses thrive through constructive engagement.</p>
            </div>
        </div>
    );
};

export default Home;
