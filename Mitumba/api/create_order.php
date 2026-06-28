<?php
// api/create_order.php
// Create order from cart

require_once '../config/database.php';

requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$phoneNumber = isset($input['phone_number']) ? sanitizeInput($input['phone_number']) : null;
$userId = $_SESSION['user_id'];

try {
    $db = new Database();
    $db->getConnection()->beginTransaction();
    
    // Get cart items
    $cartStmt = $db->executeQuery(
        "SELECT c.product_id, c.quantity, p.price, p.stock 
         FROM cart c 
         JOIN products p ON c.product_id = p.id 
         WHERE c.user_id = ?",
        [$userId]
    );
    
    $cartItems = $cartStmt->fetchAll();
    
    if (empty($cartItems)) {
        $db->getConnection()->rollBack();
        sendJsonResponse(['error' => 'Cart is empty'], 400);
    }
    
    // Calculate total and check stock
    $total = 0;
    foreach ($cartItems as $item) {
        if ($item['stock'] < $item['quantity']) {
            $db->getConnection()->rollBack();
            sendJsonResponse(['error' => "Insufficient stock for product ID: {$item['product_id']}"], 400);
        }
        $total += $item['price'] * $item['quantity'];
    }
    
    // Generate order number
    $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
    
    // Create order
    $orderStmt = $db->executeQuery(
        "INSERT INTO orders (user_id, order_number, total_amount, payment_method, phone_number) 
         VALUES (?, ?, ?, 'M-Pesa', ?)",
        [$userId, $orderNumber, $total, $phoneNumber]
    );
    
    $orderId = $db->lastInsertId();
    
    // Add order items and update stock
    foreach ($cartItems as $item) {
        // Add order item
        $db->executeQuery(
            "INSERT INTO order_items (order_id, product_id, quantity, price) 
             VALUES (?, ?, ?, ?)",
            [$orderId, $item['product_id'], $item['quantity'], $item['price']]
        );
        
        // Update stock
        $db->executeQuery(
            "UPDATE products SET stock = stock - ? WHERE id = ?",
            [$item['quantity'], $item['product_id']]
        );
    }
    
    // Clear cart
    $db->executeQuery("DELETE FROM cart WHERE user_id = ?", [$userId]);
    
    $db->getConnection()->commit();
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Order created successfully',
        'order' => [
            'order_number' => $orderNumber,
            'total_amount' => $total,
            'status' => 'pending'
        ]
    ]);
} catch (PDOException $e) {
    $db->getConnection()->rollBack();
    error_log("Create order error: " . $e->getMessage());
    sendJsonResponse(['error' => 'Failed to create order. Please try again.'], 500);
}
?>