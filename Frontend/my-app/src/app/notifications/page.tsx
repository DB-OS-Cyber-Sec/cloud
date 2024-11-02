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
  "Manila",
  // "Philippines",
  // "Northern Luzon",
  // "National Capitol Region",
  // "Southern Luzon",
  // "Visayas",
  // "Mindanao",
];

export default function Notifications() {
  // Subscription form states
  const [countryCode, setCountryCode] = useState("+63"); // Default to Philippines
  const [phoneNumber, setPhoneNumber] = useState("");
  const [filteredCodes, setFilteredCodes] = useState(countryCodes); // Filtered list for the combobox dropdown
  const [showDropdown, setShowDropdown] = useState(false); // Dropdown for country codes
  const [showConfirmation, setShowConfirmation] = useState(false); // Confirmation modal when Subscribe button clicked

  // Region selection states
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);
  const [status, setStatus] = useState("");

  // Unsubscribe form states
  const [unsubCountryCode, setUnsubCountryCode] = useState("+63");
  const [showUnsubDropdown, setShowUnsubDropdown] = useState(false);
  const [unsubFilteredCodes, setUnsubFilteredCodes] = useState(countryCodes); // Filtered list for the combobox dropdown
  const [unsubPhoneNumber, setUnsubPhoneNumber] = useState("");
  const [showUnsubConfirmation, setShowUnsubConfirmation] = useState(false); // Confirmation modal when Unsubscribe button clicked

  // Subscription form handlers
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

  const handleSendSMS = async (action: 'subscribe' | 'unsubscribe') => {
    const fullPhoneNumber = action === 'subscribe' ? `${countryCode} ${phoneNumber}` : `${unsubCountryCode} ${unsubPhoneNumber}`;
    const msg = action === 'subscribe'
    ? `You have subscribed to typhoon alerts for the ${selectedRegion}.`
    : `You have unsubscribed from typhoon alerts.`;

    try {
      setStatus("Sending...");

      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: fullPhoneNumber,
          message: msg,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus(action === 'subscribe' ? "Subscription successful! SMS sent." : "Unsubscription successful! SMS sent.");
      } else {
        setStatus("Failed to send SMS.");
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      setStatus("Error sending SMS.");
    }

    // Close the confirmation modal
    if (action === 'subscribe') {
      setShowConfirmation(false);
    } else {
      setShowUnsubConfirmation(false);
    }
  };

  // Unsubscribe form handlers
  const handleUnsubCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setUnsubCountryCode(input);

    // Filter country codes based on user input (country name or code)
    if (input) {
      const filtered = countryCodes.filter((code) =>
        (code.code && code.code.startsWith(input)) ||
        (code.country && code.country.toLowerCase().includes(input.toLowerCase()))
      );
      setUnsubFilteredCodes(filtered);
    } else {
      setUnsubFilteredCodes(countryCodes);
    }
    setShowUnsubDropdown(true);
  };

  const handleSelectUnsubCountryCode = (code: string) => {
    setUnsubCountryCode(code);
    setShowUnsubDropdown(false); // Hide the dropdown once a selection is made
  };

  // Region form handlers
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
  };

  return (
    <div className="min-h-screen p-8 pb-20 flex flex-col items-center justify-center">
      <main className="flex flex-col w-full max-w-5xl gap-10">
        {/* Section for Subscription Form */}
        <section className="bg-white p-6 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-semibold mb-4">Subscribe to Typhoon Alerts in Philippines</h2>
          <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setShowConfirmation(true); }}>
            <label className="text-black">Please enter your phone number:</label>
            <div className="flex flex-col gap-2 relative">
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
                  placeholder="Input phone number"
                  className="p-2 border rounded-md bg-[#2b3451] text-white flex-grow focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
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
                className="mt-4 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-400 hover:text-black w-32 ml-auto"
              >
                Subscribe
              </button>
            </div>
          </form>
        </section>

        {/* Subscribe Confirmation Modal */}
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

        {/* Section for Unsubscribing */}
        <section className="bg-white p-6 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-semibold mb-4">Unsubscribe from Typhoon Alerts</h2>
          <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setShowUnsubConfirmation(true); }}>
            <label className="text-black">Please enter your phone number:</label>
            <div className="flex flex-col gap-2 relative">
              <div className="flex gap-2 relative">
                {/* Country Code Combobox */}
                <input
                  type="text"
                  value={unsubCountryCode}
                  onChange={handleUnsubCountryCodeChange}
                  onFocus={() => setShowUnsubDropdown(true)}
                  placeholder="+63"
                  className="p-2 border rounded-md bg-[#2b3451] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ width: '150px' }}
                />

                {/* Dropdown for country codes */}
                {showUnsubDropdown && (
                  <ul className="absolute top-full mt-1 max-h-40 bg-gray-100 border rounded-md shadow-lg overflow-y-auto z-10" style={{ width: '150px' }}>
                    {unsubFilteredCodes.map((item) => (
                      <li
                        key={item.code}
                        onClick={() => handleSelectUnsubCountryCode(item.code)}
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
                  value={unsubPhoneNumber}
                  onChange={(e) => setUnsubPhoneNumber(e.target.value)}
                  placeholder="Input phone number"
                  className="p-2 border rounded-md bg-[#2b3451] text-white flex-grow focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>

              <button
                className="mt-4 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-400 hover:text-black w-32 ml-auto"
              >
                Unsubscribe
              </button>
            </div>
          </form>
        </section>

        {/* Unsubscribe Confirmation Modal */}
        {showUnsubConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Confirm Unsubscription</h3>
              <p className="mb-4">
                Are you sure you want to stop receiving typhoon alerts via SMS at
                <span className="font-bold text-blue-800"> {unsubCountryCode} {unsubPhoneNumber}</span>?
              </p>
              <p className="mb-4">
                A message will be sent to confirm your unsubscription.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowUnsubConfirmation(false)}
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
      </main>
    </div>
  );
}