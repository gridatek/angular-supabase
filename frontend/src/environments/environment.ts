export const environment = {
  production: false,
  supabase: {
    url: 'http://localhost:54321',
    // This is the anon key - safe to expose in client
    // Get from: npm run status (in root directory)
    anonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  },
};
