## Building the Docker Image

To build the Docker image, navigate to the project directory and run the following command:

```bash
docker build -t ai-grpc .
```

This command builds the Docker image and tags it as `ai-grpc`.

## Running the Docker Container

After building the image, you can run the Docker container with the following command:

```bash
docker run -p 50051:50051 ai-grpc
```

This command maps port **50051** on your host to port **50051** in the container, allowing you to access the gRPC service.

### Troubleshooting

If you encounter an error stating that port **50051** is already allocated, follow these steps:

1. **Check and kill process is using port 50051**:
   ```bash
kill $(lsof -t -i:50051) 
   ```

2. **Try running the container again**.