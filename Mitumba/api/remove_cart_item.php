<?php
// api/remove_cart_item.php
// Remove item from cart

require_once '../config/database.php';

requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

if (!isset($input['cart_item_id'])) {
    sendJsonResponse(['error' => 'Cart item ID is required'], 400);
}

$cartItemId = (int)$input['cart_item_id'];
$userId = $_SESSION['user_id'];

try {
    $db = new Database();
    
    // Verify cart item belongs to user
    $checkStmt = $db->executeQuery(
        "SELECT id FROM cart WHERE id = ? AND user_id = ?",
        [$cartItemId, $userId]
    );
    
    if ($checkStmt->rowCount() === 0) {
        sendJsonResponse(['error' => 'Cart item not found'], 404);
    }
    
    // Remove item
    $deleteStmt = $db->executeQuery(
        "DELETE FROM cart WHERE id = ? AND user_id = ?",
        [$cartItemId, $userId]
    );
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Item removed from cart'
    ]);
} catch (PDOException $e) {
    error_log("Remove cart item error: " . $e->getMessage());
    sendJsonResponse(['error' => 'Failed to remove item'], 500);
}
?>