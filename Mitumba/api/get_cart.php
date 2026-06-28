<?php
// api/get_cart.php
// Get user's cart items

require_once '../config/database.php';

requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    $userId = $_SESSION['user_id'];
    $db = new Database();
    
    $sql = "SELECT c.*, p.name, p.price, p.image, p.stock 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ? 
            ORDER BY c.created_at DESC";
    
    $stmt = $db->executeQuery($sql, [$userId]);
    $cartItems = $stmt->fetchAll();
    
    $total = 0;
    foreach ($cartItems as &$item) {
        $item['subtotal'] = $item['price'] * $item['quantity'];
        $total += $item['subtotal'];
    }
    
    sendJsonResponse([
        'success' => true,
        'items' => $cartItems,
        'total' => $total,
        'count' => count($cartItems)
    ]);
} catch (PDOException $e) {
    error_log("Get cart error: " . $e->getMessage());
    sendJsonResponse(['error' => 'Failed to fetch cart'], 500);
}
?>