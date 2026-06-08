<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
</head>
<body>

<h2>Login Form</h2>

<form method="POST">

<input
type="text"
name="username"
placeholder="Username"
required>

<br><br>

<input
type="password"
name="password"
placeholder="Password"
required>

<br><br>

<button type="submit">
Login
</button>

</form>

<?php

if(isset($_POST['username'])){

$username = $_POST['username'];
$password = $_POST['password'];

if($username == "admin"
&& $password == "1234"){

echo "<h3>Login Successful</h3>";

}else{

echo "<h3>Invalid Credentials</h3>";
}

}

?>

</body>
</html>