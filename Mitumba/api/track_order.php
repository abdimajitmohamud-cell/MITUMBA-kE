<?php
// api/track_order.php
// Track order status

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

$orderNumber = isset($_GET['order_number']) ? sanitizeInput($_GET['order_number']) : null;

if (!$orderNumber) {
    sendJsonResponse(['error' => 'Order number is required'], 400);
}

try {
    $db = new Database();
    
    $sql = "SELECT o.*, u.name as customer_name, u.email 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE o.order_number = ?";
    
    $params = [$orderNumber];
    
    // If user is logged in, only show their orders
    if (isLoggedIn()) {
        $sql .= " AND o.user_id = ?";
        $params[] = $_SESSION['user_id'];
    }
    
    $stmt = $db->executeQuery($sql, $params);
    
    if ($stmt->rowCount() === 0) {
        sendJsonResponse(['error' => 'Order not found'], 404);
    }
    
    $order = $stmt->fetch();
    
    // Get order items
    $itemsStmt = $db->executeQuery(
        "SELECT oi.*, p.name, p.image 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?",
        [$order['id']]
    );
    $order['items'] = $itemsStmt->fetchAll();
    
    sendJsonResponse([
        'success' => true,
        'order' => $order
    ]);
} catch (PDOException $e) {
    error_log("Track order error: " . $e->getMessage());
    sendJsonResponse(['error' => 'Failed to track order'], 500);
}
?>