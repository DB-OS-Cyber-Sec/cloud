"use client";

import React, { useState, useEffect } from "react";

interface HistoricalDataItem {
  _id: string;
  issued: string;
  title: string;
  name: string;
  internationalName: string;
  movement: string;
  category: { [key: string]: string[] };
}

export default function History() {
  const [historicalData, setHistoricalData] = useState<HistoricalDataItem[]>([]);

  const getHistoricalData = async () => {
    try {
      const response = await fetch('http://localhost:3010/getHistoricalData', {
        method: 'GET',
      });
      if (response.ok) {
        const data = await response.json();
        setHistoricalData(data);
      } else {
        console.log('Failed to fetch historical data');
      }
    } catch (error) {
      console.log('Error fetching historical data:', error);
    }
  };

  useEffect(() => {
    getHistoricalData(); // Fetch data when the component mounts
  }, []);

  // Sort the data by the most recent date
  const sortedData = historicalData.sort((a, b) => new Date(b.issued).getTime() - new Date(a.issued).getTime());

  // Group the data by typhoon name
  const groupedData = sortedData.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = [];
    }
    acc[item.name].push(item);
    return acc;
  }, {} as { [key: string]: HistoricalDataItem[] });

  const [expandedTyphoons, setExpandedTyphoons] = useState<{ [key: string]: boolean }>({});
  // Toggle expansion for a specific typhoon
  const toggleExpand = (name: string) => {
    setExpandedTyphoons((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="min-h-screen p-8 pb-20 flex flex-col items-center justify-center">
      {/* Typhoon History Section */}
      <section className="bg-white p-6 rounded-lg shadow-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Philippines Typhoon History</h2>
        <div className="space-y-4">
          {Object.keys(groupedData).length > 0 ? (
            Object.entries(groupedData).map(([name, items]) => {
              const dateRange = `${new Date(items[items.length - 1].issued).toLocaleDateString()} - ${new Date(items[0].issued).toLocaleDateString()}`;
              return (
                <div key={name} className="p-4 bg-gray-100 rounded-md">
                  <div
                    className="cursor-pointer flex justify-between items-center"
                    onClick={() => toggleExpand(name)}
                  >
                    <div>
                      <h3 className="text-lg font-semibold">{name} ({items[0].internationalName})</h3>
                      <p className="text-sm text-gray-500">{dateRange}</p>
                    </div>
                    <button className="text-blue-500 hover:underline">
                      {expandedTyphoons[name] ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                  {expandedTyphoons[name] && (
                    <div className="mt-4 space-y-2">
                      {items.map((item) => (
                        <div key={item._id} className="bg-white p-4 rounded shadow">
                          <p className="font-semibold">Issued Date: {new Date(item.issued).toLocaleDateString()}</p>
                          <p>Wind Movement: {item.movement}</p>
                          <table className="w-full mt-2 border-collapse">
                            <thead>
                              <tr>
                                <th className="border-b py-2 px-4 text-left">Category</th>
                                <th className="border-b py-2 px-4 text-left">Affected Areas</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(item.category).map(([category, areas]) => (
                                <tr key={category}>
                                  <td className="py-2 px-4 font-semibold w-1/5">Category {category}</td>
                                  <td className="py-2 px-4 w-4/5">{areas.join(", ")}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </section>
    </div>
  );
}