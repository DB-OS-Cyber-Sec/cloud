docker tag cloud-kafka pot4t0/cloud15:kafka
docker build -t pot4t0/cloud15:fastify ../Backend
docker build -t pot4t0/cloud15:ai ../AI-grpc
docker build -t pot4t0/cloud15:frontend ../Frontend/my-app
docker push pot4t0/cloud15:kafka
docker push pot4t0/cloud15:fastify
docker push pot4t0/cloud15:ai
docker push pot4t0/cloud15:frontend