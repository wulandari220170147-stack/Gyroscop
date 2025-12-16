<?php
$password = "admin"; // password asli
$bcrypt = password_hash($password, PASSWORD_BCRYPT);

echo $bcrypt;
?>
