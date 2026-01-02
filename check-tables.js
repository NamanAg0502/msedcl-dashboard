// Script to check existing tables in Supabase
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

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking Supabase database tables...\n');

  const tables = [
    'agents',
    'consumer_accounts',
    'bill_files',
    'work_list_items',
    'notes',
    'consumer_payments',
    'audit_logs'
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ Table "${table}": ${error.message}`);
      } else {
        console.log(`✅ Table "${table}": exists (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ Table "${table}": ${err.message}`);
    }
  }

  console.log('\n--- Fetching sample data ---\n');

  // Check agents
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('*')
    .limit(5);

  if (!agentsError && agents) {
    console.log(`Agents (${agents.length}):`, agents);
  }

  // Check consumer_accounts
  const { data: consumers, error: consumersError } = await supabase
    .from('consumer_accounts')
    .select('*')
    .limit(5);

  if (!consumersError && consumers) {
    console.log(`\nConsumers (${consumers.length}):`, consumers);
  }
}

checkTables().catch(console.error);
