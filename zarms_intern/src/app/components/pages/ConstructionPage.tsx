import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Hammer, Home, Paintbrush, Wrench, Building, Phone, Mail } from 'lucide-react';
import { getGalleryItems } from '../../../data/gallery';
import { GalleryItem } from '../../../data/types';
import excavatorLeftImg from '../../../imports/excavator-left.png';

export function ConstructionPage() {
  const [allGalleryImages, setAllGalleryImages] = useState<GalleryItem[]>([]);

  useEffect(() => {
    let active = true;
    getGalleryItems('Construction Services')
      .then((items) => {
        if (active) setAllGalleryImages(items);
      })
      .catch(() => {
        if (active) setAllGalleryImages([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const services = [
    {
      icon: Building,
      title: 'Building Construction Support',
      description: 'Comprehensive construction services for residential and commercial projects',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80'
    },
    {
      icon: Home,
      title: 'Renovation and Remodeling',
      description: 'Transform existing spaces with quality renovation work',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80'
    },
    {
      icon: Paintbrush,
      title: 'Interior and Finishing Works',
      description: 'Professional interior finishing and detailing services',
      image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=600&q=80'
    },
    {
      icon: Hammer,
      title: 'Civil and Site Work Assistance',
      description: 'Complete civil engineering and site development support',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80'
    },
    {
      icon: Wrench,
      title: 'Project Coordination',
      description: 'Expert project management and coordination services',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80'
    },
  ];

  const galleryImages = allGalleryImages.slice(0, 6); // Show first 6 images

  return (
    <div>
      <section
        className="relative py-20 overflow-hidden"
        style={{ background: `linear-gradient(135deg, var(--brand-primary), var(--brand-accent))`, color: 'var(--text-inverse)' }}
      >
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80"
            alt="Construction site background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.85), rgba(217, 119, 6, 0.85))' }} />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <div className="inline-block px-4 py-2 rounded-lg mb-6" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                <span className="font-semibold">Construction Services</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Construction Services That Prioritize Quality, Practicality, and Trust
            </h1>
            <p className="text-xl mb-8 opacity-90">
              ZARMS Tec offers construction services designed to help clients turn plans into dependable physical spaces. We focus on practical execution, responsible coordination, and service quality that aligns with project goals.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="tel:9840344369"
                className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
                style={{ background: 'var(--text-inverse)', color: 'var(--brand-primary)' }}
              >
                <Phone className="w-5 h-5" />
                Call: 9840344369
              </a>
              <a
                href="mailto:narbhavi555@gmail.com"
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
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Our Construction Service Areas</h2>
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
                      style={{ background: 'var(--brand-primary)' }}
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
        {/* Excavator Image */}
        <img
          src={excavatorLeftImg}
          alt=""
          className="absolute pointer-events-none h-12 sm:h-16 md:h-20 lg:h-24 w-auto opacity-60"
          style={{ left: '4%', top: '10px' }}
        />

        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
              How We Approach Construction Projects
            </h2>
            <div className="space-y-4" style={{ color: 'var(--text-secondary)' }}>
              <p className="text-left md:text-justify">
                Every construction requirement is different, which is why we begin by understanding project objectives, site conditions, budget considerations, and client expectations. Our role is to bring together planning, coordination, and service execution in a way that supports clear progress and dependable outcomes.
              </p>
              <p className="text-left md:text-justify">
                We value communication throughout the process and aim to maintain alignment between project scope and practical delivery. This approach helps us reduce confusion, improve efficiency, and ensure that the completed work reflects client requirements.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {allGalleryImages.length > 0 && (
        <section className="py-20" style={{ background: 'var(--page-background)' }}>
          <div className="container mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Construction Gallery</h2>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Explore our recent construction and renovation projects</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {galleryImages.map((item, index) => (
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
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                    />
                  </div>
                  <div
                    className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex items-end cursor-pointer"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
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
            <h2 className="text-4xl font-bold mb-8">Planning a Construction Project? Let's Talk.</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:9840344369"
                className="px-8 py-4 rounded-lg font-semibold transition-transform hover:scale-105 cursor-pointer"
                style={{ background: 'var(--brand-accent)', color: 'var(--text-inverse)' }}
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
