import { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Github,
  Link,
  Globe,
  MessageCircle,
} from 'lucide-react';
import buildingImg from '../../imports/building.png';
import excavatorImg from '../../imports/excavator-right.png';
import demolishedImg from '../../imports/demolished.png';
import building2Img from '../../imports/architecture.png';
import { getPortfolioItems } from '../../data/portfolio';
import { getContactSettings } from '../../data/contact';

interface FooterProps {
  onNavigate: (page: string) => void;
}

interface ContactData {
  address: string;
  constructionPhone: string;
  constructionEmail: string;
  softwarePhone: string;
  softwareEmail: string;
}

interface SocialLink {
  platform: string;
  url: string;
}

const DEFAULT_CONTACT: ContactData = {
  address: '30/1, Medawalkkam 2nd Street, Kilpauk, Chennai-10',
  constructionPhone: '9840344369',
  constructionEmail: 'narbhavi555@gmail.com',
  softwarePhone: '9994123797',
  softwareEmail: 'rajesh.arms916@gmail.com',
};

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  // Social Media
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,

  // Professional
  linkedin: Linkedin,
  github: Github,

  // Communication
  email: Mail,
  phone: Phone,
  message: MessageCircle,

  // General
  website: Globe,
  link: Link,
};

export function Footer({ onNavigate }: FooterProps) {
  const [excavatorPosition, setExcavatorPosition] = useState(96); // Start at 96% (right side)
  const [buildingState, setBuildingState] = useState(0); // 0: building, 1: demolished, 2: building2, 3: demolished
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [hasPortfolioItems, setHasPortfolioItems] = useState(true);
  const [contact, setContact] = useState<ContactData>(DEFAULT_CONTACT);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoadingContact, setIsLoadingContact] = useState(true);
  const animationRef = useRef<number | null>(null);
  const excavatorRef = useRef<HTMLImageElement>(null);

  const buildingImages = [buildingImg, demolishedImg, building2Img, demolishedImg];
  const buildingPosition = 4; // Building is at 4% from left

  useEffect(() => {
    if (isDragging) return; // Don't auto-animate while dragging

    const animate = () => {
      setExcavatorPosition((prev) => {
        const newPos = prev - 0.05; // Move left

        // Check if excavator reached building (collision detection)
        if (newPos <= buildingPosition + 2 && prev > buildingPosition + 2) {
          // Collision detected! Change building state
          setBuildingState((state) => (state + 1) % 4);
        }

        // Reset to right side when it goes too far left
        if (newPos < -5) {
          return 96;
        }

        return newPos;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!excavatorRef.current) return;
    setIsDragging(true);
    const rect = excavatorRef.current.getBoundingClientRect();
    setDragOffset(e.clientX - rect.left);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !excavatorRef.current) return;

    const parentWidth = window.innerWidth;
    const newPosition = ((e.clientX - dragOffset) / parentWidth) * 100;

    // Constrain between 0% and 100%
    const constrainedPosition = Math.max(0, Math.min(100, newPosition));
    setExcavatorPosition(constrainedPosition);

    // Check collision while dragging
    if (Math.abs(constrainedPosition - buildingPosition) < 3) {
      setBuildingState((state) => (state + 1) % 4);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    let active = true;

    // Fetch portfolio items
    getPortfolioItems()
      .then((items) => {
        if (active) setHasPortfolioItems(items.length > 0);
      })
      .catch(() => {
        if (active) setHasPortfolioItems(true);
      });

    // Fetch contact settings from database, fallback to defaults
    getContactSettings()
      .then((settings) => {
        if (!active) return;
        setContact({
          address: settings.address || DEFAULT_CONTACT.address,
          constructionPhone: settings.constructionPhone || DEFAULT_CONTACT.constructionPhone,
          constructionEmail: settings.constructionEmail || DEFAULT_CONTACT.constructionEmail,
          softwarePhone: settings.softwarePhone || DEFAULT_CONTACT.softwarePhone,
          softwareEmail: settings.softwareEmail || DEFAULT_CONTACT.softwareEmail,
        });

        // Set social links from database
        if (settings.socialLinks && Array.isArray(settings.socialLinks) && settings.socialLinks.length > 0) {
          setSocialLinks(settings.socialLinks);
        } else {
          setSocialLinks([]);
        }
      })
      .catch((error) => {
        console.error('Failed to load contact settings from backend, using defaults:', error);
        // Keep DEFAULT_CONTACT values on error
        setSocialLinks([]);
      })
      .finally(() => {
        if (active) setIsLoadingContact(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <footer className="relative" style={{ background: 'var(--footer-bg)', color: 'var(--text-inverse)' }}>
      {/* Decorative Icons at Top - Interactive */}
      <img
        src={buildingImages[buildingState]}
        alt=""
        className="absolute top-0 pointer-events-none h-10 sm:h-12 md:h-16 lg:h-18 xl:h-20 w-auto transition-all duration-300"
        style={{ left: `${buildingPosition}%`, transform: 'translateY(-100%)' }}
      />
      <img
        ref={excavatorRef}
        src={excavatorImg}
        alt=""
        className="absolute top-0 h-10 sm:h-12 md:h-16 lg:h-18 xl:h-20 w-auto cursor-grab active:cursor-grabbing transition-transform"
        style={{
          left: `${excavatorPosition}%`,
          transform: 'translateY(-100%)',
          userSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
        draggable={false}
      />

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="mb-4">
              <img src="/images/logo.png" alt="ZARMS Tec" className="h-16 w-auto" />
            </div>
            <p className="opacity-80 mb-6">
              Building dependable spaces and delivering practical software solutions for modern client needs.
            </p>
            {/* Social Links - Only show if they exist in database */}
            {socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((social, i) => {
                  const Icon = SOCIAL_ICONS[social.platform.toLowerCase()];
                  if (!Icon || !social.url) return null;

                  return (
                    <a
                      key={i}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg transition-all hover:scale-110 cursor-pointer"
                      style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                      aria-label={social.platform}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              {(() => {
                const allLinks = [
                  { label: 'Home', page: 'home' },
                  { label: 'About Us', page: 'about' },
                  { label: 'Construction Services', page: 'construction' },
                  { label: 'Software Solutions', page: 'software' },
                  { label: 'Portfolio', page: 'portfolio' },
                  { label: 'Contact Us', page: 'contact' },
                  { label: 'Admin Page', page: 'admin' },
                ];

                // Filter out Portfolio if no items exist
                const links = hasPortfolioItems
                  ? allLinks
                  : allLinks.filter(link => link.page !== 'portfolio');

                return links.map(link => (
                  <button
                    key={link.page}
                    onClick={() => onNavigate(link.page)}
                    className="block opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {link.label}
                  </button>
                ));
              })()}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Services</h3>
            <div className="space-y-2">
              {[
                { label: 'Construction Services', page: 'construction' },
                { label: 'Software Solutions', page: 'software' },
                { label: 'Building Construction', page: 'construction' },
                { label: 'Renovation Services', page: 'construction' },
                { label: 'Web Development', page: 'software' },
                { label: 'Custom Software', page: 'software' },
              ].map((service, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(service.page)}
                  className="block opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {service.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Contact Info</h3>
            <div className="space-y-4 opacity-80">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>{isLoadingContact ? 'Loading...' : contact.address}</div>
              </div>
              <div>
                <div className="font-semibold mb-2">Construction Services:</div>
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <a href={`tel:${contact.constructionPhone}`} className="hover:opacity-100 cursor-pointer">
                    {isLoadingContact ? 'Loading...' : contact.constructionPhone}
                  </a>
                </div>
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <a href={`mailto:${contact.constructionEmail}`} className="hover:opacity-100 cursor-pointer">
                    {isLoadingContact ? 'Loading...' : contact.constructionEmail}
                  </a>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-2">Software Solutions:</div>
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <a href={`tel:${contact.softwarePhone}`} className="hover:opacity-100 cursor-pointer">
                    {isLoadingContact ? 'Loading...' : contact.softwarePhone}
                  </a>
                </div>
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <a href={`mailto:${contact.softwareEmail}`} className="hover:opacity-100 cursor-pointer">
                    {isLoadingContact ? 'Loading...' : contact.softwareEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="container mx-auto px-6 py-4 opacity-80">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 text-center md:text-left">
            <p>© 2026 ZARMS Tec. All Rights Reserved.</p>
            <p>
              Designed and developed by{' '}
              <a
                href="https://amasqis.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: 'var(--brand-accent)' }}
              >
                amasQIS.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
