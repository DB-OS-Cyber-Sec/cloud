# Kubernetes

## 1. Frontend Deployment

- **Purpose:** Serves as the user-facing web application.
- **Replicas:** 2 (for high availability).
- **Port:** 3000.
- **Resource Management:** Defined CPU and memory requests and limits to ensure efficient resource utilization.

---

## 2. Backend Deployment (with Kafka)

- **Purpose:** Handles business logic and message brokering using Kafka.
- **Scalability:** Configured with Horizontal Pod Autoscaler (HPA) to dynamically adjust the number of replicas based on resource utilization.
- **Resource Management:** Allocates appropriate resources to manage incoming requests efficiently.

---

## 3. AI Deployment

- **Purpose:** Provides artificial intelligence capabilities.
- **Scalability:** Equipped with HPA to adjust replicas based on CPU usage, ensuring optimal performance during varying loads.
- **Resource Management:** Includes defined resource requests and limits for efficient operation.

## Docker Hub Push All Containers

```bash

sh push-to-docker-hub.sh
```

## Metrics Server

```bash

kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

## Apply all k8 deployments

```bash

kubectl apply -f .
```

## Delete pods to auto-reload

```bash

kubectl delete pods --all
```

## forward Port for Kubernetes

```bash
kubectl port-forward svc/fastify 3010:3010
kubectl port-forward svc/frontend 3000:3000
```
