import {useEffect, useState, useRef} from 'react';
import type {RefObject} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'motion/react';
import testimonialVideo from '../../assets/videos/Ravintolaomistajan_suositus_kuljetuspalvelulle.mp4';
import {
  Truck,
  Package,
  Store,
  ArrowRight,
  CheckCircle,
  BarChart2,
  Shield,
  Star,
  Zap,
} from 'lucide-react';

const heroImg =
  'https://images.unsplash.com/photo-1641290451977-a427586acf49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwbG9naXN0aWNzJTIwdHJ1Y2slMjBkZWxpdmVyeSUyMHdhcmVob3VzZXxlbnwxfHx8fDE3NzQzNDA3Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080';

const stats = [
  {key: 'shops', end: 340, suffix: '+', label: 'Kauppaa palveltu'},
  {key: 'deliveries', end: 12000, label: 'Toimitusta / viikko', group: true},
  {
    key: 'ontime',
    end: 99.2,
    suffix: '%',
    label: 'Ajallaan-prosentti',
    decimals: 1,
  },
  {key: 'years', end: 5, label: 'Toimintavuotta'},
] as const;

type StatItem = (typeof stats)[number];

function formatStatDisplay(value: number, s: StatItem): string {
  if ('decimals' in s && s.decimals !== undefined) {
    return `${value.toFixed(s.decimals)}${'suffix' in s ? (s.suffix ?? '') : ''}`;
  }
  if ('group' in s && s.group) {
    return `${Math.round(value).toLocaleString('fi-FI')}`;
  }
  return `${Math.round(value)}${'suffix' in s ? (s.suffix ?? '') : ''}`;
}

function useIntersectionActivate(ref: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );
  useEffect(() => {
    const el = ref.current;
    if (!el || active || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(true);
      },
      {threshold: 0.15, rootMargin: '0px 0px -8% 0px'}
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, active]);
  return active;
}

function useCountUpStat(end: number, active: boolean, decimals?: number) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!active || startedRef.current) return;
    startedRef.current = true;
    const duration = 1800;
    let startTs: number | null = null;
    let raf = 0;

    const tick = (ts: number) => {
      if (startTs === null) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      const cur = end * eased;
      if (decimals !== undefined) {
        setValue(Number(cur.toFixed(decimals)));
      } else {
        setValue(cur);
      }
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setValue(end);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, end, decimals]);

  return value;
}

function AnimatedStatFigure({
  stat,
  color,
  active,
  fontSize,
}: {
  stat: StatItem;
  color: string;
  active: boolean;
  fontSize: string;
}) {
  const decimals = 'decimals' in stat ? stat.decimals : undefined;
  const v = useCountUpStat(stat.end, active, decimals);
  const text = formatStatDisplay(v, stat);

  return (
    <div
      style={{fontSize, color}}
      className="font-extrabold leading-none mb-2 tabular-nums"
    >
      {text}
    </div>
  );
}

const features = [
  {
    icon: Zap,
    title: 'Live-seuranta',
    desc: 'Reaaliaikainen seuranta jokaiselle ruokarullakolle jakelukeskuksesta kauppaan asti.',
    color: '#f97316',
    bg: 'bg-orange-500/10',
    text: 'text-orange-500',
  },
  {
    icon: Package,
    title: 'Älykäs pakkaus',
    desc: 'Jakelukeskus pakkaa rullakot optimaalisesti boksikohtaisten tilausten mukaan.',
    color: '#3b82f6',
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
  },
  {
    icon: Truck,
    title: 'Reittioptimointi',
    desc: 'Automaattinen reittioptimointi vähentää kuljetuskustannuksia ja parantaa tehokkuutta.',
    color: '#8b5cf6',
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
  },
  {
    icon: Store,
    title: 'Kaupan portaali',
    desc: 'Kaupat seuraavat tilauksiaan, vastaanottavat toimitukset ja hallinnoivat valikoimaa.',
    color: '#22c55e',
    bg: 'bg-green-500/10',
    text: 'text-green-500',
  },
  {
    icon: BarChart2,
    title: 'Kattavat raportit',
    desc: 'Analytiikka kaikesta toimitusketjusta – myynneistä reklamaatioihin.',
    color: '#ec4899',
    bg: 'bg-pink-500/10',
    text: 'text-pink-500',
  },
  {
    icon: Shield,
    title: 'Elintarviketurvallisuus',
    desc: 'Täysi jäljitettävyys ja kylmäketjun valvonta HACCP-standardien mukaisesti.',
    color: '#f59e0b',
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
  },
];

const testimonials = [
  {
    name: 'Jaakko Koskinen',
    company: 'Viiden tähden ravintola Helsinki',
    text: 'Quantix on muuttanut tavan, jolla seuraamme saapuvia toimituksia. Ei enää yllätysten odottelua – tiedämme tarkalleen milloin rekka saapuu.',
    rating: 5,
  },
];

