"use client";

import React, { useState } from "react";

export default function History() {
  return (
    <div className="min-h-screen p-8 pb-20 flex flex-col items-center justify-center">
      {/* Typhoon History Section */}
      <section className="bg-white p-6 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-semibold mb-4">Philippines Typhoon History</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-md">
              <h3 className="text-lg font-semibold">June 3 to 4, 2023</h3>
              <p className="text-sm">Typhoon Mawar (Betty)</p>
              <p>Area: North Philippines</p>
              <p>Category: 5</p>
              <p>Highest Wind Speed: 305 km/h</p>
              <p>Air Pressure: 891 hPa</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-md">
              <h3 className="text-lg font-semibold">July 23 to 27, 2023</h3>
              <p className="text-sm">Typhoon Doksuri (Egay)</p>
              <p>Area: North Philippines</p>
              <p>Category: 4</p>
              <p>Highest Wind Speed: 240 km/h</p>
              <p>Air Pressure: 928 hPa</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-md">
              <h3 className="text-lg font-semibold">October 28 to 30, 2022</h3>
              <p className="text-sm">Severe Tropical Storm Nalgae (Paeng)</p>
              <p>Area: Eastern Visayas, Bicol Region</p>
              <p>Category: 1</p>
              <p>Highest Wind Speed: 140 km/h</p>
              <p>Air Pressure: 972 hPa</p>
            </div>
          </div>
        </section>
    </div>
  );
}