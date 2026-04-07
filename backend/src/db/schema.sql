-- =====================================================
-- F&B KPI Dashboard — PostgreSQL Schema
-- =====================================================

-- Daily KPI summary data (90 days of historical data)
CREATE TABLE IF NOT EXISTS daily_kpi_data (
  id            SERIAL PRIMARY KEY,
  date          DATE NOT NULL UNIQUE,
  dow           SMALLINT NOT NULL,       -- 0=Sun..6=Sat
  day_name      VARCHAR(3) NOT NULL,

  -- Revenue domain
  revenue_daily           NUMERIC(10,2) NOT NULL,
  revenue_target          NUMERIC(10,2) NOT NULL,
  revenue_attainment      NUMERIC(5,1) NOT NULL,
  revpash                 NUMERIC(6,2) NOT NULL,
  avg_check               NUMERIC(6,2) NOT NULL,
  revenue_dine_in         NUMERIC(10,2) NOT NULL,
  revenue_delivery        NUMERIC(10,2) NOT NULL,
  revenue_takeaway        NUMERIC(10,2) NOT NULL,
  dine_in_pct             NUMERIC(5,1) NOT NULL,
  delivery_pct            NUMERIC(5,1) NOT NULL,
  takeaway_pct            NUMERIC(5,1) NOT NULL,
  peak_capture            NUMERIC(5,1) NOT NULL,
  event_revenue           NUMERIC(10,2) DEFAULT 0,
  event_pct               NUMERIC(5,1) DEFAULT 0,

  -- Operations domain
  table_turnover          NUMERIC(4,2) NOT NULL,
  dwell_time              INTEGER NOT NULL,
  ktt                     NUMERIC(4,1) NOT NULL,
  delivery_time           NUMERIC(4,1) NOT NULL,
  seat_utilisation        NUMERIC(5,1) NOT NULL,
  dine_in_covers          INTEGER NOT NULL,
  delivery_orders         INTEGER NOT NULL,
  total_covers            INTEGER NOT NULL,

  -- Orders & Menu domain
  order_error_rate        NUMERIC(4,2) NOT NULL,
  cancellation_rate       NUMERIC(4,2) NOT NULL,
  upsell_rate             NUMERIC(5,1) NOT NULL,
  item_86_count           INTEGER NOT NULL,
  bev_to_food_ratio       NUMERIC(4,1) NOT NULL,

  -- Staff domain
  staff_on_duty           INTEGER NOT NULL,
  staff_scheduled         INTEGER NOT NULL,
  staff_no_shows          INTEGER DEFAULT 0,
  staff_late_arrivals     INTEGER DEFAULT 0,
  foh_staff               INTEGER NOT NULL,
  boh_staff               INTEGER NOT NULL,
  total_staff_hours       NUMERIC(6,1) NOT NULL,
  labour_cost             NUMERIC(10,2) NOT NULL,
  labour_cost_pct         NUMERIC(5,1) NOT NULL,
  rplh                    NUMERIC(6,2) NOT NULL,
  covers_per_server       NUMERIC(5,1) NOT NULL,

  -- Customer domain
  nps                     INTEGER NOT NULL,
  return_rate             NUMERIC(5,1) NOT NULL,
  review_score            NUMERIC(3,2) NOT NULL,
  review_count            INTEGER NOT NULL,
  clv                     INTEGER NOT NULL,
  complaint_res_time      INTEGER NOT NULL,
  reservation_no_show     NUMERIC(4,1) NOT NULL,

  -- Inventory domain
  food_cost_pct           NUMERIC(5,1) NOT NULL,
  food_cost_value         NUMERIC(10,2) NOT NULL,
  waste_percent           NUMERIC(5,2) NOT NULL,
  waste_value             NUMERIC(10,2) NOT NULL,
  inventory_turnover      NUMERIC(4,1) NOT NULL,
  shrinkage_rate          NUMERIC(4,2) NOT NULL,
  supplier_on_time        NUMERIC(5,1) NOT NULL,
  portion_variance        NUMERIC(4,1) NOT NULL,

  -- ROI & Growth domain
  prime_cost              NUMERIC(5,1) NOT NULL,
  ebitda                  NUMERIC(10,2) NOT NULL,
  ebitda_margin           NUMERIC(5,1) NOT NULL,
  break_even_covers       INTEGER NOT NULL,
  cash_flow_runway        INTEGER NOT NULL,
  marketing_roi_social    NUMERIC(6,1) NOT NULL,
  marketing_roi_email     NUMERIC(6,1) NOT NULL,
  marketing_roi_local     NUMERIC(6,1) NOT NULL,
  loyalty_roi             NUMERIC(5,1) NOT NULL,
  delivery_commission     NUMERIC(5,1) NOT NULL,
  net_delivery_margin     NUMERIC(5,1) NOT NULL,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Hourly KPI data for today's live view
CREATE TABLE IF NOT EXISTS hourly_kpi_data (
  id              SERIAL PRIMARY KEY,
  date            DATE NOT NULL,
  hour            SMALLINT NOT NULL,
  label           VARCHAR(5) NOT NULL,
  weight          NUMERIC(3,2) NOT NULL,
  is_live         BOOLEAN DEFAULT FALSE,
  revenue         NUMERIC(10,2) DEFAULT 0,
  covers          INTEGER DEFAULT 0,
  ktt             NUMERIC(4,1),
  seat_occupancy  NUMERIC(5,1) DEFAULT 0,
  delivery_orders INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, hour)
);

