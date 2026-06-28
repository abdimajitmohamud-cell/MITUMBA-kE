<?php
// api/profile.php
// Get user profile

require_once '../config/database.php';

requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

$userId = $_SESSION['user_id'];

try {
    $db = new Database();
    
    // Get user details
    $userStmt = $db->executeQuery(
        "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
        [$userId]
    );
    
    $user = $userStmt->fetch();
    if (!$user) {
        sendJsonResponse(['error' => 'User not found'], 404);
    }
    
    // Get order statistics
    $orderStats = $db->fetchOne(
        "SELECT COUNT(*) as total_orders, SUM(total_amount) as total_spent 
         FROM orders WHERE user_id = ?",
        [$userId]
    );
    
    // Get recent orders
    $ordersStmt = $db->executeQuery(
        "SELECT id, order_number, total_amount, status, created_at 
         FROM orders 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 5",
        [$userId]
    );
    $recentOrders = $ordersStmt->fetchAll();
    
    sendJsonResponse([
        'success' => true,
        'user' => $user,
        'statistics' => [
            'total_orders' => (int)$orderStats['total_orders'],
            'total_spent' => (float)$orderStats['total_spent'] ?? 0
        ],
        'recent_orders' => $recentOrders
    ]);
} catch (PDOException $e) {
    error_log("Profile error: " . $e->getMessage());
    sendJsonResponse(['error' => 'Failed to load profile'], 500);
}
?>