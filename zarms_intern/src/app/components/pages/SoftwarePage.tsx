import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Code, Database, Smartphone, Settings, Monitor, Phone, Mail } from 'lucide-react';
import { getGalleryItems } from '../../../data/gallery';
import { GalleryItem } from '../../../data/types';
import computerImg from '../../../imports/computer.png';

export function SoftwarePage() {
  const [allPortfolioItems, setAllPortfolioItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    let active = true;
    getGalleryItems('Software Solutions')
      .then((items) => {
        if (active) setAllPortfolioItems(items);
      })
      .catch(() => {
        if (active) setAllPortfolioItems([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const services = [
    {
      icon: Globe,
      title: 'Website Design and Development',
      description: 'Modern, responsive websites tailored to your business needs',
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80'
    },
    {
      icon: Code,
      title: 'Custom Software Development',
      description: 'Bespoke software solutions built for your unique requirements',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80'
    },
    {
      icon: Monitor,
      title: 'Web Application Development',
      description: 'Powerful web applications for business operations',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80'
    },
    {
      icon: Database,
      title: 'Business Process Digitization',
      description: 'Transform manual processes into efficient digital systems',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80'
    },
    {
      icon: Settings,
      title: 'Technical Support and Maintenance',
      description: 'Ongoing technical assistance and system maintenance',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80'
    },
    {
      icon: Smartphone,
      title: 'UI / UX Improvement Support',
      description: 'Enhanced user experience design and optimization',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80'
    },
  ];

  const portfolioItems = allPortfolioItems.slice(0, 6); // Show first 6 images

  return (
    <div>
      <section
        className="relative py-20 overflow-hidden"
        style={{ background: `linear-gradient(135deg, var(--brand-secondary), var(--brand-highlight))`, color: 'var(--text-inverse)' }}
      >
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
            alt="Modern software dashboard"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.9), rgba(6, 182, 212, 0.9))' }} />

        <div className="absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl opacity-30" style={{ background: 'var(--brand-accent)' }} />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: 'var(--brand-primary)' }} />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <div className="inline-block px-4 py-2 rounded-lg mb-6" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                <span className="font-semibold">Software Solutions</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Software Solutions Designed for Business Growth and Digital Efficiency
            </h1>
            <p className="text-xl mb-8 opacity-90">
              ZARMS Tec provides software and IT solutions that help businesses improve operations, strengthen digital presence, and adopt practical technology systems.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="tel:9994123797"
                className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
                style={{ background: 'var(--text-inverse)', color: 'var(--brand-secondary)' }}
              >
                <Phone className="w-5 h-5" />
                Call: 9994123797
              </a>
              <a
                href="mailto:rajesh.arms916@gmail.com"
                className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
                style={{ background: 'rgba(255, 255, 255, 0.2)', border: '2px solid var(--text-inverse)' }}
              >
                <Mail className="w-5 h-5" />
                Email Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20" style={{ background: 'var(--page-background)' }}>
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Our Software Service Areas</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="rounded-xl overflow-hidden"
                  style={{ background: 'var(--card-background)', boxShadow: 'var(--shadow-md)' }}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110 cursor-pointer"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--card-background), transparent)' }} />
                  </div>
                  <div className="p-6 -mt-8 relative">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ background: 'var(--brand-secondary)' }}
                    >
                      <Icon className="w-6 h-6" style={{ color: 'var(--text-inverse)' }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{service.title}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{service.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-20" style={{ background: 'var(--section-bg-light)' }}>
        {/* Computer Image */}
        <img
          src={computerImg}
          alt=""
          className="absolute pointer-events-none h-12 sm:h-16 md:h-20 lg:h-24 w-auto opacity-60"
          style={{ left: '4%', bottom: '10px' }}
        />

        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
                Why Choose ZARMS Tec for Software Solutions
              </h2>
              <ul className="space-y-3 text-left" style={{ color: 'var(--text-secondary)' }}>
                <li className="flex items-start gap-2">
                  <span className="text-2xl" style={{ color: 'var(--brand-secondary)' }}>•</span>
                  <span>Practical and business-aligned technology approach</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl" style={{ color: 'var(--brand-secondary)' }}>•</span>
                  <span>Focus on usability and performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl" style={{ color: 'var(--brand-secondary)' }}>•</span>
                  <span>Modern web and digital solution capability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl" style={{ color: 'var(--brand-secondary)' }}>•</span>
                  <span>Clear communication and client collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl" style={{ color: 'var(--brand-secondary)' }}>•</span>
                  <span>Scalable support for future growth</span>
                </li>
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
                Our IT Project Process
              </h2>
              <div className="space-y-4">
                {['Discovery', 'Planning', 'Design & Development', 'Testing & Deployment', 'Support & Improvement'].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                      style={{ background: 'var(--brand-secondary)', color: 'var(--text-inverse)' }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 p-3 rounded-lg text-left" style={{ background: 'var(--card-background)' }}>
                      <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{step}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {allPortfolioItems.length > 0 && (
        <section className="py-20" style={{ background: 'var(--page-background)' }}>
          <div className="container mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Software Solutions Gallery</h2>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Explore our recent digital projects and software solutions</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {portfolioItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative rounded-xl overflow-hidden cursor-pointer group"
                  style={{ boxShadow: 'var(--shadow-md)' }}
                >
                  <div className="aspect-[16/10] overflow-hidden" style={{ background: 'var(--section-bg-light)' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                    />
                  </div>
                  <div
                    className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex items-end cursor-pointer"
                    style={{ background: 'linear-gradient(to top, rgba(8, 145, 178, 0.9), transparent)' }}
                  >
                    <div className="p-6 text-white">
                      {item.subtitle && (
                        <p className="text-sm font-semibold mb-1 opacity-90">{item.subtitle}</p>
                      )}
                      <h3 className="text-lg font-bold">{item.title}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20" style={{ background: 'var(--section-bg-dark)', color: 'var(--text-inverse)' }}>
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8">Need a Smart Digital Solution for Your Business?</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:9994123797"
                className="px-8 py-4 rounded-lg font-semibold transition-transform hover:scale-105 cursor-pointer"
                style={{ background: 'var(--brand-secondary)', color: 'var(--text-inverse)' }}
              >
                Call Now
              </a>
              <a
                href="https://wa.me/919994123797"
                className="px-8 py-4 rounded-lg font-semibold transition-transform hover:scale-105 cursor-pointer"
                style={{ background: '#25D366', color: 'white' }}
              >
                WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
