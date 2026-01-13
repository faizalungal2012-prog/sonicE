<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

/* Database connection */
$host = "127.0.0.1";
$user = "root";
$pass = "";
$db   = "user_system";

$conn = mysqli_connect($host, $user, $pass, $db);
if (!$conn) {
    die("Database connection failed: " . mysqli_connect_error());
}

/* Handle login */
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if ($username === '' || $password === '') {
        die("All fields are required");
    }

    $sql = "SELECT id, username, password FROM users WHERE username = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $username);
    mysqli_stmt_execute($stmt);

    $result = mysqli_stmt_get_result($stmt);

    if ($row = mysqli_fetch_assoc($result)) {

        if (password_verify($password, $row['password'])) {

            $_SESSION['user_id'] = $row['id'];
            $_SESSION['username'] = $row['username'];

            echo "✅ Login successful! Welcome " . $_SESSION['username'];
            // header("Location: dashboard.php"); exit;

        } else {
            echo "❌ Incorrect password";
        }

    } else {
        echo "❌ User not found";
    }

    mysqli_stmt_close($stmt);
}

mysqli_close($conn);
?>
