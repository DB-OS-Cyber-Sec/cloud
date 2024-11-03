# Cloud (Backend)

## Introduction

### Kafka

Apache Kafka is a distributed event streaming platform capable of handling trillions of events a day. It is designed for high-throughput and low-latency data processing. Kafka serves as a message broker that allows applications to publish and subscribe to streams of records, much like a message queue or enterprise messaging system. It is widely used for building real-time data pipelines and streaming applications, making it an ideal choice for event-driven architectures.

### Fastify

Fastify is a fast and low-overhead web framework for Node.js that provides a robust set of features for building web applications and APIs. It emphasizes performance and developer experience, enabling developers to create efficient, scalable, and reliable server-side applications. Fastify includes built-in support for async/await, schema-based request validation, and a powerful plugin architecture, making it an excellent choice for modern web development.

## Best Practices

- **Centralized Logging System**  
  Utilize a centralized logging system (e.g., Elasticsearch or Logstash) to collect, store, and analyze logs from your Node.js, Kafka, and Fastify components.

- **Appropriate Logging Levels**  
  Implement appropriate logging levels (INFO, WARNING, ERROR) to log events, making it easier to identify and troubleshoot issues.

- **Idempotent Producers**  
  When producing events to Kafka, use idempotent producers to ensure events are delivered in order and to avoid duplicates.

- **Message Schema**  
  Define a message schema (e.g., Avro or JSON Schema) to specify the structure and format of events produced and consumed by your system, ensuring data consistency and preventing compatibility issues.

- **Secure Message Broker**  
  Use a message broker like Kafka that offers built-in security features (e.g., encryption and authentication) to protect sensitive data transmitted between components.

- **Monitoring and Testing**  
  Regularly monitor and test your system to ensure it functions as expected and to identify and resolve potential issues.

## Build and Deploy

To install dependencies and build the Docker image, run the following commands:

```bash
npm install
docker build -t pot4t0/cloud15:fastify .
docker push pot4t0/cloud15:fastify
```

## Testing Endpoints

```bash
curl -X GET http://localhost:3010/getWeather // Simulate API Calls
curl -X GET http://localhost:3010/health
curl -X GET http://localhost:3010/flask-health
curl -X GET http://localhost:3010/test-mongo
curl -X GET http://localhost:3010/test-sendAI
curl -X GET http://localhost:5001/health
curl -X POST http://localhost:5001/api/weather/prediction \
-H "Content-Type: application/json" \
-d '{
  "time": "2024-03-01T12:00:00Z",
  "values": {
    "temperature": 28.5,
    "humidity": 75,
    "windSpeed": 15.2,
    "rainIntensity": 0.5,
    "pressureSurfaceLevel": 1008
  }
}'
```

## SSE Endpoints

```bash
curl -X GET http://localhost:3010/weather-stream
curl -X GET http://localhost:3010/typhoon-stream
curl -X GET http://localhost:3010/weather-forecast
```

## SSE Browser Testing Sites

### Weather Stream Test

http://localhost:3010/test-web-stream

### Typhoon Updates Test

http://localhost:3010/test-typhoon-updates

## Weather Forecast Test

http://localhost:3010/test-weather-forecast

## REST Interaction with MongoDB

### Get Historical Data

```bash
curl -X GET http://localhost:3010/getHistoricalData
```

### Add a New Subscriber

```bash

curl -X POST http://localhost:3010/newSubscriber \
-H "Content-Type: application/json" \
-d '{
  "email": "test@test.com"
}'
```

### Delete a Subscriber

```bash

curl -X DELETE http://localhost:3010/delSubscriber \
-H "Content-Type: application/json" \
-d '{
    "email": "test@test.com"
}'
```

### Get Subscribers

```bash

curl -X GET http://localhost:3010/getSubscribers
```
