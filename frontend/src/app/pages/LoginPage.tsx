import {useState} from 'react';
import {useNavigate, Link} from 'react-router';
import {Shield, Eye, EyeOff, AlertCircle, Truck, ArrowLeft} from 'lucide-react';
import {useAuth} from '../contexts/AuthContext';
import {motion} from 'motion/react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {login} = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const ok = await login(email, password);
    setLoading(false);

    if (ok) {
      const saved = localStorage.getItem('quantix_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'admin') navigate('/admin');
        else if (u.role === 'driver') navigate('/driver');
        else navigate('/customer'); // Korjattu ohjaamaan oikeaan asiakasnäkymään
      } else {
        navigate('/');
      }
    } else {
      setError('Virheelliset tunnukset. Tarkista sähköposti ja salasana.');
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-900">
      {/* Left side – branding */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-[#0f2444] to-[#1e3a5f]">
        {/* Decorative circles */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-primary/10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{width: (i + 1) * 200, height: (i + 1) * 200}}
          />
        ))}

        <div className="relative text-center z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(249,115,22,0.35)]">
            <Truck size={40} className="text-white" />
          </div>
          <h2 className="text-white text-3xl font-extrabold mb-3 tracking-tight">
            QUANTIX LOGISTICS
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-sm mx-auto mb-10">
            Ruokalogistiikan komentokeskus – kaikki toiminnot yhdessä paikassa.
          </p>

          <div className="flex flex-col gap-4 text-left max-w-xs mx-auto">
            {[
              'Reaaliaikainen reittiseuranta',
              'Kuljettajien hallinta',
              'Tilausraportointi',
              'Kauppaverkoston hallinta',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-white/75 text-sm font-medium"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side – form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-3xl p-8 sm:p-10 shadow-xl border border-border">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <Shield
                  size={28}
                  className="text-amber-600 dark:text-amber-500"
                />
              </div>
              <h1 className="text-foreground font-extrabold text-2xl mb-1">
                Kirjaudu sisään
              </h1>
              <p className="text-muted-foreground text-sm">
                Kirjaudu sisään hallintapaneeliin
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-6 flex items-center gap-2 text-destructive text-sm font-medium">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-foreground font-bold text-sm mb-2">
                  Sähköposti
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nimi@yritys.fi"
                  className="w-full p-3.5 rounded-xl border border-border bg-input-background text-foreground text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-foreground font-bold text-sm mb-2">
                  Salasana
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-12 py-3.5 rounded-xl border border-border bg-input-background text-foreground text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-xl border-none bg-primary text-primary-foreground font-bold text-base cursor-pointer hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? 'Kirjaudutaan...' : 'Kirjaudu sisään'}
              </button>
            </form>

            <div className="text-center mt-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium hover:text-primary transition-colors"
              >
                <ArrowLeft size={16} /> Takaisin etusivulle
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
