import {Link} from 'react-router-dom';
import {motion} from 'motion/react';
import {
  Users,
  User,
  Award,
  TrendingUp,
  Heart,
  Zap,
  Shield,
  Globe,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Send,
} from 'lucide-react';
import quantixPropaganda from '../../assets/videos/quanitxlogvideo1.mp4';
import teamImage from '../../assets/images/Meistä.png';
import introVideo from '../../assets/videos/intro.mp4';

const warehouseImg =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBsb2dpc3RpY3N8ZW58MXx8fHwxNzc0MzQwNzc4fDA&ixlib=rb-4.1.0&q=80&w=1080';

const values = [
  {
    icon: Heart,
    title: 'Asiakaslähtöisyys',
    desc: 'Asiakkaan tarpeet ovat toimintamme keskiössä.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Zap,
    title: 'Tehokkuus',
    desc: 'Optimoimme jokaisen prosessin maksimaalisen tehokkuuden saavuttamiseksi.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Shield,
    title: 'Luotettavuus',
    desc: 'Lupaamme vain sen, minkä voimme täyttää ja täytämme sen ajallaan.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    icon: Globe,
    title: 'Läpinäkyvyys',
    desc: 'Kaikki tieto reaaliajassa. Ei piilokuluja eikä yllätyksiä.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
];

const milestones = [
  {year: '2019', event: 'Quantix Logistics perustettu Helsingissä'},
  {year: '2020', event: 'Ensimmäiset 50 kauppaa palvelussa'},
  {year: '2021', event: 'Live-seuranta julkaistu'},
  {year: '2022', event: 'Laajennuttiin 200+ kauppaan'},
  {year: '2023', event: 'ISO 22000 -sertifiointi saavutettu'},
  {year: '2024', event: '340+ kauppaa, 12 000 toimitusta viikossa'},
];

const team = [
  {
    name: 'Jere Mäkinen',
    role: 'Toimitusjohtaja',
    desc: '15v kokemus logistiikka-alalta',
  },
  {
    name: 'Teemu Virtanen',
    role: 'Teknologiajohtaja',
    desc: 'Aiemmin Senior Developer @ Wolt',
  },
  {
    name: 'Satvio Kallio',
    role: 'Operaatiopäällikkö',
    desc: '10v kokemus ruokaketjusta',
  },
  {
    name: 'Anders Hämäläinen',
    role: 'Manager, asiakaskokemus',
    desc: 'Vahva tausta asiakaskokemuksessa',
  },
];

export function AboutPage() {
  return (
    <div className="font-sans">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-[#0f2444]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{backgroundImage: `url(${teamImage})`}}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2444] to-[#0f2444]/90" />

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 w-full text-center">
          <motion.div
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.7}}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 mb-6">
              <Users size={16} className="text-orange-500" />
              <span className="text-orange-500 text-sm font-bold">Meistä</span>
            </div>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              Ruokalogistiikan{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                uudistajat
              </span>
            </h1>
            <p className="text-white/75 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
              Quantix Logistics syntyi tarpeesta tehdä ruokalogistiikasta
              läpinäkyvää, tehokasta ja reaaliaikaista. Yhdistämme
              jakelukeskukset, kuljettajat ja kaupat yhteen älykkääseen
              järjestelmään.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-orange-500 text-white font-bold text-base shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                Liity mukaan <ArrowRight size={18} />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-all cursor-pointer"
              >
                Tutustu tuotteisiin
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{opacity: 0, x: -30}}
            whileInView={{opacity: 1, x: 0}}
            transition={{duration: 0.7}}
            viewport={{once: true}}
          >
            <h2 className="text-[#0f2444] text-3xl md:text-4xl font-extrabold mb-6">
              Rakennamme ruokalogistiikasta läpinäkyvämpää arkea.
            </h2>
            <p className="text-slate-600 text-lg mb-6 leading-relaxed">
              Quantix Logistics syntyi tarpeesta yhdistää jakelukeskukset,
              kuljettajat ja kaupat yhteen selkeään näkymään. Tavoitteemme on
              vähentää epävarmuutta, nopeuttaa päätöksentekoa ja tehdä
              toimitusketjusta ennakoitava.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'Reaaliaikainen seuranta jokaiselle toimitukselle',
                'Optimoidut reitit ja vähemmän hävikkiä',
                'Täydellinen läpinäkyvyys koko toimitusketjuun',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-slate-600 font-medium"
                >
                  <CheckCircle size={22} className="text-green-500 shrink-0" />{' '}
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{opacity: 0, x: 30}}
            whileInView={{opacity: 1, x: 0}}
            transition={{duration: 0.7}}
            viewport={{once: true}}
            className="bg-gradient-to-b from-[#0f2444] to-[#17324f] rounded-3xl p-6 shadow-2xl"
          >
            <div className="mb-4">
              <span className="text-orange-500 text-xs font-extrabold uppercase tracking-widest block mb-1">
                Introvideo
              </span>
              <h3 className="text-white text-xl font-bold">
                Katso lyhyt esittely
              </h3>
            </div>
            <video
              controls
              playsInline
              preload="metadata"
              className="w-full aspect-video bg-black rounded-2xl shadow-inner object-cover"
            >
              <source src={introVideo} type="video/mp4" />
            </video>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-orange-500/10 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-4">
              Arvomme
            </div>
            <h2 className="text-[#0f2444] text-3xl md:text-4xl font-extrabold">
              Periaatteet, jotka ohjaavat toimintaamme
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: i * 0.1}}
                viewport={{once: true}}
                className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100"
              >
                <div
                  className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${v.bg}`}
                >
                  <v.icon size={28} className={v.color} />
                </div>
                <h3 className="text-[#0f2444] text-xl font-bold mb-3">
                  {v.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Propoganda */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{opacity: 0, x: -30}}
            whileInView={{opacity: 1, x: 0}}
            transition={{duration: 0.7}}
            viewport={{once: true}}
          >
            <div className="inline-block bg-orange-500/10 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-4">
              Missiomme
            </div>
            <h2 className="text-[#0f2444] text-3xl md:text-4xl font-extrabold mb-6">
              Yhtä vahva tiimi, yhtä kuin tavoitteemme.
            </h2>
            <p className="text-slate-600 text-lg mb-6 leading-relaxed">
              Tehdä ruokalogistiikasta Suomessa älykkäintä, läpinäkyvintä ja
              tehokkainta koskaan. Autamme kauppoja, kuljettajia ja
              jakelukeskuksia toimimaan yhtenä saumattomana kokonaisuutena.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center gap-3">
                <Award className="text-orange-500" />
                <span className="font-bold text-slate-700">ISO 22000</span>
              </div>
              <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-3">
                <TrendingUp className="text-green-500" />
                <span className="font-bold text-slate-700">99.2% ajoissa</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{opacity: 0, x: 30}}
            whileInView={{opacity: 1, x: 0}}
            transition={{duration: 0.7}}
            viewport={{once: true}}
          >
            <img
              src={warehouseImg}
              alt="Warehouse logistics"
              className="w-full h-auto rounded-3xl shadow-xl object-cover aspect-[4/3] mb-6"
            />

            <div className="bg-slate-900 rounded-3xl p-4 shadow-xl">
              <video
                controls
                playsInline
                preload="metadata"
                className="w-full aspect-video bg-black rounded-2xl object-cover"
              >
                <source src={quantixPropaganda} type="video/mp4" />
              </video>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[#0f2444] text-3xl md:text-4xl font-extrabold mb-4">
              Asiantuntijat toimintasi tueksi
            </h2>
            <p className="text-slate-500 text-lg">
              Kokenut tiimimme varmistaa parhaan mahdollisen palvelun.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: i * 0.1}}
                viewport={{once: true}}
                className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100"
              >
                <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                  <User size={32} className="text-slate-400" />
                </div>
                <h3 className="text-[#0f2444] text-xl font-bold mb-1">
                  {t.name}
                </h3>
                <div className="text-orange-500 text-sm font-bold uppercase tracking-wider mb-3">
                  {t.role}
                </div>
                <p className="text-slate-500">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[#0f2444] text-3xl md:text-4xl font-extrabold">
              Matka tähän päivään
            </h2>
          </div>
          <div>
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-6 mb-8 relative">
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-orange-500 ring-4 ring-orange-500/20 z-10" />
                  {i !== milestones.length - 1 && (
                    <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
                  )}
                </div>
                <div className="pb-6">
                  <div className="inline-block bg-[#0f2444] text-white px-3 py-1 rounded-md text-sm font-bold mb-2">
                    {m.year}
                  </div>
                  <p className="text-slate-600 text-lg font-medium m-0">
                    {m.event}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-slate-50 py-24 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-[#0f2444] text-3xl md:text-4xl font-extrabold mb-6">
              Kysyttävää? Olemme täällä auttamassa.
            </h2>
            <p className="text-slate-600 text-lg mb-10 leading-relaxed">
              Haluatko kuulla lisää siitä, miten Quantix voi tehostaa yrityksesi
              ruokalogistiikkaa? Jätä viesti, niin asiantuntijamme on sinuun
              yhteydessä.
            </p>
            <div className="space-y-6">
              {[
                {icon: Mail, title: 'Sähköposti', value: 'myynti@quantix.fi'},
                {icon: Phone, title: 'Puhelin', value: '+358 10 123 4567'},
                {
                  icon: MapPin,
                  title: 'Toimisto',
                  value: 'Logistiikkakuja 1, 00980 Helsinki',
                },
              ].map((info) => (
                <div key={info.title} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <info.icon size={22} className="text-orange-500" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-0.5">
                      {info.title}
                    </div>
                    <div className="text-[#0f2444] font-bold text-lg">
                      {info.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-100">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#0f2444] mb-2">
                    Etunimi
                  </label>
                  <input
                    type="text"
                    placeholder="Matti"
                    className="w-full p-4 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0f2444] mb-2">
                    Sukunimi
                  </label>
                  <input
                    type="text"
                    placeholder="Meikäläinen"
                    className="w-full p-4 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0f2444] mb-2">
                  Sähköposti
                </label>
                <input
                  type="email"
                  placeholder="matti@yritys.fi"
                  className="w-full p-4 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0f2444] mb-2">
                  Viesti
                </label>
                <textarea
                  rows={4}
                  placeholder="Miten voimme auttaa?"
                  className="w-full p-4 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-y"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                Lähetä viesti <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-white text-3xl md:text-5xl font-extrabold mb-6">
            Valmis aloittamaan?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-white text-orange-600 font-extrabold text-lg shadow-xl hover:scale-105 transition-transform cursor-pointer"
            >
              Aloita ilmaiseksi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
