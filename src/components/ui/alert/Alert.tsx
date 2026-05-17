'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

interface AlertProps {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  showLink?: boolean;
  linkHref?: string;
  linkText?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  showLink = false,
  linkHref = "#",
  linkText = "Learn more",
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // 3. Optional Bonus: Automatically hide the alert after 3 seconds to match your progress bar!
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  const variantClasses = {
    success: {
      container: "bg-success-950 border-success-500/40 shadow-success-900/30",
      iconContainer: "bg-success-500/20 border-success-400/30 text-success-300",
      title: "text-white",
      message: "text-success-100/80",
      glow: "bg-success-400",
      bar: "bg-success-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]",
    },
    error: {
      container: "bg-error-950 border-error-500/40 shadow-error-900/30",
      iconContainer: "bg-error-500/20 border-error-400/30 text-error-300",
      title: "text-white",
      message: "text-error-100/80",
      glow: "bg-error-400",
      bar: "bg-error-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]",
    },
    warning: {
      container: "bg-warning-950 border-warning-500/40 shadow-warning-900/30",
      iconContainer: "bg-warning-500/20 border-warning-400/30 text-warning-300",
      title: "text-white",
      message: "text-warning-100/80",
      glow: "bg-warning-400",
      bar: "bg-warning-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]",
    },
    info: {
      container: "bg-blue-950 border-blue-500/40 shadow-blue-900/30",
      iconContainer: "bg-blue-500/20 border-blue-400/30 text-blue-300",
      title: "text-white",
      message: "text-blue-100/80",
      glow: "bg-blue-400",
      bar: "bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]",
    },
  };

  const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <XCircle className="w-6 h-6" />,
    warning: <AlertTriangle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />,
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-[100] w-full max-w-[360px] overflow-hidden rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-top-8 duration-500 ease-out ${variantClasses[variant].container}`}
    >
      <div
        className={`absolute -top-12 -left-12 h-32 w-32 rounded-full blur-[45px] opacity-40 ${variantClasses[variant].glow}`}
      />

      <div className="relative flex items-center gap-4 p-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-lg backdrop-blur-md ${variantClasses[variant].iconContainer}`}
        >
          <span className="scale-110">{icons[variant]}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={`text-[15px] font-bold tracking-tight ${variantClasses[variant].title}`}
          >
            {title}
          </h4>
          <p
            className={`text-[13px] leading-snug mt-0.5 line-clamp-2 font-medium ${variantClasses[variant].message}`}
          >
            {message}
          </p>

          {showLink && (
            <Link
              href={linkHref} // 4. Changed 'to' to 'href' for Next.js
              className="inline-flex items-center mt-2 text-[11px] font-bold uppercase tracking-widest text-white border-b border-white/30 hover:border-white transition-all pb-0.5"
            >
              {linkText}
              <svg
                className="ml-1 w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 h-[4px] w-full bg-black/30">
        <div
          className={`h-full animate-progress-grow origin-left ${variantClasses[variant].bar}`}
          style={{ animationDuration: "3000ms" }}
        />
      </div>
    </div>
  );
};

export default Alert;