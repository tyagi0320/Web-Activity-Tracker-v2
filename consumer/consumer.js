require("dotenv").config();
const { Kafka } = require("kafkajs");          
const { insertActivity } = require("./db");    

const kafka = new Kafka({
  clientId: "consumer",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"]
});

const consumer = kafka.consumer({ groupId: "activity-group" });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "web-activity", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const data = JSON.parse(message.value.toString());
      console.log("Consumed:", data);
      await insertActivity(data);  
    }
  });
};

run().catch(console.error);
