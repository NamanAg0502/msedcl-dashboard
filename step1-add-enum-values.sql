-- STEP 1: Add new enum values to consumer_status_enum
-- Run this first, then run step2-update-statuses.sql

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
