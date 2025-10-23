<?php
/**
 * Test Contact Form Submission
 * This simulates a contact form submission to test the API
 */

require_once __DIR__ . '/php-backend/config/database.php';

echo "🧪 Testing Contact Form Submission\n\n";

try {
    $db = Database::getInstance()->getConnection();

    // Test 1: Check if table exists
    echo "1️⃣ Checking if contacts table exists...\n";
    $stmt = $db->query("SHOW TABLES LIKE 'contacts'");
    $tableExists = $stmt->fetch();

    if ($tableExists) {
        echo "   ✅ Contacts table exists\n\n";
    } else {
        echo "   ❌ Contacts table does NOT exist\n";
        echo "   Run: php create_contacts_table.php\n";
        exit(1);
    }

    // Test 2: Insert a test contact
    echo "2️⃣ Inserting test contact...\n";
    $stmt = $db->prepare("
        INSERT INTO contacts (full_name, email, phone, subject, message, status, is_read)
        VALUES (?, ?, ?, ?, ?, 'new', 0)
    ");

    $testData = [
        'full_name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '1234567890',
        'subject' => 'Test Subject',
        'message' => 'This is a test message from the contact form.'
    ];

    $success = $stmt->execute([
        $testData['full_name'],
        $testData['email'],
        $testData['phone'],
        $testData['subject'],
        $testData['message']
    ]);

    if ($success) {
        $contactId = $db->lastInsertId();
        echo "   ✅ Test contact inserted with ID: $contactId\n\n";
    } else {
        echo "   ❌ Failed to insert test contact\n";
        print_r($stmt->errorInfo());
        exit(1);
    }

    // Test 3: Retrieve all contacts
    echo "3️⃣ Retrieving all contacts...\n";
    $stmt = $db->prepare("
        SELECT
            id, full_name as fullName, email, phone, subject, message,
            status, is_read as isRead, admin_notes as adminNotes,
            created_at as createdAt, updated_at as updatedAt
        FROM contacts
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "   📊 Total contacts in database: " . count($contacts) . "\n\n";

    if (count($contacts) > 0) {
        echo "   📋 Contact details:\n";
        foreach ($contacts as $contact) {
            echo "   -----------------------------------\n";
            echo "   ID: {$contact['id']}\n";
            echo "   Name: {$contact['fullName']}\n";
            echo "   Email: {$contact['email']}\n";
            echo "   Phone: {$contact['phone']}\n";
            echo "   Subject: {$contact['subject']}\n";
            echo "   Message: " . substr($contact['message'], 0, 50) . "...\n";
            echo "   Status: {$contact['status']}\n";
            echo "   Is Read: {$contact['isRead']}\n";
            echo "   Created: {$contact['createdAt']}\n";
            echo "   -----------------------------------\n";
        }
    }

    // Test 4: Check API endpoint (simulated)
    echo "\n4️⃣ Simulating API GET /api/contacts...\n";
    echo "   This is what the admin panel should receive:\n\n";

    $response = [
        'success' => true,
        'message' => 'Contacts retrieved successfully',
        'contacts' => $contacts,
        'count' => count($contacts),
        'timestamp' => date('c')
    ];

    echo json_encode($response, JSON_PRETTY_PRINT);

    echo "\n\n✅ All tests completed!\n";
    echo "\n📝 Next steps:\n";
    echo "1. Go to: http://localhost:5173/contact\n";
    echo "2. Submit the form\n";
    echo "3. Go to: http://localhost:5173/admin/contacts\n";
    echo "4. You should see the submission\n";

} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
