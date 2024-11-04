"use client";

import React, { useState, useEffect } from "react";

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
  const [showConfirmation, setShowConfirmation] = useState(false); // Confirmation modal when Subscribe button clicked
  const [subEmail, setSubEmail] = useState("");

  // Region selection states
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);

  // Unsubscribe form states
  const [showUnsubConfirmation, setShowUnsubConfirmation] = useState(false); // Confirmation modal when Unsubscribe button clicked
  const [unsubEmail, setUnsubEmail] = useState("");

  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [alertMessage, setAlertMessage] = useState("");

  // Store the list of subscribers when the component mounts
  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const response = await fetch("http://localhost:3010/getSubscribers");
        if (response.ok) {
          const data = await response.json();
          setSubscribers(data.email);
        } else {
          console.log("Failed to fetch subscribers");
        }
      } catch (error) {
        console.log("Error fetching subscribers:", error);
      }
    };

    fetchSubscribers();
  }, []);

  // Validation function to check if email exists or not
  const validateEmail = (action: "subscribe" | "unsubscribe") => {
    const email = action === 'subscribe' ? `${subEmail}` : `${unsubEmail}`;
    const isSubscribed = subscribers.includes(email);

    if (action === "subscribe" && isSubscribed) {
      setAlertMessage("This email is already subscribed.");
    } else if (action === "unsubscribe" && !isSubscribed) {
      setAlertMessage("This email is not subscribed.");
    } else {
      setEmailOptions(action, email);
    }
  };

  // Set email options
  const setEmailOptions = async (action: string, email: string) => {
    let subject = "";
    let body = "";

    if  (action === "subscribe") {
      subject = 'Subscribed to Typhoon Alerts';
      body = `You have been subscribed to Typhoon Alerts. You will receive all alerts for the ${selectedRegion} region.`;
      addEmail(email);
      sendEmailAlert(email, subject, body);
    } else {
      subject = 'Unsubscribed from Typhoon Alerts';
      body = `You have been unsubscribed from Typhoon Alerts. You will not receive any further alerts.`;
      delEmail(email);
      sendEmailAlert(email, subject, body);
    }
  };

  const addEmail = async (email: string) => {
    try {
      const response = await fetch("http://localhost:3010/newSubscriber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribers([...subscribers, data.email]);
        setAlertMessage("Email subscribed successfully!");
      } else {
        // console.log("Failed to add email");
        setAlertMessage("Failed to add email");
      }
    } catch (error) {
      // console.log("Error adding email:", error);
      setAlertMessage("Error adding email");
    }
  };

  const delEmail = async (email: string) => {
    try {
      const response = await fetch("http://localhost:3010/delSubscriber", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribers([...subscribers, data.email]);
        setAlertMessage("Email unsubscribed successfully!");
      } else {
        // console.log("Failed to delete email");
        setAlertMessage("Failed to delete email");
      }
    } catch (error) {
      // console.log("Error deleting email:", error);
      setAlertMessage("Error deleting email");
    }
  };

  // Send email alert function
  const sendEmailAlert = async (email: string, subject: string, body: string) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: subject,
          text: body,
        }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        alert('Email alert sent successfully!');
      } else {
        alert('Failed to send email alert.');
      }
    } catch (error) {
      console.log('Error sending email:', error);
      alert('Error sending email.');
    }
  };
  
  // Region form handlers
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
  };

  return (
    <div className="min-h-screen p-8 pb-20 flex flex-col items-center justify-center">
      {/* Display Alert Message */}
      {alertMessage && (
        <div className="alert alert-warning bg-yellow-100 text-yellow-900 p-4 rounded-md mb-4">
          {alertMessage}
          <button
            onClick={() => setAlertMessage("")}
            className="ml-4 text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>
      )}

      <main className="flex flex-col w-full max-w-5xl gap-10">
        {/* Section for Subscription Form */}
        <section className="bg-white p-6 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-semibold mb-4">Subscribe to Typhoon Alerts in Philippines</h2>
          <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setShowConfirmation(true); }}>
            <label className="text-black">Please enter your email:</label>
            <div className="flex flex-col gap-2 relative">
              <div className="flex gap-2 relative">
                <input
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="Input email"
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
                You will receive typhoon alerts via email at
                <span className="font-bold text-blue-800"> {subEmail} </span>.
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
                  onClick={() => { validateEmail('subscribe'); setShowConfirmation(false); }}
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
            <label className="text-black">Please enter your email:</label>
            <div className="flex flex-col gap-2 relative">
              <div className="flex gap-2 relative">
                <input
                  type="email"
                  value={unsubEmail}
                  onChange={(e) => setUnsubEmail(e.target.value)}
                  placeholder="Input email"
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
                Are you sure you want to stop receiving typhoon alerts via email at
                <span className="font-bold text-blue-800"> {unsubEmail} </span>?
              </p>
              <p className="mb-4">
                An email will be sent to confirm your unsubscription.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowUnsubConfirmation(false)}
                  className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { validateEmail('unsubscribe'); setShowUnsubConfirmation(false); }}
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