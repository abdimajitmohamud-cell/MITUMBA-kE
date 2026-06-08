<?php

$conn = mysqli_connect(
"localhost",
"root",
"",
"studentdb"
);

$sql = "SELECT * FROM users";

$result = mysqli_query($conn, $sql);

echo "<h2>Users List</h2>";

while($row = mysqli_fetch_assoc($result)){

echo "ID: " . $row['id'];
echo "<br>";

echo "Username: " . $row['username'];
echo "<br>";

echo "Password: " . $row['password'];
echo "<br><br>";

}

?>