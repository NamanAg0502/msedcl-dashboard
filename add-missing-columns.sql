-- Add missing columns to consumer_accounts table

ALTER TABLE consumer_accounts
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Update existing records with default values
UPDATE consumer_accounts
SET
  name = COALESCE(name, 'Consumer ' || consumer_number),
  email = COALESCE(email, consumer_number || '@example.com'),
  phone = COALESCE(phone, '+91-9999999999'),
  address = COALESCE(address, 'Address not provided')
WHERE name IS NULL OR email IS NULL OR phone IS NULL OR address IS NULL;
