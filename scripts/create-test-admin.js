const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://hrsqcroirtzbdoeheyxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyc3Fjcm9pcnR6YmRvZWhleXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNjEyNjUsImV4cCI6MjA2NjkzNzI2NX0.hoVI2aI4rJncvo_9w5ZTNTqtsdjWEdCnxzsvBAb7-cw';

console.log('Creating test admin account...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestAdmin() {
  try {
    const passwordHash = bcrypt.hashSync('admin123', 10);

    const { data, error } = await supabase
      .from('admins')
      .insert({
        username: 'testadmin',
        email: 'test@admin.com',
        password_hash: passwordHash,
        name: '테스트관리자',
        role: 'super_admin',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating test admin:', error);
      process.exit(1);
    }

    console.log('✅ Test admin created successfully!');
    console.log('Username: testadmin');
    console.log('Password: admin123');
    console.log('Admin data:', data);
  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
}

createTestAdmin();