export function LandingPage() {
  const [now, setNow] = useState(() => new Date());
  const desktopStatsRef = useRef<HTMLDivElement>(null);
  const mobileStatsRef = useRef<HTMLElement>(null);
  const desktopStatsVisible = useIntersectionActivate(desktopStatsRef);
  const mobileStatsVisible = useIntersectionActivate(mobileStatsRef);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const liveDate = now.toLocaleDateString('fi-FI', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const liveWeekday = now.toLocaleDateString('fi-FI', {weekday: 'long'});
  const liveTime = now.toLocaleTimeString('fi-FI', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="font-sans">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#0a1929]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{backgroundImage: `url(${heroImg})`}}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1929] via-[#0a1929]/85 to-[#0f2444]/70" />

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{opacity: 0, y: 30}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.7}}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 mb-6 flex-wrap">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-orange-500 text-sm font-semibold">
                  Live-seuranta käytössä
                </span>
                <span className="w-px h-3.5 bg-orange-500/35 mx-1" />
                <span className="text-white/80 text-sm font-medium capitalize-first">
                  {liveWeekday} {liveDate} {liveTime}
                </span>
              </div>

              <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 tracking-tight">
                Ruokalogistiikka{' '}
                <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                  uudella tasolla
                </span>
              </h1>

              <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                Quantix Logistics yhdistää jakelukeskuksen, kuljettajat ja
                kaupat saumattomaksi digitaaliseksi ketjuksi – reaaliaikaisesti,
                läpinäkyvästi ja tehokkaasti.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-orange-500 text-white font-bold text-base shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Aloita ilmaiseksi <ArrowRight size={18} />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Katso tuotteet
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 mt-10">
                {['HACCP-sertifioitu', 'ISO 22000', 'GDPR-yhteensopiva'].map(
                  (tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1.5 text-white/50 text-sm font-medium"
                    >
                      <CheckCircle size={16} className="text-green-500" /> {tag}
                    </div>
                  )
                )}
              </div>
            </motion.div>

            {/* Desktop Stats */}
            <motion.div
              ref={desktopStatsRef}
              initial={{opacity: 0, x: 40}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.7, delay: 0.2}}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {stats.map((stat, i) => (
                <div
                  key={stat.key}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
                >
                  <AnimatedStatFigure
                    stat={stat}
                    active={desktopStatsVisible}
                    color={i % 2 === 0 ? '#f97316' : '#60a5fa'}
                    fontSize="2.5rem"
                  />
                  <div className="text-white/60 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
      </section>

      {/* Mobile Stats */}
      <section ref={mobileStatsRef} className="bg-slate-50 py-8 px-6 lg:hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.key}
              className="bg-white rounded-xl p-5 text-center shadow-sm border border-slate-100"
            >
              <AnimatedStatFigure
                stat={stat}
                active={mobileStatsVisible}
                color={i % 2 === 0 ? '#f97316' : '#3b82f6'}
                fontSize="1.75rem"
              />
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-orange-500/10 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-4">
              Ominaisuudet
            </div>
            <h2 className="text-[#0f2444] text-3xl md:text-4xl font-extrabold mb-4">
              Kaikki mitä tarvitset tehokkaaseen ruokalogistiikkaan
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Quantix yhdistää kaikki toimitusketjun osat yhteen älykkääseen
              järjestelmään.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: i * 0.08}}
                viewport={{once: true}}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div
                  className={`w-14 h-14 rounded-xl ${f.bg} flex items-center justify-center mb-6`}
                >
                  <f.icon size={26} className={f.text} />
                </div>
                <h3 className="text-[#0f2444] text-xl font-bold mb-3">
                  {f.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#0f2444] py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block bg-orange-500/15 text-orange-500 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-4">
              Miten se toimii
            </div>
            <h2 className="text-white text-3xl md:text-4xl font-extrabold">
              Kolme vaihetta täydelliseen toimitukseen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                icon: Package,
                title: 'Jakelukeskus pakkaa',
                desc: 'Tilaukset saapuvat järjestelmään, jakelukeskus pakkaa rullakot ruokabokseineen ja kirjaa ne järjestelmään.',
              },
              {
                step: '02',
                icon: Truck,
                title: 'Rekka toimittaa',
                desc: 'Kuljettaja saa optimoidun reitin, merkitsee toimitukset tehdyksi ja järjestelmä päivittyy reaaliajassa.',
              },
              {
                step: '03',
                icon: Store,
                title: 'Kauppa vastaanottaa',
                desc: 'Kauppa seuraa tilauksen saapumista, vastaanottaa rullakot ja kuittaa toimituksen järjestelmässä.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{opacity: 0, y: 40}}
                whileInView={{opacity: 1, y: 0}}
                transition={{duration: 0.6, delay: i * 0.2}}
                viewport={{once: true}}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto bg-orange-500/15 border-2 border-orange-500/30 rounded-full flex items-center justify-center mb-6 relative">
                  <item.icon size={32} className="text-orange-500" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-white text-xl font-bold mb-3">
                  {item.title}
                </h3>
                <p className="text-white/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[#0f2444] text-3xl md:text-4xl font-extrabold">
              Asiakkaiden kokemuksia
            </h2>
          </div>
          <div className="bg-slate-50 rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm">
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className="text-orange-500 fill-orange-500"
                />
              ))}
            </div>
            <video
              controls
              playsInline
              preload="metadata"
              className="w-full rounded-2xl mb-8 bg-black aspect-video object-cover shadow-lg"
            >
              <source src={testimonialVideo} type="video/mp4" />
            </video>
            <div>
              <div className="font-extrabold text-lg text-[#0f2444]">
                {testimonials[0].name}
              </div>
              <div className="text-slate-500 font-medium">
                {testimonials[0].company}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-white text-3xl md:text-5xl font-extrabold mb-6">
            Valmis aloittamaan?
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-10">
            Liity satojen kauppojen joukkoon ja koe ero reaaliaikaisessa
            ruokalogistiikassa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-white text-orange-600 font-extrabold text-lg shadow-xl hover:scale-105 transition-transform cursor-pointer"
            >
              Aloita ilmaiseksi
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-4 rounded-xl bg-white/10 border-2 border-white/40 text-white font-bold text-lg hover:bg-white/20 transition-colors cursor-pointer"
            >
              Katso hinnat
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
