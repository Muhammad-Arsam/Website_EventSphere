'use client';

import React, { useState } from 'react';
import { EventTemplateData, TabName } from '@/types/template.types';
import {
  Calendar, MapPin, Clock, Ticket, Users, Mail, Phone,
  Globe, MessageCircle, Share2, ChevronRight, ExternalLink, ArrowRight,
} from 'lucide-react';
import {
    FaFacebook,
    FaInstagram,
    FaXTwitter,
    FaLinkedin,
} from "react-icons/fa6";
interface Template3Props {
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

export default function Template3({ data }: Template3Props) {
  const enabledTabs = data.enabledTabs?.length ? data.enabledTabs : ['overview', 'schedule', 'tickets', 'location', 'contact', 'social'] as TabName[];
  const [activeTab, setActiveTab] = useState<TabName>('overview');

  const fontFamily = FONT_MAP[data.fontStyle || 'syne'];
  const fontLink = FONT_LINKS[data.fontStyle || 'syne'];
  const bgColor = data.backgroundColor || '#f5f5f4';

  const formatDate = (dt: string) => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dt));
  const formatTime = (dt: string) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dt));

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

  const eventDate = new Date(data.startDatetime);
  const now = new Date();
  const diffMs = eventDate.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const diffHours = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const diffMins = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
  const isUpcoming = diffMs > 0;

  return (
    <div style={{ fontFamily, backgroundColor: bgColor }} className="min-h-screen text-stone-900 pb-24 sm:pb-12 selection:bg-rose-200">
      {fontLink && <link rel="stylesheet" href={fontLink} />}

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">

        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-4 py-1.5 text-sm font-bold bg-white border-2 border-stone-200 rounded-full shadow-sm text-stone-600">
              Presented by <span style={{ color: data.primaryColor }}>{data.organizerName}</span>
            </span>
            {data.tags.map((tag, idx) => (
              <span key={idx} className="px-4 py-1.5 text-sm font-bold uppercase tracking-wider rounded-full text-white"
                style={{ backgroundColor: idx % 2 === 0 ? data.primaryColor : data.secondaryColor }}>
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black uppercase tracking-tighter leading-[0.9] text-stone-950">
            {data.title}
          </h1>
        </div>

        {/* Bento Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">

          {/* Image */}
          <div className="md:col-span-12 lg:col-span-8 h-[50vh] sm:h-[60vh] relative rounded-4xl sm:rounded-[3rem] overflow-hidden group">
            <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 ring-2 ring-inset ring-black/10 rounded-4xl sm:rounded-[3rem] pointer-events-none" />
          </div>

          {/* Ticket CTA */}
          <div className="md:col-span-12 lg:col-span-4 bg-stone-950 text-white rounded-4xl sm:rounded-[3rem] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ backgroundColor: data.primaryColor }} />
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-2">Join the Experience</h3>
              <p className="text-stone-400 font-medium mb-6">Secure your access before early bird ends.</p>
              {isUpcoming && (
                <div className="flex gap-5 mb-8">
                  {[{ v: diffDays, l: 'Days' }, { v: diffHours, l: 'Hrs' }, { v: diffMins, l: 'Min' }].map(({ v, l }) => (
                    <div key={l} className="text-center">
                      <span className="block text-3xl font-black">{String(v).padStart(2, '0')}</span>
                      <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">{l}</span>
                    </div>
                  ))}
                </div>
              )}
              <span className="text-stone-400 font-semibold uppercase tracking-widest text-xs">Starting Price</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl sm:text-6xl font-black tracking-tighter">
                  {startingPrice !== null ? `Rs.${startingPrice.toLocaleString()}` : 'TBA'}
                </span>
              </div>
            </div>
            <div className="relative z-10 space-y-4 mt-8">
              {data.tickets.length > 0 && (
                <div className="space-y-2 mb-4">
                  {data.tickets.slice(0, 2).map(t => (
                    <div key={t.id} className="flex justify-between items-center px-4 py-2.5 rounded-2xl bg-stone-900 border border-stone-800">
                      <span className="text-sm font-medium text-stone-300">{t.tierName}</span>
                      <span className={`text-sm font-bold ${t.soldOut ? 'text-red-400' : 'text-white'}`}>
                        {t.soldOut ? 'Sold Out' : `Rs.${t.price.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <button className="w-full text-white text-xl font-bold py-5 px-8 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})` }}>
                Buy Tickets <ArrowRight className="w-6 h-6" />
              </button>
              <div className="flex justify-center gap-4 text-stone-500 text-sm font-semibold">
                <span>JazzCash</span><span>•</span><span>EasyPaisa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {enabledTabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="shrink-0 px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-200"
              style={activeTab === tab
                ? { backgroundColor: data.primaryColor, color: '#fff', boxShadow: `0 8px 20px -5px ${data.primaryColor}80` }
                : { backgroundColor: 'white', color: '#78716c', border: '2px solid #e7e5e4' }}>
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 pb-8">

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <>
              <div className="md:col-span-12 lg:col-span-8 bg-white rounded-4xl sm:rounded-[3rem] p-8 sm:p-12 shadow-sm border border-stone-200 animate-in fade-in duration-300">
                <h2 className="text-3xl font-black mb-6 uppercase tracking-tight text-stone-900 flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: data.primaryColor }} />
                  The Details
                </h2>
                <p className="text-lg sm:text-xl text-stone-600 leading-relaxed font-medium whitespace-pre-wrap">{data.description}</p>
              </div>
              <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-4 sm:gap-6">
                <div className="flex-1 rounded-4xl sm:rounded-[3rem] p-8 flex flex-col justify-center text-white relative overflow-hidden group transition-all hover:-translate-y-2"
                  style={{ backgroundColor: data.primaryColor, boxShadow: `0 20px 40px -15px ${data.primaryColor}80` }}>
                  <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-25 group-hover:scale-110 transition-all duration-700 pointer-events-none">
                    <Calendar className="w-48 h-48" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">When</h3>
                    <p className="text-2xl font-black leading-tight mb-1">{formatDate(data.startDatetime)}</p>
                    <p className="text-lg font-medium opacity-90">{formatTime(data.startDatetime)} — {formatTime(data.endDatetime)}</p>
                  </div>
                </div>
                <div className="flex-1 rounded-4xl sm:rounded-[3rem] p-8 flex flex-col justify-center text-white relative overflow-hidden group transition-all hover:-translate-y-2"
                  style={{ backgroundColor: data.secondaryColor, boxShadow: `0 20px 40px -15px ${data.secondaryColor}80` }}>
                  <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-25 group-hover:scale-110 transition-all duration-700 pointer-events-none">
                    <MapPin className="w-48 h-48" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Where</h3>
                    <p className="text-xl font-bold leading-snug mb-3">{locationDisplay}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tab: Schedule */}
          {activeTab === 'schedule' && (
            <div className="md:col-span-12 bg-white rounded-4xl sm:rounded-[3rem] p-8 sm:p-12 shadow-sm border border-stone-200 animate-in fade-in duration-300">
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tight">
                <span className="w-4 h-4 rounded-full inline-block mr-3 align-middle" style={{ backgroundColor: data.primaryColor }} />
                Schedule
              </h2>
              {data.agenda.length === 0 ? <p className="text-stone-400">No schedule added yet.</p> : (
                <div className="space-y-4">
                  {data.agenda.map((item, idx) => (
                    <div key={item.id} className="flex gap-6 p-6 rounded-3xl border border-stone-100 hover:border-stone-200 transition-colors">
                      <div className="shrink-0">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg" style={{ backgroundColor: idx % 2 === 0 ? data.primaryColor : data.secondaryColor }}>
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-3 mb-2">
                          <span className="text-xs font-black px-3 py-1.5 rounded-full text-white uppercase tracking-wider" style={{ backgroundColor: data.primaryColor }}>
                            {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(item.startTime))} — {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(item.endTime))}
                          </span>
                          {item.roomOrLocation && <span className="text-xs text-stone-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{item.roomOrLocation}</span>}
                        </div>
                        <h4 className="font-black text-stone-900 text-lg uppercase tracking-tight">{item.title}</h4>
                        {item.description && <p className="text-stone-500 mt-1">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Tickets */}
          {activeTab === 'tickets' && (
            <div className="md:col-span-12 bg-white rounded-4xl sm:rounded-[3rem] p-8 sm:p-12 shadow-sm border border-stone-200 animate-in fade-in duration-300">
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tight">
                <span className="w-4 h-4 rounded-full inline-block mr-3 align-middle" style={{ backgroundColor: data.primaryColor }} />
                Tickets
              </h2>
              {data.tickets.length === 0 ? <p className="text-stone-400">No ticket tiers available yet.</p> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.tickets.map(ticket => (
                    <div key={ticket.id} className={`p-6 rounded-3xl border-2 transition-all ${ticket.soldOut ? 'border-stone-200 opacity-60' : 'border-stone-200 hover:border-stone-950 hover:-translate-y-1'}`}>
                      <div className="p-3 rounded-2xl w-fit mb-4" style={{ backgroundColor: `${data.primaryColor}15` }}>
                        <Ticket className="w-6 h-6" style={{ color: data.primaryColor }} />
                      </div>
                      <h4 className="font-black text-stone-900 text-lg uppercase tracking-tight mb-2">{ticket.tierName}</h4>
                      {ticket.soldOut
                        ? <span className="text-red-500 font-black text-lg">Sold Out</span>
                        : <span className="text-3xl font-black text-stone-950">Rs.{ticket.price.toLocaleString()}</span>
                      }
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Location */}
          {activeTab === 'location' && (
            <div className="md:col-span-12 animate-in fade-in duration-300 space-y-4">
              <div className="rounded-4xl sm:rounded-[3rem] overflow-hidden border-2 border-stone-200 shadow-lg">
                <iframe src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=15`} width="100%" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Event Location" />
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-3xl border border-stone-200 shadow-sm">
                <div className="p-3 rounded-2xl shrink-0" style={{ backgroundColor: `${data.primaryColor}15` }}>
                  <MapPin className="w-5 h-5" style={{ color: data.primaryColor }} />
                </div>
                <div>
                  <p className="font-bold text-stone-900">{locationDisplay}</p>
                  <a href={`https://maps.google.com/maps?q=${mapQuery}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-bold mt-1 inline-flex items-center gap-1 hover:underline" style={{ color: data.primaryColor }}>
                    Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Contact */}
          {activeTab === 'contact' && (
            <div className="md:col-span-12 bg-white rounded-4xl sm:rounded-[3rem] p-8 sm:p-12 shadow-sm border border-stone-200 animate-in fade-in duration-300">
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tight">
                <span className="w-4 h-4 rounded-full inline-block mr-3 align-middle" style={{ backgroundColor: data.primaryColor }} />
                Contact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <Users className="w-6 h-6" />, label: 'Organizer', value: data.organizerName },
                  { icon: <Mail className="w-6 h-6" />, label: 'Email', value: data.organizerEmail, href: data.organizerEmail ? `mailto:${data.organizerEmail}` : undefined },
                  { icon: <Phone className="w-6 h-6" />, label: 'Phone', value: data.organizerPhone, href: data.organizerPhone ? `tel:${data.organizerPhone}` : undefined },
                ].filter(c => c.value).map(c => (
                  <div key={c.label} className="p-6 rounded-3xl border-2 border-stone-100 hover:border-stone-200 transition-colors">
                    <div className="p-3 rounded-2xl w-fit mb-4" style={{ backgroundColor: `${data.primaryColor}15` }}>
                      <span style={{ color: data.primaryColor }}>{c.icon}</span>
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-1">{c.label}</p>
                    {c.href
                      ? <a href={c.href} className="font-bold text-lg hover:underline" style={{ color: data.primaryColor }}>{c.value}</a>
                      : <p className="font-bold text-lg text-stone-900">{c.value}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Social */}
          {activeTab === 'social' && (
            <div className="md:col-span-12 bg-white rounded-4xl sm:rounded-[3rem] p-8 sm:p-12 shadow-sm border border-stone-200 animate-in fade-in duration-300">
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tight">
                <span className="w-4 h-4 rounded-full inline-block mr-3 align-middle" style={{ backgroundColor: data.primaryColor }} />
                Social & Share
              </h2>
              {socialEntries.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                  {socialEntries.map(([key, url]) => (
                    <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5 rounded-3xl border-2 border-stone-100 hover:border-stone-950 transition-all group hover:-translate-y-1">
                      <div className="p-3 rounded-2xl shrink-0" style={{ backgroundColor: `${data.primaryColor}15`, color: data.primaryColor }}>{SOCIAL_ICONS[key]}</div>
                      <span className="font-black text-stone-900 uppercase tracking-tight text-sm">{SOCIAL_LABELS[key]}</span>
                      <ChevronRight className="w-4 h-4 text-stone-300 ml-auto group-hover:translate-x-1 transition-transform" />
                    </a>
                  ))}
                </div>
              )}
              <div className="p-6 rounded-3xl border-2 border-stone-100">
                <div className="flex items-center gap-3 mb-3">
                  <Share2 className="w-5 h-5" style={{ color: data.primaryColor }} />
                  <p className="font-black text-stone-900 uppercase tracking-tight">Share This Event</p>
                </div>
                <p className="text-stone-400 text-sm break-all font-mono">{typeof window !== 'undefined' ? window.location.href : ''}</p>
                <button onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="mt-4 text-xs font-black px-5 py-2.5 rounded-xl text-white uppercase tracking-wider transition-all hover:scale-105"
                  style={{ backgroundColor: data.primaryColor }}>
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-stone-200 p-4 sm:hidden flex items-center justify-between z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div>
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-0.5">Tickets</p>
          <p className="text-xl font-black text-stone-900">
            {startingPrice !== null ? `Rs.${startingPrice.toLocaleString()}` : 'TBA'}
          </p>
        </div>
        <button className="text-white font-bold py-3.5 px-8 rounded-xl shadow-lg active:scale-95 transition-transform"
          style={{ background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})` }}>
          Buy Now
        </button>
      </div>
    </div>
  );
}