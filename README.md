# IOT-AGENT LORAWAN

This repository is forked from Atos-Research-and-Innovation/IoTagent-LoRaWAN

The main objective is support NGSI-LD

## Updates

1. Update iotagent-node-lib to the latest version: `^2.15.0`
2. change the default config:

```
ngsiVersion: 'ld',
		jsonLdContext: <datamodel URL>,
```

2. Update docker image

### Docker-compose

1. Create a docker hub repository
2. Run from parent folder: `docker build -t iot-agent -f docker/Dockerfile .`
3. Rename the imagen created with the repositoy name:`docker tag iot-agent:latest franciscopuig/iotagent-lorawan``
4. Upload the docker image to Docker Hub: `docker push franciscopuig/iotagent-lorawan`
