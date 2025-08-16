import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [status, setStatus] = useState('Checker forbindelse...');
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function run() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setStatus('Manglende environment variables i Vercel');
        return;
      }
      try {
        const { data, error } = await supabase.from('badges').select('*').limit(10);
        if (error && error.code === '42P01') {
          setStatus('Forbundet til Supabase ✓ (opret tabellen "badges" for at se data)');
        } else if (error) {
          setStatus('Forbundet, men query-fejl: ' + error.message);
        } else {
          setStatus('Forbundet til Supabase ✓');
          setRows(data || []);
        }
      } catch (e) {
        setStatus('Forbindelsesfejl: ' + e.message);
      }
    }
    run();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Forkbeards Badges</h1>
      <p>{status}</p>
      {rows.length > 0 && (
        <ul>
          {rows.map((r) => (
            <li key={r.id}>{JSON.stringify(r)}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
