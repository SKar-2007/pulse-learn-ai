import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const email = 'copilot-test+1@pulselearn.ai';
const password = 'PulseLearnTest123!';

async function run() {
    console.log('--- Auth Debug Script ---');

    // 1. Create/Get User using Admin API
    console.log(`Checking/Creating user: ${email}`);
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (createError) {
        if (createError.message.toLowerCase().includes('already registered') || createError.status === 422) {
            console.log('User already exists (or status 422), proceeding to sign in.');
        } else {
            console.error('Error creating user:', createError.message);
            process.exit(1);
        }
    } else {
        console.log('User created successfully:', userData.user.id);
    }

    // 2. Sign in to get a session token
    console.log('Signing in...');
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (signInError) {
        console.error('Error signing in:', signInError.message);
        process.exit(1);
    }

    const token = sessionData.session.access_token;
    const userId = sessionData.session.user.id;

    // 3. Create a profile if it doesn't exist
    console.log('Ensuring profile exists...');
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
            user_id: userId,
            learning_style: 'visual',
            expertise_level: 'beginner',
            communication_tone: 'friendly',
            study_domain: 'computer science',
            preferred_session_minutes: 45,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (profileError) {
        console.error('Error creating profile:', profileError.message);
        // Non-fatal, we still have the token
    } else {
        console.log('Profile ensured:', profile.user_id);
    }

    console.log('\n--- SUCCESS ---');
    console.log('SESSION_TOKEN:');
    console.log(token);
    console.log('----------------\n');

    process.exit(0);
}

run().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
