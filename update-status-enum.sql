-- Update the consumer_status_enum to include all frontend status values

-- Add new enum values to consumer_status_enum
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Evaluation Pending';
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Evaluation Done';
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Re-Evaluation Pending';
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Re-Evaluation Done';
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Proposal Pending';
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Proposal Done';
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Re-Proposal Pending';
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Re-Proposal Done';
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Forward Proposal';
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Sales Decision';
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Follow-up Pending';
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Follow-up Decision';
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Paid';
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Inactive';
ALTER TYPE consumer_status_enum ADD VALUE IF NOT EXISTS 'Next Month Prospect';

-- Now update the existing records
UPDATE consumer_accounts
SET status = 'Evaluation Pending'
WHERE status IN ('consumer_added', 'evaluation_pending');
