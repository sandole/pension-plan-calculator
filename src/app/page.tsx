import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { Calculator, DollarSign, BarChart } from 'lucide-react';
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        {/* Navigation Header */}
        <header className="w-full py-4 px-6">
          <div className="max-w-6xl mx-auto flex justify-end items-center">
            <div className="flex items-center gap-4">
              {session?.user ? (
                <div className="flex items-center gap-4">
                  {session.user.image && (
                    <Image 
                      src={session.user.image} 
                      alt={session.user.name ?? 'Profile'} 
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-white">{session.user.name}</span>
                  <Link
                    href="/api/auth/signout"
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-white/20"
                  >
                    Sign out
                  </Link>
                </div>
              ) : (
                <Link
                  href="/api/auth/signin"
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-white/20"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Plan Your Canadian Pension
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Compare different pension plans, calculate your future benefits, and make informed decisions about your retirement.
          </p>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href={`${process.env.NEXT_PUBLIC_BASE_PATH}/compare`}>
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

            <Link href={`${process.env.NEXT_PUBLIC_BASE_PATH}/calculate`}>
              <div className="rounded-lg bg-white/10 p-6 transition hover:bg-white/20">
                <div className="space-y-4">
                  <DollarSign className="h-12 w-12 text-[hsl(280,100%,70%)]" />
                  <h3 className="text-xl font-semibold text-white">Accurate Calculations</h3>
                  <p className="text-gray-300">
                    Get precise estimates of your future pension payments based on your salary and years of service.
                  </p>
                </div>
              </div>
            </Link>

            <Link href={`${process.env.NEXT_PUBLIC_BASE_PATH}/graph`}>
              <div className="rounded-lg bg-white/10 p-6 transition hover:bg-white/20">
                <div className="space-y-4">
                  <BarChart className="h-12 w-12 text-[hsl(280,100%,70%)]" />
                  <h3 className="text-xl font-semibold text-white">Visual Insights</h3>
                  <p className="text-gray-300">
                    Visualize your retirement wealth growth over time with interactive graphs and projections.
                  </p>
                </div>
              </div>
            </Link>
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