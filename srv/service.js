const cds = require("@sap/cds");
const mqtt = require("mqtt");

let aDataSet = [];

// Credentials mqtt broker
var oOptions = {
  host: "ac24c670632142bab0a422606038f608.s1.eu.hivemq.cloud",
  port: 8883,
  protocol: "mqtts",
  username: "flexso",
  password: "flexsohtf",
};

// initialize the MQTT client
var client = mqtt.connect(oOptions);

// setup the callbacks
client.on("connect", function () {
  console.log("Connected");
});

client.on("error", function (error) {
  console.log(error);
});

client.on("message", function (topic, message) {
  let jsonS = message.toString();
  let obj = JSON.parse(jsonS);
  obj.datetime = new Date(obj.datetime);
  // BASIC
  // Incoming logs should be added to the existing dataset (aDataset)

  // ADVANCED
  // We only want to register useful data, so negate consecutive flows with zero debit.
  // We do want to know when the flow starts and stops though.
  // Example:
  // Incoming data: 0 - 1 - 2 - 1 - 0 - 0 - 0 - 0 - 0 - 0 - 1 - 2 - 3
  // Result:        0 - 1 - 2 - 1 - 0 -               - 0 - 1 - 2 - 3
  if (
    aDataSet[aDataSet.length - 1]?.flow === 0 &&
    aDataSet[aDataSet.length - 2]?.flow === 0 &&
    obj.flow === 0
  ) {
    aDataSet[aDataSet.length - 1] = obj;
  } else aDataSet.push(obj);

  console.log(aDataSet);
});

// BASIC
// Subscribe to topic '/flowMeter'
client.subscribe("/flowMeter");

// OPTIONAL: Only use when IoT device is not running
// getTestData();

module.exports = (srv) => {
  srv.on("READ", "FlowStream", async (req, res) => {
    let aMockResults = await SELECT.from("FlowStreamService.FlowStream", () => {
      "*";
    });
    let aMockAndRealtimeData = [...aMockResults, ...aDataSet];
    return aMockAndRealtimeData.sort((a, b) => a.datetime > b.datetime);
  });

  srv.on("READ", "FlowHint", async (req, res) => {
    let aQuotes = await SELECT.from("FlowStreamService.FlowHint", () => {
      "*";
    });
    return aQuotes;
  });

  srv.on("READ", "GandalfQuote", async (req, res) => {
    let aQuotes = await SELECT.from("FlowStreamService.GandalfQuote", () => {
      "*";
    });
    return aQuotes;
  });
};

function getTestData() {
  // Create testrecord
  const oTestRecord = {
    flow: _getRndInteger(8, 18), //  low 8-10; normal 10-14, high 14-16 current
    datetime: new Date(),
    descr: "flow in L/min",
  };
  // Add to dataset
  aDataSet.push(oTestRecord);
  // Repeat every 2 seconds
  setTimeout(function () {
    getTestData();
  }, 2000);
}

function _getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
