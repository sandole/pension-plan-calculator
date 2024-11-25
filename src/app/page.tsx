import React from 'react';
import Link from "next/link";
import { Calculator, DollarSign, BarChart } from 'lucide-react';
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Plan Your Canadian Pension
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Compare different pension plans, calculate your future benefits, and make informed decisions about your retirement.
          </p>
          
          {/* Auth Section */}
          <div className="flex flex-col items-center gap-4 mb-8">
            {session?.user && (
              <p className="text-center text-xl">
                Welcome back, {session.user.name}
              </p>
            )}
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            >
              {session ? "Sign out" : "Sign in to Start"}
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/compare" className="underline">
              <div className="rounded-lg bg-white/10 p-6 transition hover:bg-white/20">
                <div className="space-y-4">
                  <Calculator className="h-12 w-12 text-[hsl(280,100%,70%)]" />
                  <h3 className="text-xl font-semibold text-white">Multiple Plan Comparison</h3>
                  <p className="text-gray-300">
                    
                      Compare different pension plans side by side to find the best option for your retirement goals.
                  </p>
                </div>
              </div>
            </Link>


            <div className="rounded-lg bg-white/10 p-6 transition hover:bg-white/20">
              <div className="space-y-4">
                <DollarSign className="h-12 w-12 text-[hsl(280,100%,70%)]" />
                <h3 className="text-xl font-semibold text-white">Accurate Calculations</h3>
                <p className="text-gray-300">
                  Get precise estimates of your future pension payments based on your salary and years of service.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-white/10 p-6 transition hover:bg-white/20">
              <div className="space-y-4">
                <BarChart className="h-12 w-12 text-[hsl(280,100%,70%)]" />
                <h3 className="text-xl font-semibold text-white">Visual Insights</h3>
                <p className="text-gray-300">
                  View detailed charts and projections to better understand your retirement income potential.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { step: "1", title: "Enter Your Details", desc: "Input your current salary, age, and years of service" },
                { step: "2", title: "Choose Plans", desc: "Select the pension plans you want to compare" },
                { step: "3", title: "Get Results", desc: "Review detailed projections and comparisons" }
              ].map((item) => (
                <div key={item.step} className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-[hsl(280,100%,70%)] text-white flex items-center justify-center text-xl font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}