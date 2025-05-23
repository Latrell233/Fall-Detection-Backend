const mqtt = require('mqtt');
const config = require('../../config/config');

class MQTTService {
  constructor() {
    this.client = null;
    this.connectOptions = {
      keepalive: 60,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      clean: true
    };
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(config.mqtt.brokerUrl, this.connectOptions);

      this.client.on('connect', () => {
        console.log('Connected to MQTT broker');
        this.subscribeTopics();
        resolve();
      });

      this.client.on('error', (err) => {
        console.error('MQTT connection error:', err);
        reject(err);
      });

      this.client.on('reconnect', () => {
        console.log('Reconnecting to MQTT broker...');
      });

      this.client.on('close', () => {
        console.log('Disconnected from MQTT broker');
      });
    });
  }

  subscribeTopics() {
    // Subscribe to device status topic
    this.client.subscribe(config.mqtt.topics.deviceStatus, { qos: 1 }, (err) => {
      if (err) {
        console.error('Failed to subscribe to device status topic:', err);
      } else {
        console.log(`Subscribed to topic: ${config.mqtt.topics.deviceStatus}`);
      }
    });

    // Set message handler
    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });
  }

  handleMessage(topic, message) {
    try {
      const payload = JSON.parse(message.toString());
      console.log(`Received message on ${topic}:`, payload);

      // Add your message handling logic here
      // Example: update device status in database
    } catch (err) {
      console.error('Error processing MQTT message:', err);
    }
  }

  async publishAlert(alertData) {
    if (!this.client || !this.client.connected) {
      throw new Error('MQTT client not connected');
    }

    return new Promise((resolve, reject) => {
      this.client.publish(
        config.mqtt.topics.fallAlert,
        JSON.stringify(alertData),
        { qos: 1, retain: false },
        (err) => {
          if (err) {
            console.error('Failed to publish alert:', err);
            reject(err);
          } else {
            console.log('Alert published successfully');
            resolve();
          }
        }
      );
    });
  }

  async disconnect() {
    return new Promise((resolve) => {
      if (this.client) {
        this.client.end(false, () => {
          console.log('MQTT client disconnected');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Singleton instance
const mqttService = new MQTTService();

module.exports = mqttService;