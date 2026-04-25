import { createClient } from '@supabase/supabase-js'

// هذه هي الإعدادات الخاصة بمشروعك (Bousala)
const supabaseUrl = 'https://tunyvbgshjdrmheahdfy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1bnl2YmdzaGpkcm1oZWFoZGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjE5NDEsImV4cCI6MjA5MjYzNzk0MX0.AuEDlrFL0zFv5sx5oAs7EeTeEz61R_EicuW980mMqfI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)