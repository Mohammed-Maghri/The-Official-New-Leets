CREATE SCHEMA IF NOT EXISTS leets;

CREATE TABLE IF NOT EXISTS leets.vip (
    id SERIAL PRIMARY KEY,
    category TEXT DEFAULT NULL,
    login TEXT DEFAULT NULL UNIQUE,
    profile TEXT DEFAULT NULL,
    token TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO
    leets.vip (
        category,
        login,
        profile,
        token
    )
VALUES (
        'student',
        'mmaghri',
        '',
        'owner'
    );

INSERT INTO
    leets.vip (
        category,
        login,
        profile,
        token
    )
VALUES (
        'student',
        'asnaji',
        '',
        'owner'
    );