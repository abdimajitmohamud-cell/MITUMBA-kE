<?php
// api/get_products.php
// Get all products endpoint

require_once '../config/database.php';

// Allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    $db = new Database();
    
    // Optional category filter
    $category = isset($_GET['category']) ? sanitizeInput($_GET['category']) : null;
    
    $sql = "SELECT * FROM products";
    $params = [];
    
    if ($category) {
        $sql .= " WHERE category = ?";
        $params[] = $category;
    }
    
    $sql .= " ORDER BY created_at DESC";
    
    $stmt = $db->executeQuery($sql, $params);
    $products = $stmt->fetchAll();
    
    sendJsonResponse([
        'success' => true,
        'products' => $products,
        'count' => count($products)
    ]);
} catch (PDOException $e) {
    error_log("Get products error: " . $e->getMessage());
    sendJsonResponse(['error' => 'Failed to fetch products'], 500);
}
?>