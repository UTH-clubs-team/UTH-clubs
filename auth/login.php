<?php
session_start();
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];

    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_role'] = $user['role'];
        
        echo json_encode(['success' => true, 'user' => [
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }
}
?>