-- Menu items with engineering quadrant classification
CREATE TABLE IF NOT EXISTS menu_items (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(100) NOT NULL,
  category            VARCHAR(50) NOT NULL,
  sell_price          NUMERIC(6,2) NOT NULL,
  food_cost           NUMERIC(6,2) NOT NULL,
  popularity          INTEGER NOT NULL,
  quadrant            VARCHAR(20) NOT NULL,
  contribution_margin NUMERIC(6,2) GENERATED ALWAYS AS (sell_price - food_cost) STORED,
  margin_percent      NUMERIC(5,1) GENERATED ALWAYS AS (
    CASE WHEN sell_price > 0 THEN ((sell_price - food_cost) / sell_price * 100) ELSE 0 END
  ) STORED
);

-- Staff members
CREATE TABLE IF NOT EXISTS staff_members (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(100) NOT NULL,
  role                VARCHAR(50) NOT NULL,
  type                VARCHAR(20) NOT NULL,  -- full-time / part-time
  hourly_rate         NUMERIC(6,2) NOT NULL,
  hire_date           DATE NOT NULL,
  shifts_per_week     INTEGER NOT NULL,
  avg_hours_per_shift NUMERIC(4,1) NOT NULL,
  training_hours_month NUMERIC(4,1) NOT NULL
);

-- Alerts with persistent state
CREATE TABLE IF NOT EXISTS alerts (
  id              VARCHAR(50) PRIMARY KEY,
  domain          VARCHAR(30) NOT NULL,
  kpi             VARCHAR(100) NOT NULL,
  severity        VARCHAR(20) NOT NULL,  -- info, warning, critical
  condition_text  TEXT NOT NULL,
  threshold       NUMERIC(10,2),
  action_text     TEXT NOT NULL,
  triggered_at    TIMESTAMP,
  acknowledged    BOOLEAN DEFAULT FALSE,
  dismissed       BOOLEAN DEFAULT FALSE,
  active          BOOLEAN DEFAULT TRUE,
  from_scenario   VARCHAR(50),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Alert thresholds (user-configurable)
CREATE TABLE IF NOT EXISTS alert_thresholds (
  id              VARCHAR(50) PRIMARY KEY,
  domain          VARCHAR(30) NOT NULL,
  kpi             VARCHAR(100) NOT NULL,
  threshold_value NUMERIC(10,2) NOT NULL,
  operator        VARCHAR(5) DEFAULT '>',  -- '>', '<', '>=', '<='
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- RevPASH heatmap data (7-day x hourly)
CREATE TABLE IF NOT EXISTS revpash_heatmap (
  id          SERIAL PRIMARY KEY,
  date        DATE NOT NULL,
  day_name    VARCHAR(3) NOT NULL,
  hour        SMALLINT NOT NULL,
  value       NUMERIC(5,1) NOT NULL,
  UNIQUE(date, hour)
);

-- Dead slot heatmap (30-min blocks x 7 days)
CREATE TABLE IF NOT EXISTS dead_slot_heatmap (
  id          SERIAL PRIMARY KEY,
  date        DATE NOT NULL,
  day_name    VARCHAR(3) NOT NULL,
  slot        VARCHAR(5) NOT NULL,
  revenue     NUMERIC(8,2) NOT NULL,
  is_dead_slot BOOLEAN DEFAULT FALSE,
  UNIQUE(date, slot)
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_daily_kpi_date ON daily_kpi_data(date);
CREATE INDEX IF NOT EXISTS idx_hourly_kpi_date_hour ON hourly_kpi_data(date, hour);
CREATE INDEX IF NOT EXISTS idx_alerts_domain ON alerts(domain);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(active);
CREATE INDEX IF NOT EXISTS idx_revpash_date ON revpash_heatmap(date);
CREATE INDEX IF NOT EXISTS idx_dead_slot_date ON dead_slot_heatmap(date);
