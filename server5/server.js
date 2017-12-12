/*
 * In Order to run this Demo you must first install the packages needed.
 * You will have to make sure you are in the currect folder where this file
 * is located aling with the package.json
 * in the node terminal window you will need to run the command
 * npm install
 * it will know to find package.json and auto install
 * the files needed to run this sample app.
 */
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 3000}),
    clients = {},
    messages = [];
  
function heartbeat() {
  this.isAlive = true;
}
  
wss.on('connection', function(ws, req) {
    //console.log(ws)
    //console.log(req)
    
    ws.isAlive = true;
    ws.info = {
        user : ''
    };
    // ws.on('pong', heartbeat);
        

    // var index = clients.push(ws) - 1;   
    
    //console.log(wss.clients);       
        
 
    ws.send(messages);
    
    
     ws.on('message', function(message) {
         // console.log('message', message)
       /* var received = JSON.parse(message);
         
         if ( received.type == 'login') {
             ws.info.user = received.user;
             clients[received.user] = ws;
         } else {
            var user = received.user
            var rep = {user: user, message:received.message}
            messages.push(rep);
            console.log('received: %s', received.message);

             wss.clients.forEach(function (conn) {
              conn.send(JSON.stringify(rep));
            });
        }*/
        
    });
});

/*
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping('', false, true);
  });
}, 60000);
*/