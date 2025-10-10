SELECT id, email, first_name, last_name, role, is_super_admin
FROM users
ORDER BY created_at DESC
LIMIT 5;
