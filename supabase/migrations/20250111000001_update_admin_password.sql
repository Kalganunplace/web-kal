-- Update admin password to admin123!!
UPDATE admins
SET password_hash = '$2b$10$JRZUNTRLwob3InPFOJ1FLOKJsnXo3ke1oYBqXnYFDhBllhIOjDguy'
WHERE username = 'admin';
