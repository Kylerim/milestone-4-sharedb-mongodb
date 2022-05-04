var http = require("http");
var express = require("express");
var ShareDB = require("sharedb");
var richText = require("rich-text");
var WebSocket = require("ws");
var WebSocketJSONStream = require("@teamwork/websocket-json-stream");
const { IS_PRODUCTION_MODE, MONGO_IP, SHAREDB_IP } = require("./common.js");

const sharedbmongoose = require("sharedb-mongo");
const args = require("minimist")(process.argv.slice(2));
const PORT = !IS_PRODUCTION_MODE ? 5555 : args.port ? args.port : 5555;

const db = sharedbmongoose(`mongodb://${MONGO_IP}:27017/milestone4`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    getOpsWithoutStrictLinking: true,
});

ShareDB.types.register(richText.type);
var backend = new ShareDB({ presence: true, db });
// createDoc(startServer);
startServer();

function startServer() {
    // Create a web server to serve files and listen to WebSocket connections
    var app = express();
    app.use(express.static("static"));
    app.use(express.static("node_modules/quill/dist"));
    var server = http.createServer(app);

    // Connect any incoming WebSocket connection to ShareDB
    var wss = new WebSocket.Server({ server: server });
    wss.on("connection", function (ws) {
        var stream = new WebSocketJSONStream(ws);
        backend.listen(stream);
        console.log("our main server is now connected to shareDB server");
    });

    // if (IS_PRODUCTION_MODE) {
    //     server.listen(PORT, IP, () => console.log(`CSE356 Milestone 1 ShareDB: listening on port ${PORT}`))
    // } else {
    server.listen(PORT, SHAREDB_IP, () =>
        console.log(`CSE356 Milestone 4 ShareDB: listening on port ${PORT}`)
    );
    // }
}
