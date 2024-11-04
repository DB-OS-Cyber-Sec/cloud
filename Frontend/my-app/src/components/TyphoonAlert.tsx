import React, { useState, useEffect } from 'react';

type TyphoonAlertData = {
  riskClassification: string;
  typhoonCategory: string;
  shelterMessage: string;
};

const TyphoonAlert: React.FC = () => {
  const [data, setData] = useState<TyphoonAlertData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create an EventSource to listen to the typhoon alert stream
    const eventSource = new EventSource('http://localhost:3010/typhoon-stream');

    // Listen for incoming messages from the server
    eventSource.onmessage = (event) => {
      try {
        console.log('Received typhoon alert data:', event.data);
        const parsedData = JSON.parse(event.data);

        const cleanData: TyphoonAlertData = {
          riskClassification: parsedData.risk_classification || 'Unknown',
          typhoonCategory: parsedData.typhoon_category || 'Unknown',
          shelterMessage:
            parsedData.shelter_message || 'No shelter message available',
        };

        setData(cleanData);
      } catch (error) {
        console.log('Error parsing typhoon alert data:', error);
        setError('Error parsing typhoon alert data.');
      }
    };

    // Handle any error from the EventSource
    eventSource.onerror = (error) => {
      console.log('EventSource failed:', error);
      setError('Failed to connect to typhoon alert stream.');
      eventSource.close(); // Close the EventSource on error
    };

    // Clean up the EventSource connection on component unmount
    return () => {
      eventSource.close();
    };
  }, []);

  if (error) return <p>{error}</p>;
  if (!data)
    return (
      <p>Press the "Simulate API Call" button to get typhoon alert data</p>
    );

  return (
    <div>
      <p>
        <strong>Risk Classification:</strong> {data.riskClassification}
      </p>
      <p>
        <strong>Typhoon Category:</strong> {data.typhoonCategory}
      </p>
      <p>
        <strong>Shelter Message:</strong> {data.shelterMessage}
      </p>
    </div>
  );
};

export default TyphoonAlert;
