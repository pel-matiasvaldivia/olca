import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Shield, Zap, ChevronRight, Car, Truck, Users } from 'lucide-react';

const stats = [
  { value: '15+', label: 'Años de experiencia' },
  { value: '500+', label: 'Vehículos en flota' },
  { value: '200+', label: 'Empresas clientes' },
  { value: '3 min', label: 'Para cotizar' },
];

const features = [
  { icon: Zap, title: 'Cotización instantánea', desc: 'Completá el formulario y recibí tu cotización en menos de 3 minutos, directo en tu email.' },
  { icon: Clock, title: 'Disponibilidad 24/7', desc: 'Cotizá cuando lo necesitás, sin esperar horarios de oficina. El sistema está siempre activo.' },
  { icon: Shield, title: 'Precios garantizados', desc: 'Los precios de tu cotización quedan fijos por 15 días. Sin sorpresas al momento de contratar.' },
];

const categories = [
  { icon: Car,   label: 'SUV Premium',  count: '12 vehículos' },
  { icon: Truck, label: 'Pickups',       count: '25 vehículos' },
  { icon: Truck, label: 'Furgones',      count: '18 vehículos' },
  { icon: Users, label: 'Minibuses',     count: '8 vehículos' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-950 text-dark-50">

      {/* ── Navbar ──────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-600/50">
        <div className="container-max flex items-center justify-between h-16 px-4 md:px-8">
          <span className="text-xl font-black tracking-widest gradient-text">OLCA RENTAL</span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Ingresar</Link>
            <Link to="/cotizar" className="btn-primary text-sm py-2 px-4">
              Cotizar ahora <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container-max px-4 md:px-8 py-24 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-400/10 border border-brand-400/20 text-brand-400 text-xs font-semibold mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              Nuevo sistema de cotización online
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black leading-tight mb-6"
            >
              La movilidad que{' '}
              <span className="gradient-text glow-text">mueve tu empresa</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-dark-300 mb-10 max-w-xl leading-relaxed"
            >
              Alquiler y gestión integral de flotas corporativas. Más de 15 años acompañando
              empresas de todo el país con vehículos confiables para su operación diaria.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/cotizar" className="btn-primary text-base py-4 px-8">
                Cotizar mi flota <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="https://olca.com.ar/flota/" target="_blank" rel="noreferrer" className="btn-secondary text-base py-4 px-8">
                Ver flota disponible <ChevronRight className="w-5 h-5" />
              </a>
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-500 text-xs animate-pulse-slow">
          <span>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-dark-500 to-transparent" />
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────── */}
      <section className="py-16 border-y border-dark-700/50 bg-dark-800/30">
        <div className="container-max px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-4xl font-black gradient-text mb-2">{s.value}</div>
                <div className="text-sm text-dark-400">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className="section">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Cotizá en <span className="gradient-text">3 pasos simples</span>
            </h2>
            <p className="text-dark-400 max-w-xl mx-auto">
              Sin llamadas, sin esperas. Completá el formulario online y recibí tu cotización personalizada al instante.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="card-hover p-8 group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-400/10 flex items-center justify-center mb-6 group-hover:bg-brand-400/20 transition-colors">
                  <f.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-dark-50">{f.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fleet Categories ─────────────────────────── */}
      <section className="section bg-dark-800/20">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Nuestra <span className="gradient-text">flota</span></h2>
            <p className="text-dark-400">Vehículos para toda industria y necesidad corporativa</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {categories.map((c, i) => (
              <motion.div
                key={c.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="card p-6 text-center hover:border-brand-400/30 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-400/10 transition-colors">
                  <c.icon className="w-6 h-6 text-brand-400" />
                </div>
                <div className="font-semibold text-dark-100 mb-1">{c.label}</div>
                <div className="text-xs text-dark-500">{c.count}</div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/cotizar" className="btn-primary text-base py-4 px-10">
              Cotizar ahora — es gratis <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-dark-700/50 py-12">
        <div className="container-max px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="text-xl font-black tracking-widest gradient-text mb-2">OLCA RENTAL</div>
              <p className="text-dark-500 text-sm">Tu socio en movimiento corporativo.</p>
            </div>
            <div className="flex gap-6 text-sm text-dark-500">
              <a href="https://olca.com.ar" className="hover:text-brand-400 transition-colors">olca.com.ar</a>
              <a href="mailto:olcarental@olca.com" className="hover:text-brand-400 transition-colors">olcarental@olca.com</a>
              <a href="tel:+5492634476543" className="hover:text-brand-400 transition-colors">+54 9 2634 476543</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-dark-800 text-center text-xs text-dark-600">
            © {new Date().getFullYear()} OLCA Rental. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
