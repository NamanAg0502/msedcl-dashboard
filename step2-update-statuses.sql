-- STEP 2: Update existing consumer records to use the new status values
-- Run this AFTER running step1-add-enum-values.sql

UPDATE consumer_accounts
SET status = 'Evaluation Pending'
WHERE status IN ('consumer_added', 'evaluation_pending');
