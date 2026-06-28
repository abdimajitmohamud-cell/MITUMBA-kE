<?php
// api/login.php
// User login endpoint

require_once '../config/database.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Get input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

// Validate required fields
$required = ['email', 'password'];
if (!validateRequired($input, $required)) {
    sendJsonResponse(['error' => 'Email and password are required'], 400);
}

$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$password = $input['password'];

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJsonResponse(['error' => 'Invalid email address'], 400);
}

try {
    $db = new Database();
    
    // Get user by email
    $stmt = $db->executeQuery(
        "SELECT id, name, email, password, role FROM users WHERE email = ?",
        [$email]
    );
    
    if ($stmt->rowCount() === 0) {
        sendJsonResponse(['error' => 'Invalid email or password'], 401);
    }
    
    $user = $stmt->fetch();
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        sendJsonResponse(['error' => 'Invalid email or password'], 401);
    }
    
    // Start session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    sendJsonResponse(['error' => 'Database error occurred. Please try again.'], 500);
}
?>