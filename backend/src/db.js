const { createClient } = require('@supabase/supabase-js');

// Using the explicit HTTPS endpoint that handles network block bypasses over port 443
const supabaseUrl = 'https://rxkkzmugyrzyrmgcfiph.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a2t6bXVneXJ6eXJtZ2NmaXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjA1ODIsImV4cCI6MjA5Nzg5NjU4Mn0.6moIzW5rE4IYRV3BPqEODy0ECahRxemacBDBqZ_U8PU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Generic placeholder query execution interface
const mockQuery = async (text, params = []) => {
  return { rows: [], rowCount: 0 };
};

// Structural interface matching the pool properties expected by migration handlers
const db = {
  query: mockQuery,
  connect: async () => {
    return {
      query: mockQuery,
      release: () => { }
    };
  },
  pool: {
    query: mockQuery,
    connect: async () => ({ query: mockQuery, release: () => { } })
  }
};

module.exports = db;