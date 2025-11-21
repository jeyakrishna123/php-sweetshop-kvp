# How to Find Error Logs in Production

## 📍 Log File Locations

### Primary Error Log
**Path:** `hostinger_upload/backend/logs/php-error.log`

**Full Server Path:** 
```
/home/u707629033/domains/skbakers.com/public_html/backend/logs/php-error.log
```
OR
```
/var/www/html/backend/logs/php-error.log
```
(Exact path depends on your Hostinger server configuration)

### Activity Log
**Path:** `hostinger_upload/backend/logs/activity.log`

---

## 🔍 How to Access Logs

### Method 1: Via Hostinger File Manager (cPanel)
1. Log in to your Hostinger control panel
2. Go to **File Manager**
3. Navigate to: `public_html/backend/logs/`
4. Open `php-error.log` file
5. View the latest entries at the bottom of the file

### Method 2: Via FTP
1. Connect to your server via FTP (FileZilla, WinSCP, etc.)
2. Navigate to: `/public_html/backend/logs/`
3. Download `php-error.log` file
4. Open it in a text editor

### Method 3: Via SSH (if available)
```bash
# Connect via SSH
ssh your-username@skbakers.com

# Navigate to logs directory
cd public_html/backend/logs/

# View last 50 lines of error log
tail -n 50 php-error.log

# View last 100 lines with timestamps
tail -n 100 php-error.log | grep "2025"

# Search for specific errors
grep "getAllContacts" php-error.log
grep "getContactStats" php-error.log
grep "❌" php-error.log
```

### Method 4: Via cPanel Terminal
1. Log in to cPanel
2. Go to **Terminal** or **SSH Access**
3. Run the commands above

---

## 📋 What to Look For in Logs

### Error Log Format
Our error logs include:
- **Timestamp:** `[2025-11-20 23:17:24]`
- **Error Type:** `ERROR`, `WARNING`, `EXCEPTION`, etc.
- **Error Message:** The actual error description
- **File & Line:** Exact location where error occurred

### Example Log Entries

#### Contact API Errors
```
[2025-11-20 23:17:24] ❌ getAllContacts: Auth exception: Invalid token
[2025-11-20 23:17:24] ❌ getAllContacts: Database connection is null
[2025-11-20 23:17:24] ❌ getAllContacts: Execute failed: Table 'contacts' doesn't exist | SQL State: 42S02
[2025-11-20 23:17:24] ❌ GetAllContacts General Exception: Call to undefined method in /path/to/file.php:285
```

#### Authentication Errors
```
[2025-11-20 23:17:24] ❌ requireAdmin: Invalid user object
[2025-11-20 23:17:24] ERROR: Authentication required. No token provided
```

#### Database Errors
```
[2025-11-20 23:17:24] ❌ getAllContacts: Failed to prepare statement: {"0":"42000","1":1064,"2":"SQL syntax error"}
[2025-11-20 23:17:24] ❌ getAllContacts PDO Exception: SQLSTATE[42S02]: Base table or view not found
```

---

## 🔎 Searching for Specific Errors

### Find Contact API Errors
```bash
# Search for contact-related errors
grep -i "contact" php-error.log | tail -n 20

# Search for getAllContacts errors
grep "getAllContacts" php-error.log | tail -n 20

# Search for getContactStats errors
grep "getContactStats" php-error.log | tail -n 20
```

### Find Authentication Errors
```bash
# Search for auth errors
grep -i "auth\|authentication\|token" php-error.log | tail -n 20

# Search for requireAdmin errors
grep "requireAdmin" php-error.log | tail -n 20
```

### Find Database Errors
```bash
# Search for database errors
grep -i "database\|pdo\|sql" php-error.log | tail -n 20

# Search for table errors
grep -i "table.*doesn't exist\|table.*not found" php-error.log | tail -n 20
```

### Find Recent Errors (Last Hour)
```bash
# Get current date/time
date

# Search for errors from last hour (adjust timestamp)
grep "2025-11-20 23:" php-error.log
```

---

## 📊 Understanding Error Messages

