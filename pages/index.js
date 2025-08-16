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
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
          {rows.map((r, i) => (
            <li
              key={r.id}
              style={{
                backgroundColor: r.color || '#f3f3f3',
                margin: '0.5rem 0',
                padding: '0.75rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                opacity: 0,
                animation: `fadeIn 0.8s ease forwards ${i * 0.1}s`,
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                const shine = e.currentTarget.querySelector('.shine');
                const particles = e.currentTarget.querySelectorAll('.particle');
                if (shine) shine.style.animationPlayState = 'running';
                particles.forEach(p => {
                  p.style.setProperty('--rand-x', Math.random().toString());
                  p.style.setProperty('--rand-y', Math.random().toString());
                  p.style.animationPlayState = 'running';
                });
              }}
              onMouseLeave={(e) => {
                const particles = e.currentTarget.querySelectorAll('.particle');
                particles.forEach(p => p.style.animationPlayState = 'paused');
              }}
            >
              {r.icon_url && (
                <div style={{ position: 'relative', width: 32, height: 32, overflow: 'hidden' }}>
                  <img
                    src={r.icon_url}
                    alt={`${r.label} icon`}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid white',
                      position: 'relative',
                      zIndex: 1
                    }}
                  />
                  <div
                    className="shine"
                    style={{
                      animation: 'shineMove 1s ease-in-out',
                      animationPlayState: 'running',
                      animationDelay: `${i * 0.15}s`
                    }}
                    onAnimationEnd={(e) => {
                      e.currentTarget.style.animationPlayState = 'paused';
                    }}
                  />
                  {[...Array(6)].map((_, idx) => (
                    <div
                      key={idx}
                      className="particle"
                      style={{
                        '--rand-x': Math.random(),
                        '--rand-y': Math.random(),
                        animation: `sparkle 1s linear ${idx * 0.15}s`,
                        animationPlayState: 'running'
                      }}
                      onAnimationEnd={(e) => {
                        e.currentTarget.style.animationPlayState = 'paused';
                      }}
                    />
                  ))}
                </div>
              )}
              <div>
                <strong>{r.label}</strong>
                <br />
                <small>
                  {r.awarded_at
                    ? new Date(r.awarded_at).toLocaleString('da-DK', { dateStyle: 'medium', timeStyle: 'short' })
                    : 'Ingen dato'}
                </small>
              </div>
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        @keyframes fadeIn { to { opacity: 1; } }

        .shine {
          position: absolute;
          top: 0;
          left: -75%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          animation-fill-mode: forwards;
          z-index: 2;
          border-radius: 50%;
          pointer-events: none;
        }

        @keyframes shineMove {
          0% { left: -75%; }
          100% { left: 125%; }
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          opacity: 0;
          z-index: 3;
        }

        @keyframes sparkle {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          50% { opacity: 1; }
          100% {
            transform: translate(
              calc(-20px + 40px * var(--rand-x)),
              calc(-20px + 40px * var(--rand-y))
            ) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}
