const express = require("express");
const http = require("http");
const { join } = require("path");
const socketIo = require("socket.io");
const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(join(__dirname, '../client/build')));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, '../client/build/index.html'));
});

const dict = {
  // General inquiries
  "hello": "Hello there! Welcome to [Dealership Name]. How can I help you today?",
  "hi": "Hi there! Welcome to [Dealership Name]. How can I assist you today?",
  "help": "Sure, I'm happy to help. What can I answer for you today?",
  "information": "I'd be happy to provide you with information. What specific information are you looking for?",

  // Car browsing and selection
  "browse": "Certainly! What kind of car are you interested in browsing? We have a wide selection of [Car Brands] to choose from.",
  "models": "Great! What specific models are you interested in? We have a variety of models to suit different needs and budgets.",
  "features": "Tell me more about the features you're looking for, and I'll narrow down our selection to match your preferences.",
  "price": "Price range is an important factor. What is your preferred price range for your new car?",

  // Test drive and purchase
  "test drive": "Absolutely! We'd love to arrange a test drive for you. Please choose a model and a convenient time for your test drive.",
  "purchase": "I'm glad you're interested in purchasing a car from us. Let's discuss the financing options and finalize the purchase process.",
  "trade-in": "Do you have a car to trade in? If so, please provide me with the year, make, and model of your trade-in vehicle.",
  "financing": "We offer various financing options to suit your needs. Let's discuss your credit score, desired down payment, and monthly payment preferences.",

  // Schedule appointment and service
  "appointment": "I'd be happy to schedule an appointment for you. What kind of service do you need?",
  "service": "We offer a wide range of car servicing options, including oil changes, tire rotations, and general maintenance. Please choose the service you need.",
  "maintenance": "Regular maintenance is crucial for keeping your car in top condition. We recommend scheduling maintenance services every [Mileage Interval] miles.",
  "repair": "If your car is experiencing any issues, please describe the problem and we'll schedule a repair appointment for you.",

  // Contact information and feedback
  "contact": "Our contact information is as follows: [Phone Number], [Email Address], [Address]. You can also reach us through our website at [Website Address].",
  "feedback": "We appreciate your feedback. Please feel free to share your thoughts and suggestions on how we can improve our services.",
  "review": "We'd love to hear about your experience at [Dealership Name]. Please leave us a review on [Review Platform].",
  "suggest": "Do you have any suggestions for how we can improve our services or offerings? We value your input.",
}

const userStates = {};

io.on("connection", (socket) => {
  console.log("New client connected");
  userStates[socket.id] = {};

  socket.emit("receiveMessage", { response: "Welcome to [Dealership Name]! Are you looking for a new car today?" });

  socket.on("sendMessage", (message) => {
    let response;
    const lowerMessage = message.toLowerCase();

    if (!userStates[socket.id].context) {
      if (lowerMessage === "yes" || lowerMessage.includes("looking for a car")) {
        response = "Great! What kind of car are you interested in? We have a wide selection of [Car Brands].";
        userStates[socket.id].context = "browsing";
      } else if (lowerMessage === "no" || lowerMessage.includes("not looking today")) {
        response = "No problem! Perhaps you'd like to schedule a service appointment? We offer oil changes, tire rotations, and more.";
        userStates[socket.id].context = "service";
      } else {
        // Check for keywords in the dictionary as before
        response = dict[lowerMessage] || "I'm sorry, I didn't understand that. Could you please provide more details or ask another question?";
      }
    } else {
      // Handle conversation based on context
      switch (userStates[socket.id].context) {
        case "browsing":
          if (lowerMessage.includes("models")) {
            response = "Great! What specific models are you interested in? We have a variety of models to suit different needs and budgets.";
            userStates[socket.id].context = "selecting_model";
          } else if (lowerMessage.includes("features")) {
            response = "Tell me more about the features you're looking for, and I'll narrow down our selection to match your preferences.";
            userStates[socket.id].context = "selecting_features";
          } else if (lowerMessage.includes("price")) {
            response = "Price range is an important factor. What is your preferred price range for your new car?";
            userStates[socket.id].context = "selecting_price";
          } else {
            response = "Can you please specify whether you're interested in models, features, or price?";
          }
          break;
        case "service":
          if (lowerMessage.includes("appointment")) {
            response = "I'd be happy to schedule an appointment for you. What kind of service do you need?";
            userStates[socket.id].context = "scheduling_service";
          } else if (lowerMessage.includes("maintenance")) {
            response = "Regular maintenance is crucial for keeping your car in top condition. We recommend scheduling maintenance services every [Mileage Interval] miles. When would you like to schedule your maintenance?";
            userStates[socket.id].context = "scheduling_maintenance";
          } else if (lowerMessage.includes("repair")) {
            response = "If your car is experiencing any issues, please describe the problem and we'll schedule a repair appointment for you. When would be a convenient time?";
            userStates[socket.id].context = "scheduling_repair";
          } else {
            response = "Can you please specify whether you'd like to schedule an appointment, maintenance, or repair service?";
          }
          break;
        case "selecting_model":
          response = `You selected ${message}. Great choice! Would you like to schedule a test drive or discuss financing options?`;
          userStates[socket.id].context = "next_step";
          break;
        case "selecting_features":
          response = `You are looking for features like ${message}. I'll narrow down the selection for you. Would you like to schedule a test drive or discuss pricing?`;
          userStates[socket.id].context = "next_step";
          break;
        case "selecting_price":
          response = `Your preferred price range is ${message}. I'll find the best options within your budget. Would you like to schedule a test drive or discuss financing options?`;
          userStates[socket.id].context = "next_step";
          break;
        case "scheduling_service":
          response = `You selected ${message} service. When would you like to schedule it?`;
          userStates[socket.id].context = "confirming_service_time";
          break;
        case "scheduling_maintenance":
          response = `You'd like to schedule maintenance. When would be a convenient time for you?`;
          userStates[socket.id].context = "confirming_maintenance_time";
          break;
        case "scheduling_repair":
          response = `You need to schedule a repair for ${message}. When would be a convenient time for you?`;
          userStates[socket.id].context = "confirming_repair_time";
          break;
        case "next_step":
          if (lowerMessage.includes("test drive")) {
            response = "Absolutely! Please provide a convenient time for your test drive.";
            userStates[socket.id].context = "confirming_test_drive";
          } else if (lowerMessage.includes("financing")) {
            response = "Great! Let's discuss your credit score, desired down payment, and monthly payment preferences.";
            userStates[socket.id].context = "discussing_financing";
          } else {
            response = "Would you like to schedule a test drive or discuss financing options?";
          }
          break;
        case "confirming_test_drive":
          response = `Your test drive is scheduled for ${message}. Thank you! Is there anything else I can assist you with?`;
          delete userStates[socket.id].context; // Reset context
          break;
        case "discussing_financing":
          response = `You provided the following details for financing: ${message}. Thank you! Is there anything else I can assist you with?`;
          delete userStates[socket.id].context; // Reset context
          break;
        case "confirming_service_time":
        case "confirming_maintenance_time":
        case "confirming_repair_time":
          response = `Your appointment is scheduled for ${message}. Thank you! Is there anything else I can assist you with?`;
          delete userStates[socket.id].context; // Reset context
          break;
        default:
          response = "I'm sorry, I didn't understand that. Could you please provide more details or ask another question?";
      }
    }

    socket.emit("receiveMessage", { message, response });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});