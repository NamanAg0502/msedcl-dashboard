// Script to fix consumer statuses
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local file
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Status mapping from backend to frontend
const statusMapping = {
  'consumer_added': 'Evaluation Pending',
  'evaluation_pending': 'Evaluation Pending',
  'evaluation_done': 'Evaluation Done',
  're_evaluation_pending': 'Re-Evaluation Pending',
  're_evaluation_done': 'Re-Evaluation Done',
  'proposal_pending': 'Proposal Pending',
  'proposal_done': 'Proposal Done',
  're_proposal_pending': 'Re-Proposal Pending',
  're_proposal_done': 'Re-Proposal Done',
  'forward_proposal': 'Forward Proposal',
  'sales_decision': 'Sales Decision',
  'followup_pending': 'Follow-up Pending',
  'followup_decision': 'Follow-up Decision',
  'paid': 'Paid',
  'inactive': 'Inactive',
  'next_month_prospect': 'Next Month Prospect'
};

async function fixStatuses() {
  console.log('Fixing consumer statuses...\n');

  const { data: consumers, error } = await supabase
    .from('consumer_accounts')
    .select('*');

  if (error) {
    console.error('Error fetching consumers:', error);
    return;
  }

  for (const consumer of consumers) {
    const oldStatus = consumer.status;
    const newStatus = statusMapping[oldStatus] || 'Evaluation Pending';

    if (oldStatus !== newStatus) {
      console.log(`Updating ${consumer.consumer_number}: "${oldStatus}" → "${newStatus}"`);

      const { error: updateError } = await supabase
        .from('consumer_accounts')
        .update({ status: newStatus })
        .eq('id', consumer.id);

      if (updateError) {
        console.error(`  ❌ Error:`, updateError);
      } else {
        console.log(`  ✅ Updated`);
      }
    }
  }

  console.log('\n✅ Status update complete!');
}

fixStatuses().catch(console.error);
