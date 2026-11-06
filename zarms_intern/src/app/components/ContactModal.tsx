import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, MessageCircle, X } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const contactOptions = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      action: () => window.open('https://wa.me/919994123797', '_blank'),
      color: '#25D366',
      textColor: '#fff',
    },
    {
      icon: Phone,
      label: 'IT Services Call',
      action: () => window.location.href = 'tel:9994123797',
      color: '#06b6d4',
      textColor: '#fff',
    },
    {
      icon: Phone,
      label: 'Construction Call',
      action: () => window.location.href = 'tel:9840344369',
      color: '#fbbf24',
      textColor: '#000',
    },
    {
      icon: Mail,
      label: 'Email Us',
      action: () => window.location.href = 'mailto:info@zarmstec.com',
      color: '#ef4444',
      textColor: '#fff',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            style={{ backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div
              className="rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: 'var(--card-background)' }}
            >
              {/* Header */}
              <div
                className="px-6 py-4 flex items-center justify-between border-b"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <h2
                  className="text-xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Contact Us
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors hover:bg-opacity-10 cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contact Options */}
              <div className="p-6 space-y-3">
                {contactOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        option.action();
                        onClose();
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                      style={{
                        background: option.color,
                        color: option.textColor,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-lg">{option.label}</div>
                        {option.label === 'IT Services Call' && (
                          <div className="text-sm opacity-90">9994123797</div>
                        )}
                        {option.label === 'Construction Call' && (
                          <div className="text-sm opacity-90">9840344369</div>
                        )}
                        {option.label === 'Email Us' && (
                          <div className="text-sm opacity-90">info@zarmstec.com</div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div
                className="px-6 py-4 text-center text-sm border-t"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-muted)',
                }}
              >
                Choose your preferred contact method
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
