import React from 'react';
import { Calculator, DollarSign, BarChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Plan Your Canadian Pension with Confidence
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Compare different pension plans, calculate your future benefits, and make informed decisions about your retirement.
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg">
          Start Calculating
        </Button>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-6">
            <CardContent className="space-y-4 pt-4">
              <Calculator className="h-12 w-12 text-blue-600" />
              <h3 className="text-xl font-semibold">Multiple Plan Comparison</h3>
              <p className="text-gray-600">
                Compare different pension plans side by side to find the best option for your retirement goals.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4 pt-4">
              <DollarSign className="h-12 w-12 text-blue-600" />
              <h3 className="text-xl font-semibold">Accurate Calculations</h3>
              <p className="text-gray-600">
                Get precise estimates of your future pension payments based on your salary and years of service.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4 pt-4">
              <BarChart className="h-12 w-12 text-blue-600" />
              <h3 className="text-xl font-semibold">Visual Insights</h3>
              <p className="text-gray-600">
                View detailed charts and projections to better understand your retirement income potential.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold">Enter Your Details</h3>
              <p className="text-gray-600">
                Input your current salary, age, and years of service
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold">Choose Plans</h3>
              <p className="text-gray-600">
                Select the pension plans you want to compare
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold">Get Results</h3>
              <p className="text-gray-600">
                Review detailed projections and comparisons
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;