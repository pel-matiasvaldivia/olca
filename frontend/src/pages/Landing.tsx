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
    <div className="min-h-screen bg-white text-dark-900 font-sans">

      {/* ── Navbar ──────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-200">
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
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container-max px-4 md:px-8 py-24 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-bold mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              Nuevo sistema de cotización online
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black leading-tight mb-6"
            >
              La movilidad que{' '}
              <span className="text-brand-600">mueve tu empresa</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-dark-500 mb-10 max-w-xl leading-relaxed"
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-400 text-xs animate-pulse">
          <span>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-dark-300 to-transparent" />
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────── */}
      <section className="py-16 border-y border-dark-200 bg-dark-50">
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
                <div className="text-4xl font-black text-brand-600 mb-2">{s.value}</div>
                <div className="text-sm text-dark-500 font-bold uppercase tracking-wider">{s.label}</div>
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
              Cotizá en <span className="text-brand-600">3 pasos simples</span>
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
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-6 group-hover:bg-brand-100 transition-colors">
                  <f.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-dark-900">{f.title}</h3>
                <p className="text-dark-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fleet Categories ─────────────────────────── */}
      <section className="section bg-dark-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-dark-900">Nuestra <span className="text-brand-600">flota</span></h2>
            <p className="text-dark-500 font-medium">Vehículos para toda industria y necesidad corporativa</p>
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
                <div className="w-12 h-12 rounded-xl bg-dark-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-50 transition-colors">
                  <c.icon className="w-6 h-6 text-brand-500" />
                </div>
                <div className="font-bold text-dark-900 mb-1">{c.label}</div>
                <div className="text-xs text-dark-400 font-medium">{c.count}</div>
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
      <footer className="border-t border-dark-200 py-12 bg-white">
        <div className="container-max px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="text-xl font-black tracking-widest text-brand-600 mb-2">OLCA RENTAL</div>
              <p className="text-dark-500 text-sm font-medium">Tu socio en movimiento corporativo.</p>
            </div>
            <div className="flex gap-6 text-sm text-dark-600 font-bold uppercase tracking-wider">
              <a href="https://olca.com.ar" className="hover:text-brand-500 transition-colors">olca.com.ar</a>
              <a href="mailto:olcarental@olca.com" className="hover:text-brand-500 transition-colors">olcarental@olca.com</a>
              <a href="tel:+5492634476543" className="hover:text-brand-500 transition-colors">+54 9 2634 476543</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-dark-100 text-center text-xs text-dark-400 font-medium">
            © {new Date().getFullYear()} OLCA Rental. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
