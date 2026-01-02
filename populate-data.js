// Script to populate missing consumer data
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

async function populateData() {
  console.log('Populating consumer data...\n');

  // Get all consumers
  const { data: consumers, error: fetchError } = await supabase
    .from('consumer_accounts')
    .select('*');

  if (fetchError) {
    console.error('Error fetching consumers:', fetchError);
    return;
  }

  console.log(`Found ${consumers.length} consumers\n`);

  // Update each consumer to add missing fields
  for (const consumer of consumers) {
    console.log(`Updating consumer ${consumer.consumer_number}...`);

    const updates = {
      name: consumer.name || `Consumer ${consumer.consumer_number}`,
      email: consumer.email || `${consumer.consumer_number}@example.com`,
      phone: consumer.phone || '+91-9999999999',
      address: consumer.address || 'Address not provided'
    };

    const { error: updateError } = await supabase
      .from('consumer_accounts')
      .update(updates)
      .eq('id', consumer.id);

    if (updateError) {
      console.error(`  ❌ Error updating consumer ${consumer.consumer_number}:`, updateError);
    } else {
      console.log(`  ✅ Updated consumer ${consumer.consumer_number}`);
    }
  }

  console.log('\n--- Creating sample audit logs ---\n');

  // Create audit logs for each consumer
  for (const consumer of consumers) {
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        consumer_account_id: consumer.id,
        action: 'Consumer Registered',
        performed_by: consumer.registered_by,
        performed_by_name: 'Admin User'
      });

    if (auditError && auditError.code !== '23505') { // Ignore duplicate key errors
      console.error(`  ❌ Error creating audit log for ${consumer.consumer_number}:`, auditError);
    } else if (!auditError) {
      console.log(`  ✅ Created audit log for ${consumer.consumer_number}`);
    }
  }

  console.log('\n✅ Data population complete!');
}

populateData().catch(console.error);
