import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://npuneojjiqzybvnjnfsv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdW5lb2pqaXF6eWJ2bmpuZnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNDIwNDgsImV4cCI6MjA0NzYxODA0OH0.lDJb8FvMrcRAzHtFR1QvRFWcZp3FcQWzoYcBJ1VdnoU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase