# HTF-2022

## MQTT JS client example
```js
// GIVEN CODE
var mqtt = require('mqtt')

var options = {
    host: 'ac24c670632142bab0a422606038f608.s1.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'flexso',
    password: 'flexsohtf'
}

// initialize the MQTT client
var client = mqtt.connect(options);

// setup the callbacks
client.on('connect', function () {
    console.log('Connected');
});

client.on('error', function (error) {
    console.log(error);
});


// TO COMPLETE
client.on('message', function (topic, message) {
    // called each time a message is received
    console.log('Received message:', topic, message.toString());
});

// subscribe to topic 'my/test/topic'
client.subscribe('my/test/topic');

// publish message 'Hello' to topic 'my/test/topic'
client.publish('my/test/topic', 'Hello');
```
