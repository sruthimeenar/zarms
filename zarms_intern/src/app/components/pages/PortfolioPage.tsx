import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { Building2, Code2, Filter } from 'lucide-react';
import { Select } from 'antd';
import { getPortfolioItems } from '../../../data/portfolio';
import { PortfolioItem } from '../../../data/types';

export function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [allProjects, setAllProjects] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    let active = true;
    getPortfolioItems()
      .then((items) => {
        if (active) setAllProjects(items);
      })
      .catch(() => {
        if (active) setAllProjects([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'Construction Services', label: 'Construction Projects' },
    { id: 'Software Solutions', label: 'Software Solutions' },
  ];

  const filteredProjects = activeFilter === 'all'
    ? allProjects
    : allProjects.filter(p => p.serviceType === activeFilter);

  return (
    <div>
      <section
        className="py-20"
        style={{ background: `linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end))`, color: 'var(--text-inverse)' }}
      >
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Portfolio</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Explore selected works from ZARMS Tec across our construction and software service divisions. Our portfolio reflects our commitment to practical results, quality execution, and client-focused delivery.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8" style={{ background: 'var(--page-background)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container mx-auto px-6">
          <div className="flex justify-end items-center gap-3">
            <Filter className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            <Select
              value={activeFilter}
              onChange={(value) => setActiveFilter(value)}
              style={{ width: 200 }}
              options={filters.map(filter => ({
                value: filter.id,
                label: filter.label,
              }))}
            />
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: 'var(--page-background)' }}>
        <div className="container mx-auto px-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                No projects found. Check back soon for updates!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => {
                const IconComponent = Icons[project.icon as keyof typeof Icons] as any;
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="rounded-xl overflow-hidden"
                    style={{ background: 'var(--card-background)', boxShadow: 'var(--shadow-lg)' }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={project.images[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80'}
                        alt={project.projectName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: project.serviceType === 'Construction Services'
                            ? `linear-gradient(135deg, rgba(30, 58, 138, 0.7), rgba(217, 119, 6, 0.7))`
                            : `linear-gradient(135deg, rgba(8, 145, 178, 0.7), rgba(6, 182, 212, 0.7))`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {IconComponent ? (
                          <IconComponent className="w-16 h-16" style={{ color: 'var(--text-inverse)' }} />
                        ) : project.serviceType === 'Construction Services' ? (
                          <Building2 className="w-16 h-16" style={{ color: 'var(--text-inverse)' }} />
                        ) : (
                          <Code2 className="w-16 h-16" style={{ color: 'var(--text-inverse)' }} />
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="px-3 py-1 rounded-full text-sm"
                          style={{ background: 'var(--section-bg-light)', color: 'var(--text-secondary)' }}
                        >
                          {project.serviceType === 'Construction Services' ? 'Construction' : 'Software'}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {project.projectName}
                      </h3>
                      {project.subtitle && (
                        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                          {project.subtitle}
                        </p>
                      )}
                      <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                        {project.shortSummary || project.description}
                      </p>
                      {project.projectLocation && (
                        <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                            Location: {project.projectLocation}
                          </p>
                        </div>
                      )}
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {project.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded text-xs"
                              style={{ background: 'var(--section-bg-light)', color: 'var(--text-secondary)' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-20" style={{ background: 'var(--section-bg-dark)', color: 'var(--text-inverse)' }}>
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <h2 className="text-4xl font-bold mb-8">Want to Discuss a Similar Project?</h2>
            <a
              href="https://wa.me/919994123797"
              className="inline-block px-8 py-4 rounded-lg font-semibold transition-transform hover:scale-105 cursor-pointer"
              style={{ background: 'var(--brand-accent)', color: 'var(--text-inverse)' }}
            >
              Contact Us Today
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
