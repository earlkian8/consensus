CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Main dish',
    dish_type VARCHAR(50) NOT NULL,
    batch_solid_count NUMERIC(10, 2) DEFAULT NULL,
    unit_solid VARCHAR(50) DEFAULT NULL,
    batch_liquid_volume NUMERIC(10, 2) DEFAULT NULL,
    unit_liquid VARCHAR(50) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Plan',
    end_time TIME DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'idle',
    started_at TIMESTAMP DEFAULT NULL,
    ended_at TIMESTAMP DEFAULT NULL,
    is_ready_analysis BOOLEAN DEFAULT FALSE,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pp_fk UUID NOT NULL REFERENCES production_plans(id) ON DELETE CASCADE,
    p_fk UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    liquid_amount NUMERIC(10, 2) DEFAULT NULL,
    excess NUMERIC(10, 2) DEFAULT NULL,
    condition VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pp_fk UUID NOT NULL REFERENCES production_plans(id) ON DELETE CASCADE,
    p_fk UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    suggested_amount NUMERIC(10, 2) NOT NULL,
    suggested_liquid_amount NUMERIC(10, 2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "user"(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
