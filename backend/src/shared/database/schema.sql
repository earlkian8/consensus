CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_ready_analysis BOOLEAN DEFAULT FALSE,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pp_fk UUID NOT NULL REFERENCES production_plans(id) ON DELETE CASCADE,
    p_fk UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    excess NUMERIC(10, 2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pp_fk UUID NOT NULL REFERENCES production_plans(id) ON DELETE CASCADE,
    p_fk UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    suggested_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);