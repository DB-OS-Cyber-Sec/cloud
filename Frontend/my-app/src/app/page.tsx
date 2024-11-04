'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import WeatherComponent from '../components/WeatherComponent';
import WeatherForecast from '../components/WeatherForecast';
import TyphoonAlert from '../components/TyphoonAlert';

// Dynamically import WeatherMap without wrapping in useMemo
const WeatherMap = dynamic(() => import('../components/WeatherMap'), {
  ssr: false, // Disable server-side rendering for this component
});

export default function Home() {
  const [philippinesTime, setPhilippinesTime] = React.useState('');

  React.useEffect(() => {
    const updatePhilippinesTime = () => {
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      };
      setPhilippinesTime(date.toLocaleString('en-US', options));
    };

    // Update time on mount
    updatePhilippinesTime();

    // Optional: Update time every minute
    const intervalId = setInterval(updatePhilippinesTime, 60000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Handler to simulate the API call
  const handleSimulateApiCall = async () => {
    try {
      await fetch('http://localhost:3010/getWeather', { method: 'GET' });
      console.log('Simulate API Call triggered');
    } catch (error) {
      console.log('Failed to trigger API call:', error);
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 flex flex-col items-center justify-center">
      <button
        onClick={handleSimulateApiCall}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Simulate API Call
      </button>
      <main className="flex flex-col w-full max-w-7xl gap-6">
        <section className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col w-[80%] max-md:ml-0 max-md:w-full">
            {/* Render the dynamically imported WeatherMap */}
            <WeatherMap />
          </div>

          <aside className="w-full md:w-1/3 space-y-5">
            {/* First Block - Weather Information */}
            <div className="bg-[#121C2D] text-white p-4 rounded-lg">
              <h2 className="text-lg font-semibold">
                Republic of the Philippines, PH
              </h2>
              <p className="text-sm text-gray-400">{philippinesTime}</p>
              <WeatherComponent />
            </div>

            {/* Second Block - Typhoon Alert */}
            <div className="bg-[#121C2D] text-white p-4 rounded-lg">
              <h2 className="text-lg font-semibold">Typhoon Alert</h2>
              <TyphoonAlert />
            </div>

            {/* Third Block - 1-Hour Forecast */}
            <div className="bg-[#121C2D] text-white p-4 rounded-lg">
              <h2 className="text-lg font-semibold">1-Hour Forecast</h2>
              <WeatherForecast />
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
