import React from "react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notifications',
}

export default function Notifications() {
  // Sample notification data
  const notifications = [
    {
      id: 1,
      message: "Typhoon warning issued in Northern Luzon",
      date: "October 10, 2024",
      type: "Alert",
    },
    {
      id: 2,
      message: "New weather update available for Visayas region",
      date: "October 9, 2024",
      type: "Info",
    },
    {
      id: 3,
      message: "WeatherGuard app has been updated with new features",
      date: "October 8, 2024",
      type: "Update",
    },
  ];

  return (
    <div className="min-h-screen p-8 bg-stone-100 flex flex-col items-center">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Notifications</h1>
      
      <div className="w-full max-w-3xl space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between">
              <span className={`font-semibold ${notification.type === "Alert" ? "text-red-600" : notification.type === "Info" ? "text-blue-600" : "text-green-600"}`}>
                {notification.type}
              </span>
              <span className="text-gray-400 text-sm">{notification.date}</span>
            </div>
            <p className="text-gray-800 mt-2">{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}