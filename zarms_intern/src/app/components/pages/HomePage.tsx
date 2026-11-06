import { motion } from 'motion/react';
import { Building2, Code2, Users, Target, Zap, Shield, ArrowRight, CheckCircle2, TrendingUp, Award } from 'lucide-react';
import { VideoHeroBanner } from '../VideoHeroBanner';
import hookImg from '../../../imports/hook.png';
import systemImg from '../../../imports/system.png';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div>
      <VideoHeroBanner onNavigate={onNavigate} />
      <WelcomeSection />
      <ServicesSection onNavigate={onNavigate} />
      <WhyChooseUs />
      <ProcessSection />
      <CTASection onNavigate={onNavigate} />
    </div>
  );
}



function WelcomeSection() {
  return (
    <section className="py-20" style={{ background: 'var(--page-background)' }}>
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-bold mb-6 text-left text-[36px]" style={{ color: 'var(--text-primary)' }}>
              Your Trusted Partner in Construction and Technology
            </h2>
            <p className="text-lg mb-6 text-left md:text-justify" style={{ color: 'var(--text-secondary)' }}>
              At ZARMS Tec, we believe that strong results come from strong planning, skilled execution, and clear communication. Our company serves clients who need dependable construction support as well as businesses looking for practical and scalable software solutions.
            </p>
            <p className="text-lg text-left md:text-justify" style={{ color: 'var(--text-secondary)' }}>
              We are focused on delivering solutions that are functional, reliable, and aligned with real project goals. From building spaces that last to digital systems that improve efficiency, our work is guided by professionalism, quality standards, and client satisfaction.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
              alt="Professional team collaboration and planning"
              className="rounded-2xl shadow-lg w-full h-[400px] object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ onNavigate }: { onNavigate: (page: string) => void }) {
  const services = [
    {
      icon: Building2,
      title: 'Construction Services',
      description: 'We provide construction-related solutions designed for quality workmanship, practical planning, and efficient execution.',
      points: [
        'Building and civil works',
        'Renovation and remodeling',
        'Interior and finishing support',
        'Site coordination and project execution',
        'Custom client-focused solutions',
      ],
      page: 'construction',
    },
    {
      icon: Code2,
      title: 'Software Solutions',
      description: 'We deliver software and IT services that support business growth, digital efficiency, and modern operational needs.',
      points: [
        'Custom software development',
        'Website and web application solutions',
        'Business process digitization',
        'Technical support and maintenance',
        'Scalable technology services',
      ],
      page: 'software',
    },
  ];

  return (
    <section className="relative py-20" style={{ background: 'var(--section-bg-light)' }}>
      {/* Hook Image */}
      <img
        src={hookImg}
        alt=""
        className="absolute pointer-events-none h-8 sm:h-10 md:h-12 lg:h-14 w-auto"
        style={{ left: '4%', top: '10px' }}
      />

      {/* System Image */}
      <img
        src={systemImg}
        alt=""
        className="absolute pointer-events-none h-12 sm:h-16 md:h-20 lg:h-24 w-auto"
        style={{ right: '4%', bottom: '10px' }}
      />

      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            What We Do
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            const serviceImages = [
              'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
              'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80'
            ];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
                style={{
                  background: 'var(--card-background)',
                  boxShadow: 'var(--shadow-lg)',
                  borderRadius: 'var(--radius-card)',
                }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={serviceImages[index]}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110 cursor-pointer"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${index === 0 ? 'var(--brand-primary)' : 'var(--brand-secondary)'}, transparent)`, opacity: 0.7 }}
                  />
                  <div className="absolute top-4 left-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                    >
                      <Icon className="w-8 h-8" style={{ color: index === 0 ? 'var(--brand-primary)' : 'var(--brand-secondary)' }} />
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    {service.title}
                  </h3>
                  <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {service.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onNavigate(service.page)}
                    className="flex items-center gap-2 font-semibold group"
                    style={{ color: 'var(--brand-primary)' }}
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 cursor-pointer" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const reasons = [
    {
      icon: Zap,
      title: 'Dual Expertise Under One Brand',
      description: 'Construction and software services from a single trusted partner.',
    },
    {
      icon: Shield,
      title: 'Commitment to Quality',
      description: 'Every project is executed with attention to detail and high standards.',
    },
    {
      icon: Users,
      title: 'Client-Centric Communication',
      description: 'Clear, transparent communication throughout the project lifecycle.',
    },
    {
      icon: Target,
      title: 'Tailored Solutions',
      description: 'Custom approaches designed to meet your specific needs.',
    },
    {
      icon: TrendingUp,
      title: 'Long-Term Value',
      description: 'Solutions built to deliver lasting results and future growth.',
    },
    {
      icon: Award,
      title: 'Professional Excellence',
      description: 'Experienced team dedicated to delivering exceptional results.',
    },
  ];

  return (
    <section className="py-20" style={{ background: 'var(--page-background)' }}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Why Clients Choose ZARMS Tec
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl text-center"
                style={{ background: 'var(--section-bg-light)' }}
              >
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                  style={{ background: '#1e3a8a' }}
                >
                  <Icon className="w-8 h-8" style={{ color: 'var(--text-inverse)' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {reason.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>{reason.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    { title: 'Consultation', description: 'Understanding your requirements and project goals' },
    { title: 'Planning', description: 'Developing a comprehensive execution strategy' },
    { title: 'Execution', description: 'Professional implementation with quality focus' },
    { title: 'Delivery & Support', description: 'Completion and ongoing assistance' },
  ];

  return (
    <section className="py-20" style={{ background: 'var(--section-bg-dark)', color: 'var(--text-inverse)' }}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How We Work</h2>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{ background: 'var(--brand-accent)' }}
                >
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="opacity-80">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <section className="py-20" style={{ background: 'var(--page-background)' }}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Let's Build Your Next Project Together
          </h2>
          <p className="text-xl mb-12" style={{ color: 'var(--text-secondary)' }}>
            Whether you need construction expertise or software support, ZARMS Tec is ready to help you move forward with confidence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('contact')}
              className="px-8 py-4 rounded-lg font-semibold transition-transform hover:scale-105 cursor-pointer"
              style={{ background: 'var(--brand-primary)', color: 'var(--text-inverse)' }}
            >
              Contact Us
            </button>
            <a
              href="https://wa.me/919994123797"
              className="px-8 py-4 rounded-lg font-semibold transition-transform hover:scale-105 cursor-pointer"
              style={{ background: '#25D366', color: 'white' }}
            >
              WhatsApp Enquiry
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}