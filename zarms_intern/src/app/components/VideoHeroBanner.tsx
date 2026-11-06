import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface BannerState {
  id: string;
  category: 'common' | 'construction' | 'software';
  title: string;
  subtitle: string;
  buttons: {
    label: string;
    action: () => void;
    variant: 'primary' | 'secondary' | 'whatsapp';
  }[];
  videoUrl: string; // Will be video URL in production
  posterUrl: string; // Fallback image
  overlayColor: string;
}

interface VideoHeroBannerProps {
  onNavigate: (page: string) => void;
}

export function VideoHeroBanner({ onNavigate }: VideoHeroBannerProps) {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const bannerStates: BannerState[] = [
    {
      id: 'common',
      category: 'common',
      title: 'Building Better Spaces. Creating Smarter Digital Solutions.',
      subtitle: 'ZARMS Tec combines dependable construction services and practical software solutions under one trusted brand, helping clients move from idea to execution with confidence.',
      buttons: [
        { label: 'Explore Services', action: () => onNavigate('services'), variant: 'primary' },
        { label: 'View Portfolio', action: () => onNavigate('portfolio'), variant: 'secondary' },
        { label: 'Contact Us', action: () => onNavigate('contact'), variant: 'secondary' },
      ],
      videoUrl: 'https://cdn.coverr.co/videos/coverr-modern-office-workspace-with-business-planning-4297/1080p.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
      overlayColor: 'linear-gradient(135deg, rgba(30, 58, 138, 0.75), rgba(8, 145, 178, 0.75))',
    },
    {
      id: 'construction',
      category: 'construction',
      title: 'Construction Services That Prioritize Quality, Practicality, and Trust.',
      subtitle: 'From building support and renovation to interiors, civil work, and project coordination, ZARMS Tec delivers dependable construction solutions with a focus on quality execution and lasting value.',
      buttons: [
        { label: 'Construction Services', action: () => onNavigate('construction'), variant: 'primary' },
        { label: 'Request Consultation', action: () => onNavigate('contact'), variant: 'secondary' },
      ],
      videoUrl: 'https://cdn.coverr.co/videos/coverr-construction-site-aerial-view-9796/1080p.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&q=80',
      overlayColor: 'linear-gradient(135deg, rgba(31, 41, 55, 0.75), rgba(146, 64, 14, 0.75))',
    },
    {
      id: 'software',
      category: 'software',
      title: 'Software Solutions Designed for Business Growth and Digital Efficiency.',
      subtitle: 'ZARMS Tec helps businesses strengthen digital presence, improve workflows, and build scalable technology solutions through websites, applications, and practical software systems.',
      buttons: [
        { label: 'Software Solutions', action: () => onNavigate('software'), variant: 'primary' },
        { label: 'Request IT Consultation', action: () => onNavigate('contact'), variant: 'secondary' },
      ],
      videoUrl: 'https://cdn.coverr.co/videos/coverr-typing-code-on-laptop-6814/1080p.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80',
      overlayColor: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(6, 182, 212, 0.75))',
    },
  ];

  const currentBanner = bannerStates[currentIndex];

  useEffect(() => {
    if (!theme.heroAutoRotate || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = parseInt(theme.heroRotationInterval) || 4000;
    timerRef.current = setInterval(() => {
      handleNext();
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [theme.heroAutoRotate, theme.heroRotationInterval, isPaused, currentIndex]);

  const handleNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % bannerStates.length);
    setTimeout(() => setIsTransitioning(false), parseInt(theme.heroTransitionDuration) || 1000);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + bannerStates.length) % bannerStates.length);
    setTimeout(() => setIsTransitioning(false), parseInt(theme.heroTransitionDuration) || 1000);
  };

  const handleDotClick = (index: number) => {
    if (index !== currentIndex) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), parseInt(theme.heroTransitionDuration) || 1000);
    }
  };

  const getTransitionVariants = (category: string) => {
    if (!theme.heroEnableCategoryTransitions || theme.heroReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    switch (category) {
      case 'construction':
        // Modern grid-based structural reveal
        return {
          initial: { 
            clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)', 
            opacity: 0,
            scale: 0.95
          },
          animate: { 
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', 
            opacity: 1,
            scale: 1
          },
          exit: { 
            clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)', 
            opacity: 0,
            scale: 1.05
          },
        };
      case 'software':
        // Digital scan with blur and subtle zoom
        return {
          initial: { 
            scale: 1.1, 
            opacity: 0, 
            filter: 'blur(20px) brightness(1.2)',
            y: 20
          },
          animate: { 
            scale: 1, 
            opacity: 1, 
            filter: 'blur(0px) brightness(1)',
            y: 0
          },
          exit: { 
            scale: 0.95, 
            opacity: 0, 
            filter: 'blur(15px) brightness(0.8)',
            y: -20
          },
        };
      default:
        // Cinematic crossfade with depth
        return {
          initial: { 
            opacity: 0,
            scale: 1.05,
            filter: 'brightness(1.1)'
          },
          animate: { 
            opacity: 1,
            scale: 1,
            filter: 'brightness(1)'
          },
          exit: { 
            opacity: 0,
            scale: 0.95,
            filter: 'brightness(0.9)'
          },
        };
    }
  };

  const transitionDuration = (parseInt(theme.heroTransitionDuration) || 1000) / 1000;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: 'var(--hero-height)',
      }}
    >
      {/* Video Background Layer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          {...getTransitionVariants(currentBanner.category)}
          transition={{ 
            duration: transitionDuration, 
            ease: [0.43, 0.13, 0.23, 0.96] // Custom easing for premium feel
          }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 overflow-hidden">
            {/* Video Element */}
            <video
              autoPlay
              loop
              muted
              playsInline
              poster={currentBanner.posterUrl}
              className="w-full h-full object-cover"
              style={{ 
                filter: 'brightness(0.85) contrast(1.1)',
              }}
            >
              <source src={currentBanner.videoUrl} type="video/mp4" />
              {/* Fallback to poster image if video fails */}
              <img
                src={currentBanner.posterUrl}
                alt={currentBanner.title}
                className="w-full h-full object-cover"
              />
            </video>

            {/* Multi-layered Overlay for depth */}
            <div
              className="absolute inset-0"
              style={{
                background: currentBanner.overlayColor,
                opacity: theme.heroOverlayOpacity,
              }}
            />
            
            {/* Subtle vignette effect */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
              }}
            />
          </div>

          {/* Category-Specific Decorative Elements */}
          {currentBanner.category === 'construction' && (
            <motion.div 
              className="absolute inset-0 opacity-[0.08]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.08 }}
              transition={{ delay: transitionDuration * 0.5, duration: 0.5 }}
            >
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id={`grid-${currentBanner.id}`} width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#grid-${currentBanner.id})`} />
              </svg>
              {/* Blueprint-style corner markers */}
              <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-white opacity-50" />
              <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-white opacity-50" />
              <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-white opacity-50" />
              <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-white opacity-50" />
            </motion.div>
          )}

          {currentBanner.category === 'software' && (
            <motion.div 
              className="absolute inset-0 opacity-[0.06]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.06 }}
              transition={{ delay: transitionDuration * 0.5, duration: 0.5 }}
            >
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id={`dots-${currentBanner.id}`} width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="15" cy="15" r="2" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#dots-${currentBanner.id})`} />
              </svg>
              {/* Digital scan lines */}
              <div className="absolute inset-0">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                    style={{ 
                      top: `${20 + i * 15}%`,
                      left: 0,
                      right: 0,
                      opacity: 0.3
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ 
                      delay: transitionDuration * 0.6 + i * 0.1,
                      duration: 0.8,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {currentBanner.category === 'common' && (
            <motion.div 
              className="absolute inset-0 opacity-[0.05]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.05 }}
              transition={{ delay: transitionDuration * 0.5, duration: 0.5 }}
            >
              {/* Elegant floating accent shapes */}
              <div className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl" 
                style={{ background: 'var(--brand-accent)' }} 
              />
              <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl" 
                style={{ background: 'var(--brand-secondary)' }} 
              />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center justify-center text-center min-h-[90vh] md:min-h-[var(--hero-height)] py-12 md:py-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id + '-content'}
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
              transition={{ 
                duration: transitionDuration * 0.8, 
                delay: transitionDuration * 0.2,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              className="w-full"
              style={{ maxWidth: theme.heroContentMaxWidth }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: transitionDuration * 0.3,
                  duration: 0.6,
                  ease: 'easeOut'
                }}
                className="inline-block px-6 py-2 rounded-full mb-6 backdrop-blur-sm"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.15)', 
                  color: 'var(--text-inverse)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                {currentBanner.category === 'common' && 'Construction & Software Excellence'}
                {currentBanner.category === 'construction' && 'Professional Construction Services'}
                {currentBanner.category === 'software' && 'Advanced Software Solutions'}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: transitionDuration * 0.4,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 px-4"
                style={{ 
                  color: 'var(--text-inverse)',
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
              >
                {currentBanner.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: transitionDuration * 0.5,
                  duration: 0.7,
                  ease: 'easeOut'
                }}
                className="text-base md:text-xl lg:text-2xl mb-8 md:mb-12 opacity-90 px-4 md:px-8"
                style={{
                  color: 'var(--text-inverse)',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                }}
              >
                {currentBanner.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: transitionDuration * 0.6,
                  duration: 0.6,
                  ease: 'easeOut'
                }}
                className="flex flex-wrap justify-center gap-3 md:gap-4 px-4"
              >
                {currentBanner.buttons.map((button, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: transitionDuration * 0.7 + index * 0.1,
                      duration: 0.5,
                      ease: [0.34, 1.56, 0.64, 1] // Bouncy ease
                    }}
                    onClick={button.action}
                    whileHover={{
                      scale: 1.05,
                      y: -2,
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold transition-all shadow-lg text-sm md:text-base backdrop-blur-sm cursor-pointer"
                    style={
                      button.variant === 'primary'
                        ? { 
                            background: 'var(--text-inverse)', 
                            color: 'var(--brand-primary)',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
                          }
                        : button.variant === 'whatsapp'
                        ? { 
                            background: '#25D366', 
                            color: 'white',
                            boxShadow: '0 8px 25px rgba(37, 211, 102, 0.3)'
                          }
                        : {
                            background: 'rgba(255, 255, 255, 0.15)',
                            color: 'var(--text-inverse)',
                            border: '2px solid rgba(255, 255, 255, 0.5)',
                            backdropFilter: 'blur(10px)'
                          }
                    }
                  >
                    {button.label}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Manual Controls */}
      {theme.heroManualControls && (
        <>
          {/* Navigation Arrows */}
          <motion.button
            onClick={handlePrev}
            disabled={isTransitioning}
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 rounded-full backdrop-blur-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ 
              background: 'rgba(255, 255, 255, 0.15)', 
              color: 'var(--text-inverse)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>

          <motion.button
            onClick={handleNext}
            disabled={isTransitioning}
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 rounded-full backdrop-blur-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ 
              background: 'rgba(255, 255, 255, 0.15)', 
              color: 'var(--text-inverse)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>

          {/* Dot Indicators */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 md:gap-3 px-4 py-3 rounded-full backdrop-blur-md"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
          >
            {bannerStates.map((banner, index) => (
              <motion.button
                key={index}
                onClick={() => handleDotClick(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="transition-all relative overflow-hidden cursor-pointer"
                style={{
                  width: currentIndex === index ? '36px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  background: currentIndex === index 
                    ? 'var(--text-inverse)' 
                    : 'rgba(255, 255, 255, 0.3)',
                  boxShadow: currentIndex === index 
                    ? '0 0 20px rgba(255, 255, 255, 0.5)' 
                    : 'none'
                }}
                aria-label={`Go to ${banner.category} banner`}
              >
                {currentIndex === index && theme.heroAutoRotate && !isPaused && (
                  <motion.div
                    className="absolute inset-0 bg-white/30"
                    initial={{ scaleX: 0, transformOrigin: 'left' }}
                    animate={{ scaleX: 1 }}
                    transition={{ 
                      duration: parseInt(theme.heroRotationInterval) / 1000,
                      ease: 'linear'
                    }}
                  />
                )}
              </motion.button>
            ))}

            {/* Pause/Play Button */}
            <motion.button
              onClick={() => setIsPaused(!isPaused)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="ml-2 md:ml-4 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer"
              style={{ 
                background: isPaused 
                  ? 'rgba(255, 100, 100, 0.3)' 
                  : 'rgba(255, 255, 255, 0.2)', 
                color: 'var(--text-inverse)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
              aria-label={isPaused ? 'Resume rotation' : 'Pause rotation'}
            >
              {isPaused ? <Play className="w-3 h-3 md:w-4 md:h-4" /> : <Pause className="w-3 h-3 md:w-4 md:h-4" />}
            </motion.button>
          </div>
        </>
      )}

    </section>
  );
}