/*
 * Copyright 2019 Atos Spain S.A
 *
 * This file is part of iotagent-lora
 *
 * iotagent-lora is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * iotagent-lora is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with iotagent-lora.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 */

const winston = require('winston');
const appService = require('./abstractAppService');
const mqttClient = require('../bindings/mqttClient');

/**
 *Class that represents a TTN LoRaWAN app server
 */
class TtsV3AppService extends appService.AbstractAppService {
	/**
	 * Constructs the object.
	 *
	 * @param      {String}  applicationServer  The application server
	 * @param      {String}  appEui             The application eui
	 * @param      {String}  applicationId      The application identifier
	 * @param      {String}  applicationKey     The application key
	 * @param      {Function}  messageHandler     The message handler
	 * @param      {String}  dataModel     The data model
	 * @param      {Object}  iotaConfiguration     The IOTA configuration associated to this Application Server.
	 */
	constructor(
		applicationServer,
		appEui,
		applicationId,
		applicationKey,
		messageHandler,
		dataModel,
		iotaConfiguration
	) {
		if (!applicationId) {
			throw new Error('applicationId is mandatory for TTN');
		}

		super(applicationServer, appEui, applicationId, applicationKey, messageHandler, dataModel, iotaConfiguration);
	}

	/**
	 * It starts the TTN Application Service interface
	 *
	 * @param      {Function}  callback  The callback
	 */
	start(callback) {
		this.preProcessMessage = this.preProcessMessage.bind(this);
		this.mqttClient = new mqttClient.MqttClient(
			this.applicationServer.host,
			this.applicationServer.username,
			this.applicationServer.password,
			this.preProcessMessage
		);

		this.mqttClient.start(callback);
	}

	/**
	 * It stops the TTN Application Service interface
	 *
	 * @param      {Function}  callback  The callback
	 */
	stop(callback) {
		this.stopObserveAllDevices();
		this.mqttClient.stop(callback);
	}

	/**
	 * It processes a message received from a TTN Application Service
	 *
	 * @param      {<type>}  mqttTopic  The mqtt topic
	 * @param      {<type>}  message    The message
	 */
	preProcessMessage(mqttTopic, message) {
		winston.info('New message in topic', mqttTopic);
		const splittedMqttTopic = mqttTopic.split('/');
		if (splittedMqttTopic.length !== 5) {
			const errorMessage = 'Bad format for a TTN topic';
			winston.error(errorMessage);
		} else {
			// var appId = splittedMqttTopic[0];
			const deviceId = splittedMqttTopic[3];
			try {
				message = JSON.parse(message);
			} catch (e) {
				winston.error('Error decoding message:' + e);
				message = null;
				return;
			}

			const dataModel = this.getDataModel(deviceId, null);

			if (message) {
				let deviceEui;
				if (message.end_device_ids) {
					deviceEui = message.end_device_ids.device_id;
				}

				if (message.uplink_message) {
					this.messageHandler(this, deviceId, deviceEui, message.uplink_message.decoded_payload);
				} // } else if (message.payload_raw) {
				//     this.messageHandler(this, deviceId, deviceEui, message.payload_raw);
				// } else {
				//     this.messageHandler(this, deviceId, deviceEui, null);
				// }
			} else {
				this.messageHandler(this, deviceId, null, null);
			}
		}
	}

	/**
	 * It observes a new device. Abstract method
	 *
	 * @param      {string}  devId         The development identifier
	 * @param      {String}  devEUI         The development identifier
	 * @param      {<type>}  deviceObject  The device object
	 */
	/* eslint-disable-next-line no-unused-vars */
	observeDevice(devId, devEUI, deviceObject) {
		const mqttTopic = 'v3/' + this.applicationId + '/devices/' + devId + '/up';
		this.mqttClient.subscribeTopic(mqttTopic);
		winston.info('Mqtt topic subscribed:%s', mqttTopic);
	}

	/**
	 * It stops observing a device. Abstract method
	 *
	 * @param      {string}  devId         The development identifier
	 * @param      {String}  devEUI         The development identifier
	 * @param      {<type>}  deviceObject  The device object
	 */
	/* eslint-disable-next-line no-unused-vars */
	stopObservingDevice(devId, devEUI, deviceObject) {
		const mqttTopic = 'v3/' + this.applicationId + '/devices/' + devId + '/up';
		this.mqttClient.unSubscribeTopic(mqttTopic);
		winston.info('Mqtt topic unsubscribed:%s', mqttTopic);
	}

	/**
	 * It observes all devices
	 */
	observeAllDevices() {
		const mqttTopic = 'v3/' + this.applicationId + '/devices/+/up';
		this.mqttClient.subscribeTopic(mqttTopic);
		winston.info('Mqtt topic subscribed:%s', mqttTopic);
	}

	/**
	 * It stops observing all devices.
	 */
	stopObserveAllDevices() {
		const mqttTopic = 'v3/' + this.applicationId + '/devices/+/up';
		this.mqttClient.unSubscribeTopic(mqttTopic);
		winston.info('Mqtt topic unsubscribed:%s', mqttTopic);
	}
}

exports.TtsV3AppService = TtsV3AppService;
