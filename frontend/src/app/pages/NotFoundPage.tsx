import {Link} from 'react-router';
import {motion} from 'motion/react';
import {AlertTriangle, ArrowLeft} from 'lucide-react';

export function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <div style={{textAlign: 'center', padding: '2rem'}}>
        <motion.div
          initial={{scale: 0}}
          animate={{scale: 1}}
          transition={{type: 'spring', stiffness: 200, damping: 15}}
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            backgroundColor: '#fff7ed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <AlertTriangle size={48} color="#f97316" />
        </motion.div>

        <h1
          style={{
            fontSize: '5rem',
            fontWeight: 800,
            color: '#0f2444',
            margin: 0,
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#374151',
            margin: '1rem 0',
          }}
        >
          Sivua ei löytynyt
        </h2>
        <p
          style={{
            color: '#64748b',
            marginBottom: '2rem',
            maxWidth: '400px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          Hups! Etsimääsi sivua ei ole olemassa, se on siirretty tai sinulla ei
          ole oikeuksia sen näkemiseen.
        </p>

        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#0f2444',
            color: 'white',
            padding: '0.875rem 1.75rem',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 700,
            transition: 'background-color 0.2s',
          }}
        >
          <ArrowLeft size={18} /> Palaa etusivulle
        </Link>
      </div>
    </div>
  );
}
