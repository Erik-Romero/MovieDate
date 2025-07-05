import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brhfigwhdmumochajusc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaGZpZ3doZG11bW9jaGFqdXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTY2MTAsImV4cCI6MjA2NzIzMjYxMH0.6Xpi1I2Y1zCwoCGJ6TTDNHSegxQ8GYetPH4a3muB5AI';

export const supabase = createClient(supabaseUrl, supabaseKey);