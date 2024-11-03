import { weatherProducer, aiProducer } from './kafka';
import { getCurrentConditions } from './environment';

export const getWeather = async () => {
  try {
    const current_weather = await getCurrentConditions();
    // Send the weather data to the Kafka 'current-weather' topic
    if (!current_weather || Object.keys(current_weather).length === 0) {
      console.error('No weather data available');
      return;
    }

    await weatherProducer.send({
      topic: 'current-weather',
      messages: [{ value: JSON.stringify(current_weather) }],
    });

    console.log('Current weather sent to Kafka');
  } catch (err) {
    console.error('Failed to send message:', err);
  }
};

export const produceAIPredictions = async (grpcResponse: string) => {
  try {
    // Send the AI predictions to the Kafka 'ai-predictions' topic
    if (!grpcResponse || grpcResponse.length === 0) {
      console.error('No AI predictions available');
      return;
    }
    await aiProducer.send({
      topic: 'ai-predictions',
      messages: [{ value: grpcResponse }],
    });
    console.log('AI predictions:');
  } catch (err) {
    console.error('Failed to get AI predictions:', err);
  }
};
