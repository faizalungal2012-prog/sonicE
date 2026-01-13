<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 1️⃣ Database connection
$host = "127.0.0.1";
$user = "root";
$pass = "";
$db   = "user_system";

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    die("Database connection failed: " . mysqli_connect_error());
}

// 2️⃣ Check form submit
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $username = trim($_POST['username'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if ($username === '' || $email === '' || $password === '') {
        die("All fields are required");
    }

    // 3️⃣ Hash password (VERY IMPORTANT 🔐)
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // 4️⃣ Insert into database
    $sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);

    if (!$stmt) {
        die("Prepare failed: " . mysqli_error($conn));
    }

    mysqli_stmt_bind_param($stmt, "sss", $username, $email, $hashedPassword);

    if (mysqli_stmt_execute($stmt)) {
        echo "✅ Registration successful! Data saved in phpMyAdmin.";
    } else {
        echo "❌ Insert failed: " . mysqli_stmt_error($stmt);
    }

    mysqli_stmt_close($stmt);
}

mysqli_close($conn);
?>
