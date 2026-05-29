'use client';

import React, { useState } from 'react';
import { EventTemplateData, TabName } from '@/types/template.types';
import {
  Calendar, MapPin, Clock, Ticket, Users, Mail, Phone,
  Globe, MessageCircle, Share2, ChevronRight, ExternalLink,
} from 'lucide-react';
import {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaXTwitter,
} from "react-icons/fa6";
interface Template1Props {
  data: EventTemplateData;
}

const FONT_MAP: Record<string, string> = {
  'dm-sans': "'DM Sans', sans-serif",
  'playfair': "'Playfair Display', serif",
  'space-grotesk': "'Space Grotesk', sans-serif",
  'cabinet-grotesk': "'Cabinet Grotesk', sans-serif",
  'syne': "'Syne', sans-serif",
};

const FONT_LINKS: Record<string, string> = {
  'dm-sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap',
  'playfair': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap',
  'space-grotesk': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
  'cabinet-grotesk': 'https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&display=swap',
  'syne': 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap',
};

const TAB_LABELS: Record<TabName, string> = {
  overview: 'Overview',
  schedule: 'Schedule',
  tickets: 'Tickets',
  location: 'Location',
  contact: 'Contact',
  social: 'Social',
};

export default function Template1({ data }: Template1Props) {
  const enabledTabs = data.enabledTabs?.length ? data.enabledTabs : ['overview', 'schedule', 'tickets', 'location', 'contact', 'social'] as TabName[];
  const [activeTab, setActiveTab] = useState<TabName>('overview');

  const fontFamily = FONT_MAP[data.fontStyle || 'dm-sans'];
  const fontLink = FONT_LINKS[data.fontStyle || 'dm-sans'];
  const bgColor = data.backgroundColor || '#0B0F19';

  const formatDate = (dt: string) => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dt));
  const formatTime = (dt: string) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dt));
  const formatShortTime = (dt: string) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dt));

  const availableTickets = data.tickets.filter(t => !t.soldOut);
  const startingPrice = availableTickets.length > 0 ? Math.min(...availableTickets.map(t => t.price)) : null;
  const locationDisplay = `${data.venueName}, ${data.formattedAddress}`;
  const mapQuery = encodeURIComponent(locationDisplay);

  const socialEntries = Object.entries(data.socialLinks || {}).filter(([, v]) => v);

  const SOCIAL_ICONS: Record<string, React.ReactNode> = {
    facebook: <FaFacebook className="w-5 h-5" />,
    instagram: <FaInstagram className="w-5 h-5" />,
    twitter: <FaXTwitter className="w-5 h-5" />,
    linkedin: <FaLinkedin className="w-5 h-5" />,
    whatsapp: <MessageCircle className="w-5 h-5" />,
    website: <Globe className="w-5 h-5" />,
  };

  const SOCIAL_LABELS: Record<string, string> = {
    facebook: 'Facebook', instagram: 'Instagram', twitter: 'Twitter / X',
    linkedin: 'LinkedIn', whatsapp: 'WhatsApp', website: 'Website',
  };

  // Countdown
  const eventDate = new Date(data.startDatetime);
  const now = new Date();
  const diffMs = eventDate.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const diffHours = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const diffMins = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
  const isUpcoming = diffMs > 0;

  return (
    <div style={{ fontFamily, backgroundColor: bgColor }} className="min-h-screen text-slate-200 pb-24 sm:pb-0 selection:bg-cyan-500/30">
      {fontLink && <link rel="stylesheet" href={fontLink} />}

      {/* Hero */}
      <div className="relative h-[65vh] min-h-[550px] w-full flex items-end">
        <div className="absolute inset-0">
          <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, ${bgColor}99, ${bgColor})` }} />
        </div>
        <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pb-32 sm:pb-40">
          <div className="flex flex-wrap gap-3 mb-6">
            {data.tags.map((tag, idx) => (
              <span key={idx} className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-slate-900/50 border rounded-full backdrop-blur-md"
                style={{ color: data.primaryColor, borderColor: `${data.primaryColor}50` }}>
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
            {data.title}
          </h1>
          <p className="text-lg text-slate-300 font-medium">
            Presented by <span className="text-white font-bold">{data.organizerName}</span>
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Left: Tabs content */}
          <div className="lg:col-span-8 space-y-8">

            {/* Info Cards - always shown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 -mt-24 sm:-mt-32 relative z-10">
              <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 p-6 sm:p-8 rounded-4xl shadow-2xl">
                <div className="flex items-start gap-5">
                  <div className="p-3.5 bg-slate-950/50 rounded-2xl shrink-0" style={{ color: data.primaryColor, border: `1px solid ${data.primaryColor}30` }}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Date & Time</h3>
                    <p className="text-white font-semibold text-lg leading-snug">{formatDate(data.startDatetime)}</p>
                    <p className="text-slate-400 text-sm mt-1">{formatTime(data.startDatetime)} — {formatTime(data.endDatetime)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 p-6 sm:p-8 rounded-4xl shadow-2xl">
                <div className="flex items-start gap-5">
                  <div className="p-3.5 bg-slate-950/50 rounded-2xl shrink-0" style={{ color: data.secondaryColor, border: `1px solid ${data.secondaryColor}30` }}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Location</h3>
                    <p className="text-white font-semibold text-lg leading-snug">{locationDisplay}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown */}
            {isUpcoming && (
              <div className="bg-slate-900/40 border border-slate-700/40 rounded-4xl p-6 backdrop-blur-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Event starts in</p>
                <div className="flex gap-6">
                  {[{ v: diffDays, l: 'Days' }, { v: diffHours, l: 'Hours' }, { v: diffMins, l: 'Mins' }].map(({ v, l }) => (
                    <div key={l} className="text-center">
                      <span className="block text-4xl font-extrabold text-white">{String(v).padStart(2, '0')}</span>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-1">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Nav */}
            <div className="flex gap-1 bg-slate-900/40 p-1.5 rounded-2xl border border-slate-700/40 overflow-x-auto no-scrollbar">
              {enabledTabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === tab ? 'text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                  style={activeTab === tab ? { background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})` } : {}}>
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                  <span className="w-8 h-1 rounded-full" style={{ backgroundColor: data.primaryColor }}></span>
                  About This Event
                </h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg font-light">{data.description}</p>
              </div>
            )}

            {/* Tab: Schedule */}
            {activeTab === 'schedule' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <span className="w-8 h-1 rounded-full" style={{ backgroundColor: data.primaryColor }}></span>
                  Schedule
                </h2>
                {data.agenda.length === 0 ? (
                  <p className="text-slate-400 text-sm">No schedule added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.agenda.map((item, idx) => (
                      <div key={item.id} className="flex gap-5 bg-slate-900/40 border border-slate-700/40 rounded-3xl p-5 backdrop-blur-xl">
                        <div className="shrink-0 flex flex-col items-center gap-1">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: data.primaryColor }}>
                            {idx + 1}
                          </div>
                          {idx < data.agenda.length - 1 && <div className="w-px flex-1 min-h-5" style={{ backgroundColor: `${data.primaryColor}30` }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${data.primaryColor}20`, color: data.primaryColor }}>
                              <Clock className="w-3 h-3 inline mr-1" />
                              {formatShortTime(item.startTime)} — {formatShortTime(item.endTime)}
                            </span>
                            {item.roomOrLocation && (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />{item.roomOrLocation}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-white text-base">{item.title}</h4>
                          {item.description && <p className="text-slate-400 text-sm mt-1 leading-relaxed">{item.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Tickets */}
            {activeTab === 'tickets' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <span className="w-8 h-1 rounded-full" style={{ backgroundColor: data.primaryColor }}></span>
                  Tickets
                </h2>
                {data.tickets.length === 0 ? (
                  <p className="text-slate-400 text-sm">No ticket tiers available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.tickets.map((ticket) => (
                      <div key={ticket.id} className={`flex items-center justify-between p-6 rounded-3xl border transition-all duration-200 ${ticket.soldOut ? 'border-slate-700/30 bg-slate-900/20 opacity-60' : 'border-slate-700/50 bg-slate-900/40 hover:bg-slate-800/60'} backdrop-blur-xl`}>
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl" style={{ backgroundColor: `${data.primaryColor}20`, color: data.primaryColor }}>
                            <Ticket className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-base">{ticket.tierName}</p>
                            {ticket.soldOut && <span className="text-xs text-red-400 font-semibold">Sold Out</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-extrabold text-white">Rs. {ticket.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Location */}
            {activeTab === 'location' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <span className="w-8 h-1 rounded-full" style={{ backgroundColor: data.primaryColor }}></span>
                  Location
                </h2>
                <div className="rounded-3xl overflow-hidden border border-slate-700/50 shadow-xl">
                  <iframe
                    src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=15`}
                    width="100%" height="380"
                    style={{ border: 0 }}
                    allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Event Location"
                  />
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-900/40 border border-slate-700/40 rounded-2xl">
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5" style={{ color: data.primaryColor }} />
                  <div>
                    <p className="text-white font-semibold">{locationDisplay}</p>
                    <a href={`https://maps.google.com/maps?q=${mapQuery}`} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-medium mt-1 inline-flex items-center gap-1 hover:underline" style={{ color: data.primaryColor }}>
                      Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Contact */}
            {activeTab === 'contact' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <span className="w-8 h-1 rounded-full" style={{ backgroundColor: data.primaryColor }}></span>
                  Contact
                </h2>
                <div className="space-y-3">
                  {[
                    { icon: <Users className="w-5 h-5" />, label: 'Organizer', value: data.organizerName },
                    { icon: <Mail className="w-5 h-5" />, label: 'Email', value: data.organizerEmail, href: data.organizerEmail ? `mailto:${data.organizerEmail}` : undefined },
                    { icon: <Phone className="w-5 h-5" />, label: 'Phone', value: data.organizerPhone, href: data.organizerPhone ? `tel:${data.organizerPhone}` : undefined },
                  ].filter(c => c.value).map((c) => (
                    <div key={c.label} className="flex items-center gap-4 p-5 bg-slate-900/40 border border-slate-700/40 rounded-3xl backdrop-blur-xl">
                      <div className="p-3 rounded-2xl shrink-0" style={{ backgroundColor: `${data.primaryColor}20`, color: data.primaryColor }}>{c.icon}</div>
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">{c.label}</p>
                        {c.href ? (
                          <a href={c.href} className="text-white font-semibold hover:underline" style={{ color: data.primaryColor }}>{c.value}</a>
                        ) : (
                          <p className="text-white font-semibold">{c.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {!data.organizerEmail && !data.organizerPhone && (
                    <p className="text-slate-400 text-sm">No contact info provided.</p>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Social */}
            {activeTab === 'social' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <span className="w-8 h-1 rounded-full" style={{ backgroundColor: data.primaryColor }}></span>
                  Social & Share
                </h2>
                {socialEntries.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {socialEntries.map(([key, url]) => (
                      <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-4 p-5 bg-slate-900/40 border border-slate-700/40 rounded-3xl hover:bg-slate-800/60 transition-all backdrop-blur-xl group">
                        <div className="p-3 rounded-2xl shrink-0 transition-all" style={{ backgroundColor: `${data.primaryColor}20`, color: data.primaryColor }}>
                          {SOCIAL_ICONS[key]}
                        </div>
                        <span className="font-semibold text-white">{SOCIAL_LABELS[key]}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 ml-auto group-hover:translate-x-1 transition-transform" />
                      </a>
                    ))}
                  </div>
                )}
                <div className="p-5 bg-slate-900/40 border border-slate-700/40 rounded-3xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Share2 className="w-5 h-5" style={{ color: data.primaryColor }} />
                    <p className="font-bold text-white">Share this event</p>
                  </div>
                  <p className="text-slate-400 text-sm break-all">{typeof window !== 'undefined' ? window.location.href : ''}</p>
                  <button onClick={() => navigator.clipboard?.writeText(window.location.href)}
                    className="mt-3 text-xs font-bold px-4 py-2 rounded-xl transition-all text-white"
                    style={{ backgroundColor: data.primaryColor }}>
                    Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Sticky Ticket Widget */}
          <div className="lg:col-span-4 mt-8 lg:mt-0 relative z-20">
            <div className="bg-slate-900 border border-slate-700/60 rounded-4xl p-8 lg:-mt-32 sticky top-8 shadow-2xl hidden sm:block backdrop-blur-xl space-y-6">
              <div>
                <h3 className="text-2xl font-extrabold text-white mb-1">Secure Your Spot</h3>
                <p className="text-slate-400 text-sm">Grab your tickets before they sell out.</p>
              </div>
              <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800">
                <span className="block text-slate-400 text-sm font-medium mb-1">Starting from</span>
                <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                  {startingPrice !== null ? `Rs. ${startingPrice.toLocaleString()}` : 'TBA'}
                </span>
              </div>
              {/* Ticket tiers preview */}
              {data.tickets.length > 0 && (
                <div className="space-y-2">
                  {data.tickets.slice(0, 3).map(t => (
                    <div key={t.id} className="flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950/30">
                      <span className="text-sm font-medium text-slate-300">{t.tierName}</span>
                      <span className={`text-sm font-bold ${t.soldOut ? 'text-red-400' : 'text-white'}`}>
                        {t.soldOut ? 'Sold Out' : `Rs. ${t.price.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <button className="w-full text-white text-lg font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})`, boxShadow: `0 10px 30px -10px ${data.primaryColor}` }}>
                Purchase Tickets
              </button>
              <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Secure payments via JazzCash & EasyPaisa
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 p-5 sm:hidden flex items-center justify-between z-50">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Price</p>
          <p className="text-2xl font-extrabold text-white">{startingPrice !== null ? `Rs. ${startingPrice.toLocaleString()}` : 'TBA'}</p>
        </div>
        <button className="text-white font-bold py-3.5 px-8 rounded-xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})` }}>
          Get Tickets
        </button>
      </div>
    </div>
  );
}