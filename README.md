# shakti
Yet another Redis pubsub for node.js.

# install
```
npm install shakti
```

# example
```javascript
var Shakti = require('./');                                                                                                                                                       var pubsub = new Shakti();
var http = require('http').createServer(function (req, res) {
  var data = req.url.replace(/.*event=([^&]+)/, '$1') || 'no data';

  // publish data on chatroom 123 channel
  pubsub.publish('chat::room::123', data);

  // publish data on control chatroom channel
  pubsub.publish('chat::room::control', 'control: ' + data);

  res.end(req.body);
});
http.listen(3000);

// connect to redis
pubsub.connect();

// subscribe to all chat events
pubsub.subscribe('chat*', function () {
  console.log('chat*', arguments);
});

// subscribe to all chat events of chatroom #123
pubsub.subscribe('chat::room::123', function () {
  console.log('chat::room::123', arguments);
});
```

# todo
- Write tests.
- Should not systematically JSON.stringify()/JSON.parse(): handle through plugins.

# licence
Copyright 2013 Avétis KAZARIAN

MIT License
