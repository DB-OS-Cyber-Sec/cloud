import { weatherProducer, aiProducer } from './kafka';
import { getCurrentConditions, getCurrentConditionsAI } from './environment';
import { get } from 'http';

export const getWeather = async () => {
  try {
    const current_weather = await getCurrentConditions();
    const current_weather_ai = await getCurrentConditionsAI();
    // Send the weather data to the Kafka 'current-weather' topic
    if (!current_weather || Object.keys(current_weather).length === 0) {
      console.error('No weather data available');
      return;
    }
    if (!current_weather_ai || Object.keys(current_weather_ai).length === 0) {
      console.error('No weather data available');
      return;
    }

    await weatherProducer.send({
      topic: 'current-weather',
      messages: [{ value: JSON.stringify(current_weather) }],
    });

    console.log('Current weather sent to Kafka');

    // Send the weather data to the AI service
    const aiPredictions = await sendWeatherDataGRPC(
      JSON.stringify(current_weather_ai)
    );
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
