import { motion } from 'motion/react';
import { Building2, Code2, ArrowRight } from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (page: string) => void;
}

export function ServicesPage({ onNavigate }: ServicesPageProps) {
  return (
    <div>
      <section
        className="py-20"
        style={{ background: `linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end))`, color: 'var(--text-inverse)' }}
      >
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Services</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              ZARMS Tec offers a balanced service portfolio that addresses both infrastructure and digital business needs.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20" style={{ background: 'var(--page-background)' }}>
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Two Strong Service Verticals. One Trusted Company.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="rounded-2xl overflow-hidden cursor-pointer group"
              style={{ background: 'var(--card-background)', boxShadow: 'var(--shadow-lg)' }}
              onClick={() => onNavigate('construction')}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80"
                  alt="Construction Services"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(30, 58, 138, 0.8), transparent)' }} />
                <div className="absolute bottom-4 left-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    <Building2 className="w-8 h-8" style={{ color: 'var(--brand-primary)' }} />
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>Construction Services</h3>
                <p className="mb-6 text-left md:text-justify" style={{ color: 'var(--text-secondary)' }}>
                  We provide dependable construction support for clients seeking quality execution, planning, renovation, structural support, and project coordination.
                </p>
                <div className="flex items-center gap-2 font-semibold group-hover:gap-4 transition-all cursor-pointer" style={{ color: 'var(--brand-primary)' }}>
                  Learn More <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="rounded-2xl overflow-hidden cursor-pointer group"
              style={{ background: 'var(--card-background)', boxShadow: 'var(--shadow-lg)' }}
              onClick={() => onNavigate('software')}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
                  alt="Software Solutions"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8, 145, 178, 0.8), transparent)' }} />
                <div className="absolute bottom-4 left-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    <Code2 className="w-8 h-8" style={{ color: 'var(--brand-secondary)' }} />
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>Software Solutions</h3>
                <p className="mb-6 text-left md:text-justify" style={{ color: 'var(--text-secondary)' }}>
                  We deliver software and technology services that help businesses improve efficiency, customer reach, and digital operations.
                </p>
                <div className="flex items-center gap-2 font-semibold group-hover:gap-4 transition-all cursor-pointer" style={{ color: 'var(--brand-secondary)' }}>
                  Learn More <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: 'var(--section-bg-light)' }}>
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              What You Can Expect From Our Services
            </h2>
            <ul className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="text-2xl" style={{ color: 'var(--brand-primary)' }}>•</span>
                <span>Customized solutions based on project needs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl" style={{ color: 'var(--brand-primary)' }}>•</span>
                <span>Practical guidance and clear communication</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl" style={{ color: 'var(--brand-primary)' }}>•</span>
                <span>Focus on quality and timely execution</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl" style={{ color: 'var(--brand-primary)' }}>•</span>
                <span>Professional handling from start to finish</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl" style={{ color: 'var(--brand-primary)' }}>•</span>
                <span>Support that balances cost, value, and performance</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="py-20" style={{ background: 'var(--section-bg-dark)', color: 'var(--text-inverse)' }}>
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <h2 className="text-4xl font-bold mb-6">Need the Right Service for Your Requirement?</h2>
            <button
              onClick={() => onNavigate('contact')}
              className="px-8 py-4 rounded-lg font-semibold transition-transform hover:scale-105 cursor-pointer"
              style={{ background: 'var(--brand-accent)', color: 'var(--text-inverse)' }}
            >
              Contact Us Today
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}