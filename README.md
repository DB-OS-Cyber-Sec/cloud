# Cloud Weather System

This project provides a complete cloud-based solution for weather data processing, prediction, and visualization. It integrates AI-driven forecasting models, Kafka-based data pipelines, a Fastify backend, a Next.js frontend, and deployment via Kubernetes.

## Project Structure

### 1. **AI**

- This directory contains Nvidia FourCastNet, which powers the AI-driven weather prediction models.
- Refer to the README in this directory for more details on setup and usage.

### 2. **AI-grpc**

- This folder contains a Flask service running with the Nvidia API for weather prediction and forecasting.
- The gRPC service interfaces with the AI model to deliver weather forecasts.

### 3. **Backend**

- This folder contains the **Fastify** server integrated with Kafka. It handles data pipelining, weather data collection, predictions, and forecasts, routing them to the appropriate services or users.
- For detailed instructions on configuring and running the backend, refer to the README in this directory.

### 4. **Frontend**

- The frontend is built using the **Next.js** framework. It includes an interactive map that displays weather forecasts and predictions, and provides a subscription interface for users to receive live updates.
- Refer to the README in this directory for more information on how to set up and run the frontend.

### 5. **K8**

- This directory contains all the necessary **Kubernetes** configuration files for deploying the application.
- For deployment instructions, refer to the README in this folder.

## Setup using Docker

To set up the project using Docker:

1. Navigate to the Backend directory and install dependencies:

   ```bash
   cd ./Backend
   npm install
   ```

   2. Navigate to the Frontend directory and install dependencies:

   ```bash
   cd ./Frontend/my-app
   npm install

   ```

   3. Build and run the Docker containers:

   ```bash
   docker compose build --no-cache
   docker compose up --build

   ```

## Setup Kubernetes

To deploy using Kubernetes:

1. Apply all the Kubernetes Config Files

   ```bash
   kubectl apply -f .
   ```

2. Apply Metrics Config

   ```bash
   kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

   ```

3. Forward Port for Kubernetes

   ```bash
   kubectl port-forward svc/fastify 3010:3010
   kubectl port-forward svc/frontend 3000:3000
   • Refer to the README in the ./K8 directory for detailed instructions.
   ```
