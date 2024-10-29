import { producer } from './kafka';
import { getCurrentConditions } from './environment';

export const getWeather = async () => {
  try {
    const current_weather = await getCurrentConditions();
    // Send the weather data to the Kafka 'current-weather' topic
    if (!current_weather || Object.keys(current_weather).length === 0) {
      console.error('No weather data available');
      return;
    }

    await producer.send({
      topic: 'current-weather',
      messages: [{ value: JSON.stringify(current_weather) }],
    });

    console.log('Current weather sent to Kafka');
  } catch (err) {
    console.error('Failed to send message:', err);
  }
};
