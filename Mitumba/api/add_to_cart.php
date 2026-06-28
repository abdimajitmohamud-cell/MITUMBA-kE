<?php
// api/add_to_cart.php
// Add item to cart

require_once '../config/database.php';

requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$required = ['product_id', 'quantity'];
if (!validateRequired($input, $required)) {
    sendJsonResponse(['error' => 'Product ID and quantity are required'], 400);
}

$productId = (int)$input['product_id'];
$quantity = max(1, (int)$input['quantity']);
$userId = $_SESSION['user_id'];

try {
    $db = new Database();
    
    // Check if product exists and has stock
    $productStmt = $db->executeQuery(
        "SELECT id, stock FROM products WHERE id = ?",
        [$productId]
    );
    
    if ($productStmt->rowCount() === 0) {
        sendJsonResponse(['error' => 'Product not found'], 404);
    }
    
    $product = $productStmt->fetch();
    if ($product['stock'] < $quantity) {
        sendJsonResponse(['error' => 'Insufficient stock'], 400);
    }
    
    // Check if item already in cart
    $checkStmt = $db->executeQuery(
        "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?",
        [$userId, $productId]
    );
    
    if ($checkStmt->rowCount() > 0) {
        // Update existing cart item
        $cartItem = $checkStmt->fetch();
        $newQuantity = $cartItem['quantity'] + $quantity;
        
        $updateStmt = $db->executeQuery(
            "UPDATE cart SET quantity = ? WHERE id = ?",
            [$newQuantity, $cartItem['id']]
        );
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Cart updated successfully',
            'quantity' => $newQuantity
        ]);
    } else {
        // Insert new cart item
        $insertStmt = $db->executeQuery(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
            [$userId, $productId, $quantity]
        );
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Item added to cart successfully'
        ]);
    }
} catch (PDOException $e) {
    error_log("Add to cart error: " . $e->getMessage());
    sendJsonResponse(['error' => 'Failed to add item to cart'], 500);
}
?>