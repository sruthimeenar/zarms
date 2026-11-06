import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { Form, Input, Select, Button, Alert } from 'antd';
import { getContactSettings, submitEnquiry } from '../../../data/contact';

const { TextArea } = Input;

interface ContactData {
  address: string;
  constructionPhone: string;
  constructionEmail: string;
  softwarePhone: string;
  softwareEmail: string;
  businessHours: Array<{ days: string; hours: string }>;
}

const DEFAULT_CONTACT: ContactData = {
  address: '30/1, Medawalkkam 2nd Street, Kilpauk, Chennai-10',
  constructionPhone: '9840344369',
  constructionEmail: 'narbhavi555@gmail.com',
  softwarePhone: '9994123797',
  softwareEmail: 'rajesh.arms916@gmail.com',
  businessHours: [
    { days: 'Monday to Saturday', hours: '9:00 AM – 6:00 PM' },
    { days: 'Sunday', hours: 'By Appointment / Closed' },
  ],
};

export function ContactPage() {
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [contact, setContact] = useState<ContactData>(DEFAULT_CONTACT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getContactSettings()
      .then((settings) => {
        if (!active) return;
        setContact({
          address: settings.address || DEFAULT_CONTACT.address,
          constructionPhone: settings.constructionPhone || DEFAULT_CONTACT.constructionPhone,
          constructionEmail: settings.constructionEmail || DEFAULT_CONTACT.constructionEmail,
          softwarePhone: settings.softwarePhone || DEFAULT_CONTACT.softwarePhone,
          softwareEmail: settings.softwareEmail || DEFAULT_CONTACT.softwareEmail,
          businessHours: settings.businessHours?.length > 0
            ? settings.businessHours
            : DEFAULT_CONTACT.businessHours,
        });
      })
      .catch((error) => {
        console.error('Failed to load contact settings from backend, using defaults:', error);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    setSubmitError('');
    setSubmitted(false);

    try {
      await submitEnquiry({
        name: values.name,
        email: values.email,
        phone: values.phone,
        serviceType: values.serviceType,
        subject: values.subject,
        message: values.message,
      });

      form.resetFields();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section
        className="py-20"
        style={{ background: `linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end))`, color: 'var(--text-inverse)' }}
      >
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Get in Touch With ZARMS Tec</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              We are here to help you with construction requirements, software solutions, project discussions, and service enquiries.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20" style={{ background: 'var(--page-background)' }}>
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>Contact Information</h2>

              <div className="space-y-8 mb-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-primary)' }}>
                    <MapPin className="w-6 h-6" style={{ color: 'var(--text-inverse)' }} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Address</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{isLoading ? 'Loading...' : contact.address}</p>
                  </div>
                </div>

                <div className="p-6 rounded-xl text-left" style={{ background: 'var(--section-bg-light)' }}>
                  <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Construction Services Contact</h3>
                  <div className="space-y-2">
                    <a href={`tel:${contact.constructionPhone}`} className="flex items-center gap-2 hover:opacity-80 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                      <Phone className="w-5 h-5" />
                      {isLoading ? 'Loading...' : contact.constructionPhone}
                    </a>
                    <a href={`mailto:${contact.constructionEmail}`} className="flex items-center gap-2 hover:opacity-80 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                      <Mail className="w-5 h-5" />
                      {isLoading ? 'Loading...' : contact.constructionEmail}
                    </a>
                  </div>
                </div>

                <div className="p-6 rounded-xl text-left" style={{ background: 'var(--section-bg-light)' }}>
                  <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Software Solutions Contact</h3>
                  <div className="space-y-2">
                    <a href={`tel:${contact.softwarePhone}`} className="flex items-center gap-2 hover:opacity-80 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                      <Phone className="w-5 h-5" />
                      {isLoading ? 'Loading...' : contact.softwarePhone}
                    </a>
                    <a href={`mailto:${contact.softwareEmail}`} className="flex items-center gap-2 hover:opacity-80 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                      <Mail className="w-5 h-5" />
                      {isLoading ? 'Loading...' : contact.softwareEmail}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-secondary)' }}>
                    <Clock className="w-6 h-6" style={{ color: 'var(--text-inverse)' }} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Business Hours</h3>
                    {isLoading ? (
                      <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
                    ) : (
                      contact.businessHours.map((hours, index) => (
                        <p key={index} style={{ color: 'var(--text-secondary)' }}>
                          {hours.days}: {hours.hours}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <img
                src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=600&q=80"
                alt="Contact support"
                className="rounded-xl shadow-md w-full h-64 object-cover"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-3">
              <div className="p-8 rounded-2xl" style={{ background: 'var(--card-background)', boxShadow: 'var(--shadow-lg)' }}>
                <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Send Us an Enquiry</h2>

                {submitted && (
                  <Alert
                    message="Thank you for contacting ZARMS Tec. Our team will get in touch with you shortly."
                    type="success"
                    showIcon
                    closable
                    className="mb-6"
                    onClose={() => setSubmitted(false)}
                  />
                )}
                {submitError && (
                  <Alert
                    message={submitError}
                    type="error"
                    showIcon
                    closable
                    className="mb-6"
                    onClose={() => setSubmitError('')}
                  />
                )}

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  initialValues={{ serviceType: 'construction' }}
                >
                  <Form.Item
                    label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Full Name</span>}
                    name="name"
                    rules={[{ required: true, message: 'Please enter your full name' }]}
                  >
                    <Input size="large" placeholder="Enter your full name" />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Phone Number</span>}
                    name="phone"
                    rules={[
                      { required: true, message: 'Please enter your phone number' },
                      { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
                    ]}
                  >
                    <Input size="large" placeholder="Enter your phone number" maxLength={10} />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Email Address</span>}
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter your email address' },
                      { type: 'email', message: 'Please enter a valid email address' }
                    ]}
                  >
                    <Input size="large" placeholder="Enter your email address" />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Service Type</span>}
                    name="serviceType"
                    rules={[{ required: true, message: 'Please select a service type' }]}
                  >
                    <Select
                      size="large"
                      options={[
                        { value: 'construction', label: 'Construction Services' },
                        { value: 'software', label: 'Software Solutions' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Subject</span>}
                    name="subject"
                    rules={[{ required: true, message: 'Please enter a subject' }]}
                  >
                    <Input size="large" placeholder="Enter subject" />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Project Requirement</span>}
                    name="message"
                    rules={[{ required: true, message: 'Please describe your project requirement' }]}
                  >
                    <TextArea rows={4} placeholder="Describe your project requirement" showCount maxLength={1000} />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={<Send className="w-5 h-5" />}
                      loading={submitting}
                      disabled={submitting}
                      block
                      style={{ background: 'var(--brand-primary)', height: '50px', fontSize: '16px', fontWeight: 600 }}
                    >
                      Submit Enquiry
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
