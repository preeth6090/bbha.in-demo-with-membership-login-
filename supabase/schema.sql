-- ============================================================
-- BBHA Member Portal — PostgreSQL Schema for Supabase
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id            UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT        NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  role          TEXT        NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  is_approved   BOOLEAN     NOT NULL DEFAULT false,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"     ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"   ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles"   ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    false
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. ENTITIES (business establishments)
-- ============================================================
CREATE TABLE entities (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  type        TEXT        NOT NULL CHECK (type IN ('Hotel','Restaurant','Bakery','QSR','Catering','Bar','Other')),
  address     TEXT,
  city        TEXT        NOT NULL DEFAULT 'Bangalore',
  gstin       TEXT,
  fssai_number TEXT,
  phone       TEXT,
  email       TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can manage own entities" ON entities FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Admins can manage all entities"  ON entities FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 3. MEMBERSHIPS (dues & validity tracking)
-- ============================================================
CREATE TABLE memberships (
  id                 UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id          UUID           NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  profile_id         UUID           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  membership_number  TEXT           UNIQUE,
  plan               TEXT           NOT NULL DEFAULT 'annual' CHECK (plan IN ('annual','lifetime')),
  payment_status     TEXT           NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid','pending','overdue','waived')),
  amount_due         NUMERIC(10,2)  NOT NULL DEFAULT 0,
  amount_paid        NUMERIC(10,2)  NOT NULL DEFAULT 0,
  due_date           DATE,
  paid_date          DATE,
  payment_reference  TEXT,
  valid_from         DATE,
  valid_until        DATE,
  created_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read own memberships"   ON memberships FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Admins can manage all memberships"  ON memberships FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 4. DOCUMENTS (compliance vault)
-- ============================================================
CREATE TABLE documents (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id           UUID        NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  profile_id          UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type         TEXT        NOT NULL CHECK (document_type IN (
    'FSSAI','BBMP_Trade_License','GST_Certificate','Fire_NOC','Health_License','Liquor_License','Other'
  )),
  custom_document_name  TEXT,
  document_number       TEXT,
  issuing_authority   TEXT,
  issue_date          DATE,
  expiry_date         DATE,
  file_url            TEXT,
  file_name           TEXT,
  verification_status TEXT        NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected','expired')),
  verified_by         UUID        REFERENCES profiles(id),
  verified_at         TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can manage own documents"  ON documents FOR ALL USING (profile_id = auth.uid());
CREATE POLICY "Admins can manage all documents"   ON documents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 5. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  message     TEXT        NOT NULL,
  type        TEXT        NOT NULL DEFAULT 'info' CHECK (type IN ('info','warning','success','error')),
  is_read     BOOLEAN     NOT NULL DEFAULT false,
  link        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications"  ON notifications FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Admins insert notifications"   ON notifications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 6. FEE ADJUSTMENTS (admin overrides)
-- ============================================================
CREATE TABLE fee_adjustments (
  id               UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_id    UUID           NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  adjusted_by      UUID           NOT NULL REFERENCES profiles(id),
  original_amount  NUMERIC(10,2)  NOT NULL,
  adjusted_amount  NUMERIC(10,2)  NOT NULL,
  reason           TEXT           NOT NULL,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

ALTER TABLE fee_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage fee adjustments" ON fee_adjustments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 7. UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at   BEFORE UPDATE ON profiles   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_entities_updated_at   BEFORE UPDATE ON entities   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_memberships_updated_at BEFORE UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_documents_updated_at  BEFORE UPDATE ON documents  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 8. INDEXES
-- ============================================================
CREATE INDEX idx_entities_owner        ON entities(owner_id);
CREATE INDEX idx_memberships_profile   ON memberships(profile_id);
CREATE INDEX idx_memberships_entity    ON memberships(entity_id);
CREATE INDEX idx_memberships_status    ON memberships(payment_status);
CREATE INDEX idx_documents_entity      ON documents(entity_id);
CREATE INDEX idx_documents_expiry      ON documents(expiry_date);
CREATE INDEX idx_notifications_profile ON notifications(profile_id, is_read);

-- ============================================================
-- 9. VENDOR DIRECTORY
-- ============================================================
CREATE TABLE vendor_categories (
  id          UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT  NOT NULL UNIQUE,
  icon        TEXT  NOT NULL DEFAULT '🏪',
  description TEXT,
  sort_order  INT   NOT NULL DEFAULT 0
);

ALTER TABLE vendor_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read vendor categories" ON vendor_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage vendor categories"   ON vendor_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE TABLE vendors (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id     UUID        NOT NULL REFERENCES vendor_categories(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  description     TEXT,
  contact_person  TEXT,
  phone           TEXT,
  email           TEXT,
  website         TEXT,
  address         TEXT,
  city            TEXT        NOT NULL DEFAULT 'Bangalore',
  pincode         TEXT,
  lat             NUMERIC(9,6),
  lng             NUMERIC(9,6),
  is_empanelled   BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Badge assignments with optional expiry
CREATE TABLE vendor_badges (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id    UUID        NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  badge_key    TEXT        NOT NULL CHECK (badge_key IN (
    'bbha_recommended','top_rated','verified_supplier','new_vendor','under_review',
    'bbha_member_rate','negotiated_price','fssai_approved','gst_registered','exclusive_partner'
  )),
  assigned_by  UUID        NOT NULL REFERENCES profiles(id),
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ,
  UNIQUE (vendor_id, badge_key)
);

ALTER TABLE vendor_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved members read badges"  ON vendor_badges FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = true)
);
CREATE POLICY "Admins manage badges" ON vendor_badges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE INDEX idx_vendor_badges_vendor   ON vendor_badges(vendor_id);
CREATE INDEX idx_vendor_badges_expiry   ON vendor_badges(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_vendors_pincode        ON vendors(pincode);
CREATE INDEX idx_vendors_location       ON vendors(lat, lng) WHERE lat IS NOT NULL;

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
-- All approved members can read vendors; contact details filtered in app layer
CREATE POLICY "Approved members can read vendors" ON vendors FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = true)
);
CREATE POLICY "Admins manage vendors" ON vendors FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_vendors_category    ON vendors(category_id);
CREATE INDEX idx_vendors_empanelled  ON vendors(is_empanelled);
CREATE TRIGGER trg_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 10. ANNOUNCEMENTS (admin ticker)
-- ============================================================
CREATE TABLE announcements (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  message     TEXT        NOT NULL,
  type        TEXT        NOT NULL DEFAULT 'info' CHECK (type IN ('info','warning','promo','alert')),
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_by  UUID        NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved members can read active announcements" ON announcements FOR SELECT USING (
  is_active = true AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = true)
);
CREATE POLICY "Admins manage announcements" ON announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 11. PAYMENT SUBMISSIONS (UTR tracking)
-- ============================================================
CREATE TABLE payment_submissions (
  id               UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_id    UUID           NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  profile_id       UUID           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  utr_number       TEXT           NOT NULL,
  amount_paid      NUMERIC(10,2)  NOT NULL,
  payment_method   TEXT           NOT NULL DEFAULT 'upi' CHECK (payment_method IN ('upi','neft','rtgs','imps','cash','other')),
  status           TEXT           NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  rejection_reason TEXT,
  invoice_number   TEXT,
  submitted_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  verified_at      TIMESTAMPTZ,
  verified_by      UUID           REFERENCES profiles(id),
  notes            TEXT
);

ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read own submissions"    ON payment_submissions FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Members can insert submissions"      ON payment_submissions FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Admins manage all submissions"       ON payment_submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_payment_submissions_profile   ON payment_submissions(profile_id);
CREATE INDEX idx_payment_submissions_status    ON payment_submissions(status);
CREATE INDEX idx_payment_submissions_submitted ON payment_submissions(submitted_at DESC);

-- ============================================================
-- 12. INVOICE SETTINGS (admin-editable BBHA billing config)
-- ============================================================
CREATE TABLE invoice_settings (
  id               UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  bbha_name        TEXT           NOT NULL DEFAULT 'Bangalore Hotels & Hospitality Association',
  bbha_gstin       TEXT           NOT NULL DEFAULT '',
  bbha_address     TEXT           NOT NULL DEFAULT 'BBHA House, Bangalore - 560001, Karnataka',
  bbha_phone       TEXT           NOT NULL DEFAULT '',
  bbha_email       TEXT           NOT NULL DEFAULT 'admin@bbha.in',
  sac_code         TEXT           NOT NULL DEFAULT '997221',
  membership_fee   NUMERIC(10,2)  NOT NULL DEFAULT 5000,
  gst_rate         NUMERIC(5,2)   NOT NULL DEFAULT 18,
  invoice_prefix   TEXT           NOT NULL DEFAULT 'BBHA',
  invoice_counter  INTEGER        NOT NULL DEFAULT 1000,
  upi_id           TEXT           NOT NULL DEFAULT 'bbha@upi',
  bank_name        TEXT           NOT NULL DEFAULT '',
  bank_account     TEXT           NOT NULL DEFAULT '',
  bank_ifsc        TEXT           NOT NULL DEFAULT '',
  logo_url         TEXT,
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_by       UUID           REFERENCES profiles(id)
);

ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;
-- Only one row ever; admins can read/write, members can read (needed for payment modal)
CREATE POLICY "Admins manage invoice settings" ON invoice_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Approved members can read invoice settings" ON invoice_settings FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = true)
);

-- Insert default settings row
INSERT INTO invoice_settings (bbha_name, sac_code, membership_fee, gst_rate, invoice_prefix)
VALUES ('Bangalore Hotels & Hospitality Association', '997221', 5000, 18, 'BBHA');

-- ============================================================
-- 13. SEED: First admin user (run after first signup)
-- UPDATE profiles SET role = 'admin', is_approved = true WHERE email = 'admin@bbha.in';
-- ============================================================
