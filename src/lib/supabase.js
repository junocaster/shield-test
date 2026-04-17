import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = process.env.REACT_APP_SUPABASE_URL ||
  'https://svomuvpasvfggyhsvoov.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2b211dnBhc3ZmZ2d5aHN2b292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzODk1MDYsImV4cCI6MjA5MTk2NTUwNn0.AzlGaZpcrpNxhfuZPuqZaISPI61KlxPuc_5TNPhewaw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
