import { weatherProducer, aiProducer } from './kafka';
import { getCurrentConditions, getCurrentConditionsAI } from './environment';
import { sendWeatherDataGRPC } from './ai';

export const getWeather = async () => {
  try {
    const current_weather = await getCurrentConditions();
    const current_weather_ai = await getCurrentConditionsAI();

    // Validate fetched weather data
    if (!current_weather || Object.keys(current_weather).length === 0) {
      console.error('No weather data available');
      return;
    }
    if (!current_weather_ai || Object.keys(current_weather_ai).length === 0) {
      console.error('No AI weather data available');
      return;
    }

    console.log('Current weather:', current_weather);
    console.log('Getting AI predictions & forecast...');

    const ai_request = JSON.stringify(current_weather_ai.data.timelines);
    const ai_response = await sendWeatherDataGRPC(ai_request);

    // Validate AI response
    if (!ai_response || ai_response.length === 0) {
      console.error('No AI predictions available');
      return;
    }

    const ai_json = JSON.parse(ai_response);
    const ai_predictions = {
      risk_classification: ai_json.risk_classification,
      typhoon_category: ai_json.typhoon_category,
      shelter_message: ai_json.shelter_message,
    };
    const ai_forecast = {
      one_hour_forecast: ai_json.one_hour_forecast,
    };

    console.log('AI predictions:', ai_predictions);
    console.log('AI forecast:', ai_forecast);

    // Send messages to Kafka
    await Promise.all([
      weatherProducer.send({
        topic: 'current-weather',
        messages: [{ value: JSON.stringify(current_weather) }],
      }),
      aiProducer.send({
        topic: 'typhoon-updates',
        messages: [{ value: JSON.stringify(ai_predictions) }],
      }),
      aiProducer.send({
        topic: 'weather-forecast',
        messages: [{ value: JSON.stringify(ai_forecast) }],
      }),
    ]);

    console.log('Current weather and AI data sent to Kafka');
  } catch (err) {
    console.error('Failed to send message:', err);
  }
};
