-- 데이터베이스 생성
CREATE DATABASE user_management;

-- 데이터베이스 선택
USE user_management;

-- 테이블 생성
CREATE TABLE users (
    email VARCHAR(100) PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 데이터 삽입
INSERT INTO users (email, fullname, password)
VALUES ('example@example.com', 'John Doe', '암호화된_비밀번호');

-- 데이터 조회
SELECT * FROM users;
