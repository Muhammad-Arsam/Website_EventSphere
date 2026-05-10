'use client';

import React from 'react';
import { EventTemplateData } from '@/types/template.types';

interface Template2Props {
  data?: EventTemplateData;
}

// Dummy data tailored for a premium/elegant event
const dummyData: EventTemplateData = {
  title: "Global Leadership & Innovation Summit 2026",
  description: "Join world-renowned thought leaders, executives, and visionaries for an exclusive two-day summit. Explore the strategies that will define the next decade of corporate innovation, sustainable growth, and global collaboration.\n\nExperience keynote speeches, intimate fireside chats, and unparalleled networking opportunities in a premium setting.",
  date: "November 20, 2026",
  time: "10:00 AM - 04:00 PM",
  location: "The Grand Pearl Hotel & Conventions, Beach Avenue, Clifton, Karachi, Pakistan",
  imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
  organizerName: "EventSphere Premium",
  startingPrice: 15000,
  tags: ["Corporate", "Leadership", "Networking"],
  primaryColor: "#0f172a", // Deep Slate / Navy
  secondaryColor: "#d97706", // Elegant Amber/Gold
};

export default function Template2({ data = dummyData }: Template2Props) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-24 sm:pb-0 selection:bg-amber-100">
      
      {/* Top Header Section - Clean & Centered */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 pt-16 sm:pt-24 pb-12 text-center">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {data.tags.map((tag, idx) => (
            <span 
              key={idx} 
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-white border rounded-full shadow-sm"
              style={{ 
                color: data.secondaryColor, 
                borderColor: `${data.secondaryColor}40` 
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        
        <h1 
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15]"
          style={{ color: data.primaryColor }}
        >
          {data.title}
        </h1>
        
        <p className="text-lg text-slate-500 font-medium flex items-center justify-center gap-2">
          Hosted by <span className="font-bold border-b-2" style={{ borderColor: data.secondaryColor, color: data.primaryColor }}>{data.organizerName}</span>
        </p>
      </div>

      {/* Hero Image - Containerized & Elegant */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 mb-16 sm:mb-24">
        <div className="relative w-full h-[40vh] sm:h-[50vh] lg:h-[60vh] rounded-4xl sm:rounded-[3rem] overflow-hidden shadow-2xl">
          <img
            src={data.imageUrl}
            alt={data.title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          {/* Subtle inner shadow to make the image pop */}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-4xl sm:rounded-[3rem]"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Details & Description (Spans 8 cols) */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Elegant Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              
              {/* Date & Time */}
              <div className="flex gap-5 relative group">
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-full transition-all duration-300 group-hover:w-1.5"
                  style={{ backgroundColor: data.secondaryColor }}
                ></div>
                <div className="pl-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    When
                  </h3>
                  <p className="text-xl font-bold" style={{ color: data.primaryColor }}>{data.date}</p>
                  <p className="text-slate-500 mt-1 font-medium">{data.time}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex gap-5 relative group">
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-full transition-all duration-300 group-hover:w-1.5"
                  style={{ backgroundColor: data.secondaryColor }}
                ></div>
                <div className="pl-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Where
                  </h3>
                  <p className="text-xl font-bold wrap-break-word" style={{ color: data.primaryColor }}>
                    {data.location}
                  </p>
                  <a 
                    href="#" 
                    className="inline-block mt-2 text-sm font-semibold hover:underline"
                    style={{ color: data.secondaryColor }}
                  >
                    Get Directions &rarr;
                  </a>
                </div>
              </div>

            </div>

            {/* About Section */}
            <div>
              <h2 className="text-3xl font-extrabold mb-6" style={{ color: data.primaryColor }}>
                Event Overview
              </h2>
              <div className="prose prose-lg prose-slate max-w-none">
                <p className="leading-relaxed text-slate-600 whitespace-pre-wrap font-medium">
                  {data.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout/Ticket Widget (Spans 4 cols) */}
          <div className="lg:col-span-4 relative z-20">
            {/* Sticky Card Container */}
            <div className="bg-white border border-slate-100 rounded-4xl p-8 sm:p-10 sticky top-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] hidden sm:block">
              <h3 className="text-2xl font-extrabold mb-2" style={{ color: data.primaryColor }}>Reserve Your Seat</h3>
              <p className="text-slate-500 text-sm mb-8 font-medium">Limited availability for this exclusive event.</p>
              
              <div className="mb-8 pb-8 border-b border-slate-100">
                <span className="block text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Registration</span>
                <span className="text-5xl font-extrabold tracking-tight" style={{ color: data.primaryColor }}>
                  Rs. {data.startingPrice}
                </span>
                <span className="text-slate-400 font-medium ml-2">/ person</span>
              </div>

              <button 
                className="w-full text-white text-lg font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                style={{ 
                  backgroundColor: data.primaryColor,
                }}
              >
                Register Now
              </button>
              
              <div className="flex flex-col items-center gap-3 mt-6">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified Secure Checkout
                </div>
                <p className="text-xs text-slate-400 font-medium">Supports JazzCash & EasyPaisa</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Footer - Light Version */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 p-5 sm:hidden flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Entry Pass</p>
          <p className="text-2xl font-extrabold" style={{ color: data.primaryColor }}>Rs. {data.startingPrice}</p>
        </div>
        <button 
          className="text-white font-bold py-3.5 px-8 rounded-xl shadow-lg"
          style={{ backgroundColor: data.primaryColor }}
        >
          Register
        </button>
      </div>

    </div>
  );
}