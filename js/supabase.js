import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// WALAY 'v' sa taliwala sa fh ug caluj
const SUPABASE_URL = 'https://agydqpurvxwvfhcaluj.supabase.co';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneWRxcHVydnh3dmZ2aGNhbHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4OTA3MzYsImV4cCI6MjEwNDQ2NjczNn0.BUxfVuaw808RkhichBEVxJiMLX4VkyUAOfJqTmAq9ws';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);