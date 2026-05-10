'use client';

import React from 'react';
import { EventTemplateData } from '@/types/template.types';

interface Template3Props {
  data?: EventTemplateData;
}

// Dummy data tailored for a creative/structural event
const dummyData: EventTemplateData = {
  title: "Creative Canvas Design Fest '26",
  description: "Immerse yourself in a three-day festival celebrating the intersection of digital art, UI/UX design, and structural architecture. \n\nConnect with industry pioneers, participate in hands-on design sprints, and discover the trends shaping the future of visual experiences. Whether you are a seasoned art director or a budding designer, there is a canvas here for you.",
  date: "December 05-07, 2026",
  time: "11:00 AM - 08:00 PM Daily",
  location: "Karachi Arts Council, M.R. Kiyani Road, Karachi, Pakistan",
  imageUrl: "https://images.unsplash.com/photo-1558442074-3c19857bc1dc?q=80&w=2070&auto=format&fit=crop",
  organizerName: "EventSphere Creators",
  startingPrice: 3500,
  tags: ["Design", "Art", "Workshop"],
  primaryColor: "#e11d48", // Rose / Vibrant Red
  secondaryColor: "#8b5cf6", // Violet / Purple
};

export default function Template3({ data = dummyData }: Template3Props) {
  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-900 pb-24 sm:pb-12 selection:bg-rose-200">
      
      {/* Container */}
      <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        
        {/* Header - Massive Typography */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-4 py-1.5 text-sm font-bold bg-white border-2 border-stone-200 rounded-full shadow-sm text-stone-600">
              Presented by <span style={{ color: data.primaryColor }}>{data.organizerName}</span>
            </span>
            {data.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="px-4 py-1.5 text-sm font-bold uppercase tracking-wider rounded-full text-white"
                style={{ backgroundColor: idx % 2 === 0 ? data.primaryColor : data.secondaryColor }}
              >
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black uppercase tracking-tighter leading-[0.9] text-stone-950">
            {data.title}
          </h1>
        </div>

        {/* The Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          
          {/* Top Left: Main Image (Spans 8 cols) */}
          <div className="md:col-span-12 lg:col-span-8 h-[50vh] sm:h-[60vh] relative rounded-4xl sm:rounded-[3rem] overflow-hidden group">
            <img
              src={data.imageUrl}
              alt={data.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Inner ring for structural feel */}
            <div className="absolute inset-0 ring-2 ring-inset ring-black/10 rounded-4xl sm:rounded-[3rem] pointer-events-none"></div>
          </div>

          {/* Top Right: Ticket CTA Widget (Spans 4 cols) */}
          <div className="md:col-span-12 lg:col-span-4 bg-stone-950 text-white rounded-4xl sm:rounded-[3rem] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Background Accent Graphic */}
            <div 
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: data.primaryColor }}
            ></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-2">Join the Experience</h3>
              <p className="text-stone-400 font-medium mb-8">Secure your access before early bird ends.</p>
              
              <div className="mb-2">
                <span className="text-stone-400 font-semibold uppercase tracking-widest text-xs">Starting Price</span>
              </div>
              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-5xl sm:text-6xl font-black tracking-tighter">Rs.{data.startingPrice}</span>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              <button 
                className="w-full text-white text-xl font-bold py-5 px-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})` }}
              >
                Buy Tickets
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <div className="flex justify-center gap-4 text-stone-500 text-sm font-semibold">
                <span>JazzCash</span>
                <span>•</span>
                <span>EasyPaisa</span>
              </div>
            </div>
          </div>

          {/* Bottom Left: About Event (Spans 8 cols) */}
          <div className="md:col-span-12 lg:col-span-8 bg-white rounded-4xl sm:rounded-[3rem] p-8 sm:p-12 shadow-sm border border-stone-200">
            <h2 className="text-3xl font-black mb-6 uppercase tracking-tight text-stone-900 flex items-center gap-3">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: data.primaryColor }}></span>
              The Details
            </h2>
            <p className="text-lg sm:text-xl text-stone-600 leading-relaxed font-medium whitespace-pre-wrap">
              {data.description}
            </p>
          </div>

          {/* Bottom Right: When & Where (Spans 4 cols) */}
          <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-4 sm:gap-6">
            
            {/* Date Box */}
            <div 
              className="group flex-1 rounded-4xl sm:rounded-[3rem] p-8 flex flex-col justify-center text-white relative overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              style={{ 
                backgroundColor: data.primaryColor,
                boxShadow: `0 20px 40px -15px ${data.primaryColor}80` 
              }}
            >
              {/* Massive Calendar Graphic - Animates on Hover */}
              <div className="absolute -top-10 -right-10 p-6 opacity-10 transition-all duration-700 ease-out group-hover:scale-[1.3] group-hover:-rotate-12 group-hover:opacity-25 pointer-events-none">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                </svg>
              </div>

              <div className="relative z-10">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">When</h3>
                <p className="text-2xl font-black leading-tight mb-1">{data.date}</p>
                <p className="text-lg font-medium opacity-90">{data.time}</p>
              </div>
            </div>

            {/* Location Box */}
            <div 
              className="group flex-1 rounded-4xl sm:rounded-[3rem] p-8 flex flex-col justify-center text-white relative overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              style={{ 
                backgroundColor: data.primaryColor,
                boxShadow: `0 20px 40px -15px ${data.primaryColor}80`
              }}
            >
              {/* Massive Map Pin Graphic - Animates on Hover */}
              <div className="absolute -bottom-10 -right-10 p-6 opacity-10 transition-all duration-700 ease-out group-hover:scale-[1.3] group-hover:rotate-12 group-hover:opacity-25 pointer-events-none">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>

              <div className="relative z-10">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Where</h3>
                <p className="text-xl font-bold leading-snug wrap-break-word mb-3">
                  {data.location}
                </p>
                <a 
                  href="#" 
                  className="inline-flex items-center font-bold text-sm hover:underline opacity-90 hover:opacity-100 transition-opacity"
                >
                  Open in Maps
                  <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:-translate-y-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-stone-200 p-4 sm:hidden flex items-center justify-between z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div>
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-0.5">Tickets</p>
          <p className="text-xl font-black text-stone-900">Rs.{data.startingPrice}</p>
        </div>
        <button 
          className="text-white font-bold py-3.5 px-8 rounded-xl shadow-lg active:scale-95 transition-transform"
          style={{ background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})` }}
        >
          Buy Now
        </button>
      </div>

    </div>
  );
}