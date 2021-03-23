# IOT-AGENT LORAWAN 1.1

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

1. Create a docker hub repository (name: iotagent-lorawan)
2. Run from parent folder: `docker build -t franciscopuig/iotagent-lorawan -f docker/Dockerfile .`
3. Upload the docker image to Docker Hub: `docker push franciscopuig/iotagent-lorawan`

### Context

### Curl Request

1. Provisioning a device

```
curl --location --request POST 'http://localhost:4041/iot/devices' \
--header 'fiware-service: rabanales' \
--header 'fiware-servicepath: /parcelaOlivar' \
--header 'Content-Type: application/json' \
--data-raw '{
    "devices": [
        {
           "device_id": "humidity001",
           "entity_name": "urn:ngsi-ld:HumiditySensor:humidity001",
            "entity_type": "HumiditySensor",
            "attributes": [
        {
          "object_id": "h",
          "name": "soilMoistureVwc",
          "type": "Property",
          "metadata": { "unitCode": {"type": "Text", "value": "5K" }}
        }
      ],
                "static_attributes": [
          {"name": "refParcel", "type": "Relationship","value": "urn:ngsi-ld:AgriParcel:001"}
       ],
       "internal_attributes": {
          "lorawan": {
            "application_server": {
              "host": "eu.thethings.network",
              "username": <app_id>,
              "password": <ttn access key>,
              "provider": "TTN"
            },
            "app_eui": <app_eui>,
            "application_id": <app_id>,
            "application_key": <app_key>,
            "data_model": "application_server"
          }
      },
      "protocol": "LORAJSON"

        }
    ]
}'
```

2. TheThingsNetwork Payload:

```
function Decoder(bytes, port) {
  switch(port) {
    case 1:
      return {soilMoistureVwc: 22}
  }
}
```
