require('dotenv').config(); 
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "web-tracker",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"]
});

const producer = kafka.producer();

const initProducer = async () => {
  try {
    await producer.connect();
    console.log("Kafka producer connected ");
  } catch (err) {
    console.error("Kafka connection failed ", err);
  }
};

initProducer();

// Function to send a message to a Kafka topic
const produceEvent = async (topic, message) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }]
    });
    console.log(`Message sent to topic '${topic}'`);
  } catch (err) {
    console.error(`Failed to send message to Kafka:`, err);
  }
};

// Export the function
module.exports = { produceEvent };
