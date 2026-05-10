import type { Metadata } from "next";
import React from "react";

// import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
// import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
// import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "@/components/ecommerce/StatisticsChart";
// import RecentOrders from "@/components/ecommerce/RecentOrders";
// import DemographicCard from "@/components/ecommerce/DemographicCard";

import Template1 from "@/components/templates/Template1";
import Template2 from "@/components/templates/Template2";
import Template3 from "@/components/templates/Template3";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 pb-20">
      {/* <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div> */}

      {/* --- TEMPLATE 1 SECTION --- */}
      <div className="col-span-12 mt-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Template 1: Modern Dark & Neon
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
          Best for tech conferences, concerts, and high-energy events.
        </p>
      </div>
      
      <div className="col-span-12 rounded-3xl overflow-hidden border-2 border-gray-200 dark:border-gray-800 shadow-lg">
        <Template1 />
      </div>

      {/* --- TEMPLATE 2 SECTION --- */}
      <div className="col-span-12 mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Template 2: Clean & Elegant Light Theme
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
          Best for corporate summits, formal galas, and premium workshops.
        </p>
      </div>

      <div className="col-span-12 rounded-3xl overflow-hidden border-2 border-gray-200 dark:border-gray-800 shadow-lg">
        <Template2 />
      </div>

      {/* --- TEMPLATE 3 SECTION --- */}
      <div className="col-span-12 mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Template 3: Structural Bento Grid
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
          Best for creative festivals, hackathons, and modern pop-up events.
        </p>
      </div>

      <div className="col-span-12 rounded-3xl overflow-hidden border-2 border-gray-200 dark:border-gray-800 shadow-lg">
        <Template3 />
      </div>

    </div>
  );
}