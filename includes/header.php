<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UTH Clubs - Student Clubs & Events Management</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="logo">🎓 UTH Clubs</div>
            <ul class="nav-links" id="navLinks">
                <li><a href="#" onclick="showSection('home')" class="active">Home</a></li>
                <li><a href="#" onclick="showSection('clubs')">Clubs</a></li>
                <li><a href="#" onclick="showSection('events')">Events</a></li>
            </ul>
            <div class="auth-section" id="authSection">
                <div class="auth-buttons">
                    <a href="#" class="btn btn-secondary" onclick="showLoginModal()">Login</a>
                    <a href="#" class="btn btn-primary" onclick="showRegisterModal()">Register</a>
                </div>
            </div>
        </div>
    </nav>