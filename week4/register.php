<!DOCTYPE html>
<html>
<head>
    <title>Registration Form</title>
</head>
<body>

<h2>Registration Form</h2>

<form method="POST">

<input
type="text"
name="username"
placeholder="Enter Username"
required>

<br><br>

<input
type="email"
name="email"
placeholder="Enter Email"
required>

<br><br>

<button type="submit">
Register
</button>

</form>

<?php

if(isset($_POST['username'])){

$username = $_POST['username'];
$email = $_POST['email'];

echo "<h3>Registration Successful</h3>";
echo "Username: " . $username;
echo "<br>Email: " . $email;
}

?>

</body>
</html>