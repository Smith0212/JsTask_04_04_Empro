<?php
// Database Connection
$conn = new mysqli("127.0.0.1", "root", "Smit@0212", "task2_FS_10_03_prep_it");

// Check Connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch Content from tbl_cmd where title = 'help and faq'
$sql = "SELECT content FROM tbl_cmd WHERE title = 'help and faq'";
$result = $conn->query($sql);

// Fetch Data
$content = "";
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $content = nl2br($row["content"]); // Convert new lines to <br>
} else {
    $content = "Content not found.";
}

// Close Connection
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Help & FAQ</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 80%;
            margin: 50px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            text-align: center;
            color: #333;
        }
        .content {
            margin-top: 20px;
            color: #555;
            line-height: 1.6;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Help & FAQ</h1>
    <div class="content">
        <?php echo $content; ?>
    </div>
</div>

</body>
</html>
