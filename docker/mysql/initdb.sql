CREATE DATABASE symfony5;
CREATE DATABASE symfony5_test;

CREATE USER 'username'@'%' IDENTIFIED BY 'password';

GRANT ALL PRIVILEGES ON symfony5.* TO 'username'@'%';
GRANT ALL PRIVILEGES ON symfony5_test.* TO 'username'@'%';

FLUSH PRIVILEGES;
