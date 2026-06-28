<?php
// api/register.php
// User registration endpoint

require_once '../config/database.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Get and sanitize input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

// Validate required fields
$required = ['name', 'email', 'password'];
if (!validateRequired($input, $required)) {
    sendJsonResponse(['error' => 'All fields are required'], 400);
}

$name = sanitizeInput($input['name']);
$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$password = $input['password'];

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJsonResponse(['error' => 'Invalid email address'], 400);
}

// Validate password length
if (strlen($password) < 6) {
    sendJsonResponse(['error' => 'Password must be at least 6 characters'], 400);
}

try {
    $db = new Database();
    
    // Check if email already exists
    $checkStmt = $db->executeQuery("SELECT id FROM users WHERE email = ?", [$email]);
    if ($checkStmt->rowCount() > 0) {
        sendJsonResponse(['error' => 'Email already registered'], 409);
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $insertStmt = $db->executeQuery(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [$name, $email, $hashedPassword]
    );
    
    if ($insertStmt->rowCount() > 0) {
        $userId = $db->lastInsertId();
        
        // Start session
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_role'] = 'user';
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Registration successful',
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                'role' => 'user'
            ]
        ]);
    } else {
        sendJsonResponse(['error' => 'Registration failed. Please try again.'], 500);
    }
} catch (PDOException $e) {
    error_log("Registration error: " . $e->getMessage());
    sendJsonResponse(['error' => 'Database error occurred. Please try again.'], 500);
}
?>