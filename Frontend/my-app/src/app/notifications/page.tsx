"use client";

import React, { useState } from "react";

// List of country codes
const countryCodes = [
  { code: "+1", country: "USA" },
  { code: "+44", country: "UK" },
  { code: "+63", country: "Philippines" },
  { code: "+91", country: "India" },
  { code: "+81", country: "Japan" },
  { code: "+65", country: "Singapore" },
];

// List of regions
const regions = [
  "Philippines",
  "Northern Luzon",
  "National Capitol Region",
  "Southern Luzon",
  "Visayas",
  "Mindanao",
];

export default function Notifications() {
  const [countryCode, setCountryCode] = useState("+63"); // Default to Philippines
  const [phoneNumber, setPhoneNumber] = useState("");
  const [filteredCodes, setFilteredCodes] = useState(countryCodes); // Filtered list for the combobox dropdown
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);
  const [status, setStatus] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setCountryCode(input);

    // Filter country codes based on user input (country name or code)
    if (input) {
      const filtered = countryCodes.filter((code) =>
        (code.code && code.code.startsWith(input)) ||
        (code.country && code.country.toLowerCase().includes(input.toLowerCase()))
      );
      setFilteredCodes(filtered);
    } else {
      setFilteredCodes(countryCodes);
    }
    setShowDropdown(true);
  };

  const handleSelectCountryCode = (code: string) => {
    setCountryCode(code);
    setShowDropdown(false); // Hide the dropdown once a selection is made
  };

  const handleSubscribeClick = () => {
    if (!phoneNumber) {
      setError("Phone number is required.");
      return;
    }
    setError(""); // Clear any previous errors
    setShowConfirmation(true); // Open confirmation modal
  };

  const handleSendSMS = async () => {
    const fullPhoneNumber = `${countryCode} ${phoneNumber}`;

    try {
      setStatus("Sending...");

      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: fullPhoneNumber,
          message: `You have subscribed to typhoon alerts for the ${selectedRegion}.`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("Subscription successful! SMS sent.");
      } else {
        setStatus("Failed to send SMS.");
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      setStatus("Error sending SMS.");
    }
    setShowConfirmation(false);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
  };

  return (
    <div className="min-h-screen p-8 pb-20 flex flex-col items-center justify-center">
      <main className="flex flex-col w-full max-w-5xl gap-10">
        {/* Subscription Form */}
        <section className="bg-white p-6 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-semibold mb-4">Subscribe to Typhoon Alerts in Philippines</h2>
          <div className="flex flex-col gap-4">
            <label className="text-black">Please enter your phone number:</label>
            <div className="flex flex-col gap-2 relative">
              {error && <p className="text-red-500 mb-2">{error}</p>}

              <div className="flex gap-2 relative">
                {/* Country Code Combobox */}
                <input
                  type="text"
                  value={countryCode}
                  onChange={handleCountryCodeChange}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="+63"
                  className="p-2 border rounded-md bg-[#2b3451] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ width: '150px' }}
                />

                {/* Dropdown for country codes */}
                {showDropdown && (
                  <ul className="absolute top-full mt-1 max-h-40 bg-gray-100 border rounded-md shadow-lg overflow-y-auto z-10" style={{ width: '150px' }}>
                    {filteredCodes.map((item) => (
                      <li
                        key={item.code}
                        onClick={() => handleSelectCountryCode(item.code)}
                        className="px-2 py-1 hover:bg-[#2064d4] hover:text-white cursor-pointer"
                      >
                        {item.code} ({item.country})
                      </li>
                    ))}
                  </ul>
                )}

                {/* Phone Number Input */}
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="81234567"
                  className="p-2 border rounded-md bg-[#2b3451] text-white flex-grow focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <label className="text-black">Please select the region to receive alerts for:</label>
              <select
                value={selectedRegion}
                onChange={handleRegionChange}
                className="p-2 border rounded-md bg-[#2b3451] text-white focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                {regions.map((region, index) => (
                  <option key={index} value={region}
                    className="bg-gray-100 text-black">
                    {region}
                  </option>
                ))}
              </select>

              <button
                onClick={handleSubscribeClick}
                className="mt-4 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-400 hover:text-black w-32 ml-auto"
              >
                Subscribe
              </button>
            </div>
          </div>
        </section>

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
      </main>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Confirm Subscription</h3>
            <p className="mb-4">
              You will receive typhoon alerts via SMS at
              <span className="font-bold text-blue-800"> {countryCode} {phoneNumber}</span>.
            </p>
            <p className="mb-4">
              Are you sure you want to subscribe to typhoon alerts for
              <span className="font-bold text-blue-800"> {selectedRegion}</span>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSMS}
                className="bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-400"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}