'use client';

import React from 'react';
import { EventTemplateData } from '@/types/template.types';

interface Template1Props {
  data?: EventTemplateData;
}

// Dummy data with default branding colors (Cyan & Blue vibe)
const dummyData: EventTemplateData = {
  title: "FutureStack Tech Conference 2026",
  description: "Join industry leaders and innovators for a full day of deep dives into AI, multi-tenant SaaS architectures, and the future of web development. Network with top professionals and level up your skills.\n\nLearn from the best, interact with hands-on workshops, and build the future of the web together.",
  date: "October 15, 2026",
  time: "09:00 AM - 06:00 PM",
  location: "Karachi Expo Center, Main Auditorium, Karachi, Pakistan.",
  imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
  organizerName: "EventSphere Originals",
  startingPrice: 2500,
  tags: ["Technology", "Networking", "AI"],
  primaryColor: "#06b6d4", // Cyan
  secondaryColor: "#3b82f6", // Blue
};

export default function Template1({ data = dummyData }: Template1Props) {
  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans text-slate-200 pb-24 sm:pb-0 selection:bg-cyan-500/30">
      
      {/* Hero Section */}
      <div className="relative h-[65vh] min-h-[550px] w-full flex items-end">
        {/* Background Image & Overlay Gradients */}
        <div className="absolute inset-0">
          <img
            src={data.imageUrl}
            alt={data.title}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0B0F19]/60 to-[#0B0F19]"></div>
          <div className="absolute inset-0 bg-linear-to-t from-[#0B0F19] via-transparent to-transparent"></div>
        </div>

        {/* Hero Content - Perfectly aligned with the grid below */}
        <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pb-32 sm:pb-40">
          <div className="flex flex-wrap gap-3 mb-6">
            {data.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-slate-900/50 border rounded-full backdrop-blur-md shadow-lg"
                style={{ 
                  color: data.primaryColor, 
                  borderColor: `${data.primaryColor}50` // 50 adds transparency to the hex
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
            {data.title}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-lg text-slate-300 font-medium">
              Presented by <span className="text-white font-bold">{data.organizerName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area - Aligned Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Description & Details (Spans 7 cols on large screens) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Info Cards Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 -mt-24 sm:-mt-32 relative z-10">
              
              {/* Date & Time Card */}
              <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 p-6 sm:p-8 rounded-4xl shadow-2xl hover:bg-slate-800/80 transition-all duration-300">
                {/* items-start prevents icon from shrinking or centering weirdly if text is long */}
                <div className="flex items-start gap-5">
                  <div 
                    className="p-3.5 bg-slate-950/50 rounded-2xl shadow-inner shrink-0"
                    style={{ color: data.primaryColor, border: `1px solid ${data.primaryColor}30` }}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Date & Time</h3>
                    <p className="text-white font-semibold text-lg leading-snug">{data.date}</p>
                    <p className="text-slate-400 text-sm mt-1">{data.time}</p>
                  </div>
                </div>
              </div>

              {/* Location Card (Truncation Removed) */}
              <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 p-6 sm:p-8 rounded-4xl shadow-2xl hover:bg-slate-800/80 transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div 
                    className="p-3.5 bg-slate-950/50 rounded-2xl shadow-inner shrink-0"
                    style={{ color: data.secondaryColor, border: `1px solid ${data.secondaryColor}30` }}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Location</h3>
                    {/* Replaced truncate with standard text wrapping logic */}
                    <p className="text-white font-semibold text-lg leading-snug wrap-break-word">
                      {data.location}
                    </p>
                    <a 
                      href="#" 
                      className="inline-block text-sm font-medium hover:underline mt-2 transition-all"
                      style={{ color: data.primaryColor }}
                    >
                      View Map & Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="pt-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-1 rounded-full" style={{ backgroundColor: data.primaryColor }}></span>
                About This Event
              </h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg sm:text-xl font-light">
                {data.description}
              </p>
            </div>
          </div>

          {/* Right Column: Checkout/Ticket Widget (Spans 4 cols on large screens) */}
          <div className="lg:col-span-4 mt-8 lg:mt-0 relative z-20">
            {/* Kept negative margin on desktop to pull it up into the hero area slightly */}
            <div className="bg-slate-900 border border-slate-700/60 rounded-4xl p-8 lg:-mt-32 sticky top-8 shadow-2xl hidden sm:block backdrop-blur-xl">
              <h3 className="text-2xl font-extrabold text-white mb-2">Secure Your Spot</h3>
              <p className="text-slate-400 text-sm mb-8">Grab your tickets before they sell out.</p>
              
              <div className="mb-8 p-6 bg-slate-950/50 rounded-2xl border border-slate-800">
                <span className="block text-slate-400 text-sm font-medium mb-1">Starting from</span>
                <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                  Rs. {data.startingPrice}
                </span>
              </div>

              <button 
                className="w-full text-white text-lg font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
                style={{ 
                  background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})`,
                  boxShadow: `0 10px 30px -10px ${data.primaryColor}` 
                }}
              >
                Purchase Tickets
              </button>
              
              <div className="flex items-center justify-center gap-2 mt-6 text-slate-500 text-sm font-medium">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure payments via JazzCash & EasyPaisa
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 p-5 sm:hidden flex items-center justify-between z-50">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Price</p>
          <p className="text-2xl font-extrabold text-white">Rs. {data.startingPrice}</p>
        </div>
        <button 
          className="text-white font-bold py-3.5 px-8 rounded-xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})` }}
        >
          Get Tickets
        </button>
      </div>

    </div>
  );
}