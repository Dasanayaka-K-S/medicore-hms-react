-- =====================================================================
-- MediCore HMS - Seed data (roles, demo users, departments)
--
-- Run this only on a FRESH database, after schema.sql. If you are
-- migrating your existing medicore_hms database, skip this file - your
-- data and users are already there and will keep working.
--
-- The password hashes below are the original PHP bcrypt hashes, copied
-- unchanged. The Node backend verifies them with bcryptjs, which reads
-- PHP's $2y$ format, so no password resets are needed.
--
--   admin / demo  -> admin123
--   everyone else -> Password123
--
-- These are development accounts. Change or remove them before putting
-- this anywhere real.
-- =====================================================================

USE `medicore_hms`;

INSERT INTO `roles` (`id`, `role_name`) VALUES
(1, 'Administrator'),
(2, 'Doctor'),
(3, 'Nurse'),
(4, 'Receptionist'),
(5, 'Laboratory Staff'),
(6, 'Pharmacist'),
(7, 'Accountant')
ON DUPLICATE KEY UPDATE `role_name` = VALUES(`role_name`);

INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `role_id`, `status`) VALUES
(1, 'admin',          '$2y$10$m4Cs.zAudVx3gQQd6W6VSOYlYzPq7oPWU6OfqsWVBdajacgt8idEi', 'System Administrator', 'admin@medicore.test',        1, 'Active'),
(2, 'dr.perera',      '$2y$10$/GQ3LdCwFYH.8STIBvpS6uevTF2CAw8aDjRDz9AjsCUh0yEw/9Jzu', 'Dr. Nimal Perera',     'nimal.perera@medicore.test', 2, 'Active'),
(3, 'nurse.silva',    '$2y$10$/GQ3LdCwFYH.8STIBvpS6uevTF2CAw8aDjRDz9AjsCUh0yEw/9Jzu', 'Kamala Silva',         'kamala.silva@medicore.test', 3, 'Active'),
(4, 'reception.jane', '$2y$10$/GQ3LdCwFYH.8STIBvpS6uevTF2CAw8aDjRDz9AjsCUh0yEw/9Jzu', 'Jane Fernando',        'jane.fernando@medicore.test',4, 'Active'),
(5, 'lab.staff',      '$2y$10$/GQ3LdCwFYH.8STIBvpS6uevTF2CAw8aDjRDz9AjsCUh0yEw/9Jzu', 'Ruwan Jayasuriya',     'ruwan.jaya@medicore.test',   5, 'Active'),
(6, 'pharmacist',     '$2y$10$/GQ3LdCwFYH.8STIBvpS6uevTF2CAw8aDjRDz9AjsCUh0yEw/9Jzu', 'Priya Wickrama',       'priya.wick@medicore.test',   6, 'Active'),
(7, 'accountant',     '$2y$10$/GQ3LdCwFYH.8STIBvpS6uevTF2CAw8aDjRDz9AjsCUh0yEw/9Jzu', 'Sunil Bandara',        'sunil.bandara@medicore.test',7, 'Active'),
(8, 'demo',           '$2y$10$m4Cs.zAudVx3gQQd6W6VSOYlYzPq7oPWU6OfqsWVBdajacgt8idEi', 'Demo Administrator',   'demo@medicore.test',         1, 'Active')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

INSERT INTO `departments` (`id`, `department_name`, `description`) VALUES
(1, 'General Medicine', 'General check-ups and treatment'),
(2, 'Cardiology',       'Heart and cardiovascular care'),
(3, 'Pediatrics',       'Child healthcare'),
(4, 'Surgery',          'Surgical procedures'),
(5, 'Laboratory',       'Diagnostic testing services'),
(6, 'Pharmacy',         'Medicine dispensing')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);
