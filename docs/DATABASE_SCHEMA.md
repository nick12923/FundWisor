# FundWisor Database Schema

## Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('entrepreneur', 'investor', 'admin')),
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  kyc_status VARCHAR(50) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  kyc_verified_at TIMESTAMP,
  kyc_document_url VARCHAR(500),
  investor_reliability_score DECIMAL(3,2) DEFAULT 0,
  total_investments INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
```

## Startups Table
```sql
CREATE TABLE startups (
  id SERIAL PRIMARY KEY,
  entrepreneur_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(500),
  problem VARCHAR(1000) NOT NULL,
  solution VARCHAR(1000),
  sector VARCHAR(100) NOT NULL,
  stage VARCHAR(50) CHECK (stage IN ('idea', 'pre-seed', 'seed', 'series-a', 'series-b')),
  funding_ask DECIMAL(15,2) NOT NULL,
  funding_currency VARCHAR(3) DEFAULT 'USD',
  equity_offer DECIMAL(5,2),
  website VARCHAR(255),
  pitch_deck_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  approved_by INT REFERENCES users(id),
  approval_date TIMESTAMP,
  rejection_reason TEXT,
  visibility_level VARCHAR(50) DEFAULT 'teaser' CHECK (visibility_level IN ('teaser', 'full')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  view_count INT DEFAULT 0,
  access_request_count INT DEFAULT 0
);

CREATE INDEX idx_startups_entrepreneur ON startups(entrepreneur_id);
CREATE INDEX idx_startups_status ON startups(status);
CREATE INDEX idx_startups_sector ON startups(sector);
CREATE INDEX idx_startups_created_at ON startups(created_at);
```

## Startup Details Table (Protected Content)
```sql
CREATE TABLE startup_details (
  id SERIAL PRIMARY KEY,
  startup_id INT NOT NULL UNIQUE REFERENCES startups(id) ON DELETE CASCADE,
  market_size VARCHAR(255),
  revenue DECIMAL(15,2),
  burn_rate DECIMAL(15,2),
  runway_months INT,
  team_size INT,
  technology_stack TEXT,
  competitors TEXT,
  go_to_market_strategy TEXT,
  milestones_achieved TEXT,
  key_metrics TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Access Requests Table
```sql
CREATE TABLE access_requests (
  id SERIAL PRIMARY KEY,
  startup_id INT NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  investor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revoked', 'expired')),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  response_reason TEXT,
  nda_signed BOOLEAN DEFAULT false,
  nda_signed_at TIMESTAMP,
  deposit_amount DECIMAL(15,2),
  deposit_paid BOOLEAN DEFAULT false,
  deposit_paid_at TIMESTAMP,
  deposit_refundable BOOLEAN DEFAULT true,
  access_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_access_requests_startup ON access_requests(startup_id);
CREATE INDEX idx_access_requests_investor ON access_requests(investor_id);
CREATE INDEX idx_access_requests_status ON access_requests(status);
CREATE INDEX idx_access_requests_created_at ON access_requests(created_at);
```

## Documents Table
```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  startup_id INT NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,
  document_type VARCHAR(100) CHECK (document_type IN ('pitch-deck', 'financial', 'technical', 'legal', 'market-research', 'other')),
  is_public BOOLEAN DEFAULT false,
  created_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_startup ON documents(startup_id);
CREATE INDEX idx_documents_type ON documents(document_type);
```

## Document Access Logs Table
```sql
CREATE TABLE document_access_logs (
  id SERIAL PRIMARY KEY,
  document_id INT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  investor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_request_id INT REFERENCES access_requests(id) ON DELETE SET NULL,
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  duration_seconds INT,
  pages_viewed INT,
  is_watermarked BOOLEAN DEFAULT true
);

CREATE INDEX idx_document_access_logs_investor ON document_access_logs(investor_id);
CREATE INDEX idx_document_access_logs_document ON document_access_logs(document_id);
CREATE INDEX idx_document_access_logs_accessed_at ON document_access_logs(accessed_at);
```

## Transactions Table
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  access_request_id INT NOT NULL REFERENCES access_requests(id) ON DELETE CASCADE,
  investor_id INT NOT NULL REFERENCES users(id),
  startup_id INT NOT NULL REFERENCES startups(id),
  transaction_type VARCHAR(50) CHECK (transaction_type IN ('deposit', 'refund')),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(100),
  payment_gateway_id VARCHAR(255),
  payment_gateway_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_transactions_investor ON transactions(investor_id);
CREATE INDEX idx_transactions_access_request ON transactions(access_request_id);
CREATE INDEX idx_transactions_status ON transactions(status);
```

## Notifications Table
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id INT,
  is_read BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50) CHECK (status IN ('success', 'failure')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

## KYC Verifications Table
```sql
CREATE TABLE kyc_verifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  kyc_provider VARCHAR(100),
  verification_id VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  date_of_birth DATE,
  id_number VARCHAR(255),
  id_type VARCHAR(50),
  address TEXT,
  country VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,
  verified_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kyc_verifications_user ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_verifications_status ON kyc_verifications(status);
```

## Views for Analytics

```sql
-- Startup Activity Dashboard
CREATE VIEW startup_analytics AS
SELECT 
  s.id,
  s.name,
  s.entrepreneur_id,
  COUNT(DISTINCT ar.id) as total_access_requests,
  COUNT(DISTINCT CASE WHEN ar.status = 'approved' THEN ar.id END) as approved_requests,
  COUNT(DISTINCT dal.id) as total_document_views,
  s.view_count,
  s.created_at
FROM startups s
LEFT JOIN access_requests ar ON s.id = ar.startup_id
LEFT JOIN documents d ON s.id = d.startup_id
LEFT JOIN document_access_logs dal ON d.id = dal.document_id
GROUP BY s.id, s.name, s.entrepreneur_id, s.view_count, s.created_at;

-- Investor Activity Dashboard
CREATE VIEW investor_analytics AS
SELECT 
  u.id,
  u.full_name,
  u.company_name,
  u.investor_reliability_score,
  COUNT(DISTINCT ar.id) as total_requests,
  COUNT(DISTINCT CASE WHEN ar.status = 'approved' THEN ar.id END) as approved_requests,
  COUNT(DISTINCT CASE WHEN ar.deposit_paid THEN ar.id END) as deposits_paid,
  COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount ELSE 0 END), 0) as total_deposited
FROM users u
LEFT JOIN access_requests ar ON u.id = ar.investor_id
LEFT JOIN transactions t ON ar.id = t.access_request_id
WHERE u.role = 'investor'
GROUP BY u.id, u.full_name, u.company_name, u.investor_reliability_score;
```
