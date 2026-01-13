<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "sonicbuds_db";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed");
}

$fullName = $_POST['full_name'];
$cardNumber = $_POST['card_number'];
$expiration = $_POST['expiration'];

// Store ONLY last 4 digits
$last4 = substr(preg_replace('/\D/', '', $cardNumber), -4);

$sql = "INSERT INTO payments (full_name, card_last4, expiry)
        VALUES (?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $fullName, $last4, $expiration);
$stmt->execute();

echo "Payment info saved successfully ✔️";

$stmt->close();
$conn->close();
?>
