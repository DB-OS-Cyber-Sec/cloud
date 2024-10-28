import * as React from "react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Home',
}

export default function Home() {
  const weatherData = {
    location: "Republic of the Philippines, PH",
    date: "October 10, 3:15am",
    temperature: "28°C",
    feelsLike: "32°C",
    humidity: "80%",
    windSpeed: "4 km/h N",
    precipitation: "None"
  };

  return (
  <div className="min-h-screen p-8 pb-20 flex flex-col items-center justify-center">
    <main className="flex flex-col w-full max-w-6xl gap-6">
      <section className="flex flex-col md:flex-row gap-6">
        <div className="flex gap-5 max-md:flex-col">
          <article className="flex flex-col w-[71%] max-md:ml-0 max-md:w-full">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/969315167dc7d860cb5e4961f81375c441bc1927dcb9a3bb838c7516134b44a4?placeholderIfAbsent=true&apiKey=0c1168ed47d74e7a991fe4c3acf5b9bb"
              alt="Weather map visualization"
              className="object-contain grow w-full rounded-xl aspect-[1.81] max-md:mt-10 max-md:max-w-full"
            />
          </article>
          <aside className="w-full md:w-1/3 bg-[#121C2D] text-white p-4 rounded-lg flex flex-col space-y-5">
            <div>
              <h2 className="text-lg font-semibold">{weatherData.location}</h2>
              <p className="text-sm text-gray-400">{weatherData.date}</p>
              <p>Temperature: {weatherData.temperature}</p>
              <p>Feels Like: {weatherData.feelsLike}</p>
              <p>Humidity: {weatherData.humidity}</p>
              <p>Wind Speed: {weatherData.windSpeed}</p>
              <p>Precipitation: {weatherData.precipitation}</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  </div>
);
}
