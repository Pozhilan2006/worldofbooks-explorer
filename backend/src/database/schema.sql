-- World of Books Explorer - PostgreSQL Schema
-- Version: 1.0
-- Description: Complete database schema with deduplication and TTL caching

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE job_type AS ENUM ('navigation', 'category', 'product_list', 'product_detail', 'review');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Navigation Table
-- Stores site navigation structure
CREATE TABLE navigation (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  parent_id INTEGER REFERENCES navigation(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Deduplication
  url_hash VARCHAR(64) NOT NULL UNIQUE,
  
  -- Metadata
  scraped_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT navigation_url_hash_unique UNIQUE (url_hash)
);

-- Category Table
-- Product categories with hierarchy
CREATE TABLE category (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES category(id) ON DELETE CASCADE,
  
  -- Source tracking
  source_url TEXT NOT NULL,
  source_id VARCHAR(255),
  
  -- Deduplication
  slug_hash VARCHAR(64) NOT NULL UNIQUE,
  
  -- Metadata
  product_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  scraped_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT category_slug_unique UNIQUE (slug),
  CONSTRAINT category_slug_hash_unique UNIQUE (slug_hash)
);

-- Product Table
-- Core product catalog with deduplication
CREATE TABLE product (
  id SERIAL PRIMARY KEY,
  
  -- Basic info
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  isbn VARCHAR(13),
  isbn10 VARCHAR(10),
  
  -- Pricing
  price DECIMAL(10, 2),
  original_price DECIMAL(10, 2),
  currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
  
  -- Availability
  in_stock BOOLEAN NOT NULL DEFAULT false,
  stock_quantity INTEGER,
  
  -- Source tracking
  source_url TEXT NOT NULL,
  source_id VARCHAR(255) NOT NULL,
  
  -- Deduplication
  isbn_hash VARCHAR(64),
  url_hash VARCHAR(64) NOT NULL,
  content_hash VARCHAR(64) NOT NULL,
  
  -- Relationships
  category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
  
  -- Metadata
  view_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  scraped_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT product_slug_unique UNIQUE (slug),
  CONSTRAINT product_source_id_unique UNIQUE (source_id),
  CONSTRAINT product_url_hash_unique UNIQUE (url_hash),
  CONSTRAINT product_isbn_hash_unique UNIQUE (isbn_hash) WHERE isbn_hash IS NOT NULL
);

-- Product Detail Table
-- Extended product info with TTL caching
CREATE TABLE product_detail (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  
  -- Extended info
  description TEXT,
  author VARCHAR(255),
  publisher VARCHAR(255),
  publication_date DATE,
  pages INTEGER,
  language VARCHAR(50),
  format VARCHAR(50),
  dimensions VARCHAR(100),
  weight VARCHAR(50),
  
  -- Images
  image_urls TEXT[],
  thumbnail_url TEXT,
  
  -- Additional metadata
  tags TEXT[],
  metadata JSONB,
  
  -- TTL Caching
  cached_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  is_stale BOOLEAN NOT NULL DEFAULT false,
  
  -- Tracking
  scrape_job_id INTEGER REFERENCES scrape_job(id) ON DELETE SET NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT product_detail_product_unique UNIQUE (product_id)
);

-- Review Table
-- Product reviews with deduplication
CREATE TABLE review (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  
  -- Review content
  rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  reviewer_name VARCHAR(255),
  
  -- Source tracking
  source_url TEXT,
  source_id VARCHAR(255),
  
  -- Deduplication
  content_hash VARCHAR(64) NOT NULL,
  
  -- Metadata
  helpful_count INTEGER NOT NULL DEFAULT 0,
  verified_purchase BOOLEAN NOT NULL DEFAULT false,
  reviewed_at TIMESTAMP,
  scraped_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT review_source_id_unique UNIQUE (source_id) WHERE source_id IS NOT NULL,
  CONSTRAINT review_content_hash_unique UNIQUE (product_id, content_hash)
);

-- Scrape Job Table
-- Tracks scraping jobs
CREATE TABLE scrape_job (
  id SERIAL PRIMARY KEY,
  
  -- Job details
  job_type job_type NOT NULL,
  status job_status NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 0,
  
  -- Target
  target_url TEXT NOT NULL,
  target_id INTEGER,
  
  -- Execution
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  
  -- Results
  items_scraped INTEGER NOT NULL DEFAULT 0,
  items_created INTEGER NOT NULL DEFAULT 0,
  items_updated INTEGER NOT NULL DEFAULT 0,
  items_failed INTEGER NOT NULL DEFAULT 0,
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  
  -- Scheduling
  scheduled_at TIMESTAMP NOT NULL DEFAULT NOW(),
  next_run_at TIMESTAMP,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- View History Table
-- Tracks product views with TTL
CREATE TABLE view_history (
  id SERIAL PRIMARY KEY,
  
  -- Tracking
  product_id INTEGER NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  user_identifier VARCHAR(255) NOT NULL,
  
  -- Metadata
  viewed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  
  -- Context
  referrer TEXT,
  user_agent TEXT,
  metadata JSONB
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Navigation Indexes
CREATE INDEX idx_navigation_parent ON navigation(parent_id);
CREATE INDEX idx_navigation_level ON navigation(level);
CREATE INDEX idx_navigation_active ON navigation(is_active) WHERE is_active = true;
CREATE INDEX idx_navigation_scraped_at ON navigation(scraped_at DESC);

-- Category Indexes
CREATE INDEX idx_category_parent ON category(parent_id);
CREATE INDEX idx_category_slug ON category(slug);
CREATE INDEX idx_category_active ON category(is_active) WHERE is_active = true;
CREATE INDEX idx_category_source_id ON category(source_id);
CREATE INDEX idx_category_product_count ON category(product_count DESC);

-- Product Indexes
CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_product_isbn ON product(isbn) WHERE isbn IS NOT NULL;
CREATE INDEX idx_product_price ON product(price);
CREATE INDEX idx_product_in_stock ON product(in_stock) WHERE in_stock = true;
CREATE INDEX idx_product_active ON product(is_active) WHERE is_active = true;
CREATE INDEX idx_product_content_hash ON product(content_hash);
CREATE INDEX idx_product_last_seen ON product(last_seen_at DESC);
CREATE INDEX idx_product_view_count ON product(view_count DESC);
CREATE INDEX idx_product_scraped_at ON product(scraped_at DESC);

-- Product Detail Indexes
CREATE INDEX idx_product_detail_product ON product_detail(product_id);
CREATE INDEX idx_product_detail_expires_at ON product_detail(expires_at);
CREATE INDEX idx_product_detail_stale ON product_detail(is_stale) WHERE is_stale = true;
CREATE INDEX idx_product_detail_author ON product_detail(author);
CREATE INDEX idx_product_detail_publisher ON product_detail(publisher);
CREATE INDEX idx_product_detail_metadata ON product_detail USING GIN (metadata);
CREATE INDEX idx_product_detail_tags ON product_detail USING GIN (tags);

-- Review Indexes
CREATE INDEX idx_review_product ON review(product_id);
CREATE INDEX idx_review_rating ON review(rating DESC);
CREATE INDEX idx_review_verified ON review(verified_purchase) WHERE verified_purchase = true;
CREATE INDEX idx_review_helpful ON review(helpful_count DESC);
CREATE INDEX idx_review_scraped_at ON review(scraped_at DESC);

-- Scrape Job Indexes
CREATE INDEX idx_scrape_job_status ON scrape_job(status);
CREATE INDEX idx_scrape_job_type ON scrape_job(job_type);
CREATE INDEX idx_scrape_job_priority ON scrape_job(priority DESC);
CREATE INDEX idx_scrape_job_scheduled ON scrape_job(scheduled_at);
CREATE INDEX idx_scrape_job_next_run ON scrape_job(next_run_at) WHERE next_run_at IS NOT NULL;
CREATE INDEX idx_scrape_job_created_at ON scrape_job(created_at DESC);
CREATE INDEX idx_scrape_job_metadata ON scrape_job USING GIN (metadata);

-- View History Indexes
CREATE INDEX idx_view_history_product ON view_history(product_id);
CREATE INDEX idx_view_history_user ON view_history(user_identifier);
CREATE INDEX idx_view_history_viewed_at ON view_history(viewed_at DESC);
CREATE INDEX idx_view_history_expires_at ON view_history(expires_at);
CREATE INDEX idx_view_history_product_user ON view_history(product_id, user_identifier);
CREATE INDEX idx_view_history_trending ON view_history(product_id, viewed_at DESC) 
  WHERE viewed_at > NOW() - INTERVAL '7 days';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Generate URL hash
CREATE OR REPLACE FUNCTION generate_url_hash(url TEXT)
RETURNS VARCHAR(64) AS $$
BEGIN
  RETURN encode(digest(url, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Generate product content hash
CREATE OR REPLACE FUNCTION generate_product_content_hash(
  title TEXT,
  isbn TEXT,
  price DECIMAL
)
RETURNS VARCHAR(64) AS $$
BEGIN
  RETURN encode(
    digest(
      COALESCE(title, '') || 
      COALESCE(isbn, '') || 
      COALESCE(price::TEXT, ''),
      'sha256'
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Mark stale product details
CREATE OR REPLACE FUNCTION mark_product_detail_stale()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at < NOW() THEN
    NEW.is_stale = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set product detail expiry (24 hours)
CREATE OR REPLACE FUNCTION set_product_detail_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at = NOW() + INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cleanup expired view history
CREATE OR REPLACE FUNCTION cleanup_expired_view_history()
RETURNS void AS $$
BEGIN
  DELETE FROM view_history WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Mark stale product details
CREATE OR REPLACE FUNCTION mark_stale_product_details()
RETURNS void AS $$
BEGIN
  UPDATE product_detail 
  SET is_stale = true 
  WHERE expires_at < NOW() AND is_stale = false;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER trigger_mark_product_detail_stale
  BEFORE INSERT OR UPDATE ON product_detail
  FOR EACH ROW
  EXECUTE FUNCTION mark_product_detail_stale();

CREATE TRIGGER trigger_set_product_detail_expiry
  BEFORE INSERT ON product_detail
  FOR EACH ROW
  EXECUTE FUNCTION set_product_detail_expiry();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE navigation IS 'Site navigation structure scraped from source';
COMMENT ON TABLE category IS 'Product categories with hierarchical structure';
COMMENT ON TABLE product IS 'Core product catalog with deduplication';
COMMENT ON TABLE product_detail IS 'Extended product information with TTL caching';
COMMENT ON TABLE review IS 'Product reviews with deduplication';
COMMENT ON TABLE scrape_job IS 'Scraping job tracking and scheduling';
COMMENT ON TABLE view_history IS 'User product view tracking with TTL';

COMMENT ON COLUMN product.isbn_hash IS 'SHA-256 hash of ISBN for deduplication';
COMMENT ON COLUMN product.url_hash IS 'SHA-256 hash of source URL for deduplication';
COMMENT ON COLUMN product.content_hash IS 'SHA-256 hash of content for deduplication';
COMMENT ON COLUMN product_detail.expires_at IS 'Cache expiration timestamp (TTL)';
COMMENT ON COLUMN product_detail.is_stale IS 'Flag indicating expired cache';
