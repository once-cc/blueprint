/**
 * Test: blueprint_references RLS (Row-Level Security)
 * 
 * Verifies that unauthenticated users with a valid x-blueprint-token
 * can successfully insert references (links/images) into the DB.
 * Used to prevent regressions on the 42501 RLS error.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('🧪 Starting RLS Integration Test for blueprint_references...');

    // 1. Create a dummy blueprint to get a valid session token
    console.log('   Creating test blueprint...');
    const { data: bp, error: bpError } = await supabase.rpc('create_blueprint');

    if (bpError) {
        console.error('❌ Failed to create test blueprint', bpError);
        process.exit(1);
    }

    const blueprintId = bp[0].id;
    const sessionToken = bp[0].session_token;

    // 2. Create unauthenticated client scoped with the new token
    const blueprintClient = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { 'x-blueprint-token': sessionToken } }
    });

    // 3. Attempt insert 
    console.log('   Attempting to insert link reference...');
    const { data: refData, error } = await blueprintClient
        .from('blueprint_references')
        .insert({
            blueprint_id: blueprintId,
            type: 'link',
            url: 'https://cleland.studio/verification',
            role: 'overall_vibe',
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Insert failed! RLS policy is rejecting the insert.');
        console.error(JSON.stringify(error, null, 2));
        process.exit(1);
    } else {
        console.log('✅ Insert successful! RLS policy allows inserts with session token.');

        // Clean up
        console.log('   Cleaning up test data...');
        await blueprintClient
            .from('blueprint_references')
            .delete()
            .eq('id', refData.id);

        console.log('✨ All tests passed.');
        process.exit(0);
    }
}

run();
