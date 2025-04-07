<?php
$conn = new mysqli("localhost", "root", "Smit@0212", "task2_FS_10_03_prep_it", 3307);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$title = "About Us";
$query = "SELECT content FROM tbl_cms WHERE title = '$title'";
$result = $conn->query($query);

$content = "<p>No content available.</p>";
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $content = nl2br($row['content']);
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            max-width: 800px;
            margin: 50px auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .content {
            font-size: 16px;
            color: #555;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>About Us</h1>
        <div class="content"><?php echo $content; ?></div>
    </div>
</body>
</html>
