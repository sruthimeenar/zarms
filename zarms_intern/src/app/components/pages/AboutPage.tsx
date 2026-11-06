import { motion } from 'motion/react';
import { Target, Eye, Heart, Shield, Users2, TrendingUp } from 'lucide-react';

export function AboutPage() {
  const values = [
    { icon: Shield, title: 'Integrity', description: 'Honest and transparent in all our dealings' },
    { icon: Target, title: 'Quality', description: 'Excellence in every project we undertake' },
    { icon: Heart, title: 'Reliability', description: 'Dependable service you can count on' },
    { icon: TrendingUp, title: 'Innovation', description: 'Modern solutions for evolving needs' },
    { icon: Users2, title: 'Client Focus', description: 'Your success is our priority' },
  ];

  return (
    <div>
      <section
        className="py-20"
        style={{ background: `linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end))`, color: 'var(--text-inverse)' }}
      >
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About ZARMS Tec</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              A modern service company delivering trusted construction services and practical software solutions with a strong commitment to quality, professionalism, and client satisfaction.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20" style={{ background: 'var(--page-background)' }}>
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>Who We Are</h2>
              <div className="space-y-4" style={{ color: 'var(--text-secondary)' }}>
                <p className="text-lg text-left md:text-justify">
                  ZARMS Tec is a professionally driven company serving clients through two key service areas: construction services and software solutions. We are committed to helping individuals, businesses, and project owners achieve their goals through dependable service, thoughtful execution, and a strong focus on quality outcomes.
                </p>
                <p className="text-lg text-left md:text-justify">
                  Our construction division supports built-environment needs with practical planning and execution, while our software solutions division helps businesses move toward efficient digital systems and modern technology-driven operations. This dual capability gives us a distinctive identity and enables us to serve a wider range of client requirements.
                </p>
                <p className="text-lg text-left md:text-justify">
                  At the core of our company is a simple belief: every project deserves attention, accountability, and a solution that truly fits the client's needs.
                </p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
                alt="Professional team collaboration"
                className="rounded-2xl shadow-lg w-full h-[500px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: 'var(--section-bg-light)' }}>
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-primary)' }}>
                  <Target className="w-6 h-6" style={{ color: 'var(--text-inverse)' }} />
                </div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Our Mission</h2>
              </div>
              <p className="text-lg text-left md:text-justify" style={{ color: 'var(--text-secondary)' }}>
                Our mission is to deliver dependable construction and software services that create real value for our clients. We aim to combine quality, integrity, and innovation in every project, ensuring that our work supports both immediate goals and long-term success.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-secondary)' }}>
                  <Eye className="w-6 h-6" style={{ color: 'var(--text-inverse)' }} />
                </div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Our Vision</h2>
              </div>
              <p className="text-lg text-left md:text-justify" style={{ color: 'var(--text-secondary)' }}>
                Our vision is to become a trusted name in both construction services and software solutions by consistently delivering work that is practical, high-quality, and future-ready. We aspire to grow as a company known for reliability, innovation, and strong service relationships.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: 'var(--page-background)' }}>
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Our Core Values</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="p-6 rounded-xl text-center"
                  style={{ background: 'var(--section-bg-light)' }}
                >
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: '#1e3a8a' }}
                  >
                    <Icon className="w-8 h-8" style={{ color: 'var(--text-inverse)' }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{value.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: 'var(--section-bg-dark)', color: 'var(--text-inverse)' }}>
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-6 text-center">Our Journey</h2>
            <div className="space-y-4 text-lg opacity-90">
              <p className="text-left md:text-justify">
                ZARMS Tec was established with the goal of providing practical, dependable, and quality-driven services across construction and technology. The company was built around the idea that clients often need partners who can solve problems with both technical understanding and execution discipline.
              </p>
              <p className="text-left md:text-justify">
                As the company continues to grow, our focus remains on building a strong reputation through service consistency, project responsibility, and the ability to adapt to changing client needs. Our journey is driven by a desire to create lasting value in every engagement.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}