### Error Indicators in Our Code

#### ❌ Critical Errors
- `❌ getAllContacts: Auth exception:` - Authentication failed
- `❌ getAllContacts: Database connection is null` - Database not connected
- `❌ getAllContacts: Failed to prepare statement:` - SQL query error
- `❌ getAllContacts: Execute failed:` - SQL execution error

#### ⚠️ Warnings
- `⚠️ getAllContacts: Table does not exist, returning empty array` - Table missing (handled gracefully)
- `⚠️ createContact: Empty request body received` - Missing form data

#### ✅ Success Messages (Less Common in Error Log)
- Usually not logged to error log (only errors are logged)

---

## 🛠️ Common Error Patterns

### 1. Authentication Errors
**Look for:**
```
❌ getAllContacts: Auth exception
❌ requireAdmin: Invalid user object
Authentication required. No token provided
Invalid or expired token
```

**Solution:** Check if user is logged in, token is valid, user has admin role

### 2. Database Connection Errors
**Look for:**
```
❌ Database connection is null
❌ Database connection exception
```

**Solution:** Check database credentials in `config/config.php`

### 3. Table Not Found Errors
**Look for:**
```
Table 'contacts' doesn't exist
SQL State: 42S02
```

**Solution:** Table should auto-create, but check if it exists in database

### 4. SQL Syntax Errors
**Look for:**
```
SQL syntax error
Failed to prepare statement
```

**Solution:** Check SQL queries in `contacts.php`

### 5. General Exceptions
**Look for:**
```
GetAllContacts General Exception
Call to undefined method
Undefined property
```

**Solution:** Check the file and line number mentioned in the error

---

## 📝 Log File Management

### View Log File Size
```bash
# Check file size
ls -lh php-error.log

# If file is too large, you may want to rotate it
```

### Clear Log File (Use with Caution)
```bash
# Backup first
cp php-error.log php-error.log.backup

# Clear log (keeps file but empties it)
> php-error.log
```

### Monitor Logs in Real-Time
```bash
# Watch log file for new entries
tail -f php-error.log

# Watch with grep filter
tail -f php-error.log | grep "❌"
```

---

## 🚨 Quick Debugging Steps

1. **Check Recent Errors:**
   ```bash
   tail -n 50 php-error.log
   ```

2. **Search for Contact API Errors:**
   ```bash
   grep "getAllContacts\|getContactStats" php-error.log | tail -n 20
   ```

3. **Check for Authentication Issues:**
   ```bash
   grep -i "auth\|token" php-error.log | tail -n 20
   ```

4. **Check Database Errors:**
   ```bash
   grep -i "database\|pdo\|sql" php-error.log | tail -n 20
   ```

5. **Find Exact Error Location:**
   - Look for file path and line number in error message
   - Example: `in /path/to/contacts.php:285`

---

## 📞 If You Can't Access Logs

If you cannot access the log files directly, you can:

1. **Add Temporary Debug Endpoint:**
   Create a test file that reads and displays the last N lines of the log:
   ```php
   // test-logs.php (DELETE AFTER DEBUGGING!)
   $logFile = __DIR__ . '/logs/php-error.log';
   if (file_exists($logFile)) {
       $lines = file($logFile);
       $lastLines = array_slice($lines, -50);
       echo "<pre>" . htmlspecialchars(implode('', $lastLines)) . "</pre>";
   }
   ```

2. **Check Hostinger Error Logs:**
   - In cPanel, go to **Metrics** → **Errors**
   - This shows server-level errors

3. **Contact Hostinger Support:**
   - They can help you access log files
   - They can check server error logs

---

## ✅ Summary

**Main Log File:** `backend/logs/php-error.log`

**Key Search Terms:**
- `getAllContacts` - Contact list errors
- `getContactStats` - Statistics errors
- `❌` - All critical errors
- `Auth` - Authentication errors
- `Database` - Database errors

**Quick Command:**
```bash
tail -n 100 backend/logs/php-error.log | grep "❌"
```

This will show the last 100 lines containing critical errors (marked with ❌).

