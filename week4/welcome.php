<?php
session_start();

$_SESSION["user"] = "abdi";

echo "Welcome " .
$_SESSION["user"];
?>