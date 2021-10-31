const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors());


app.use('/', express.static('./client'));


app.get('/scripts/pouchdb.js', function(req,res,next){
    res.sendFile(__dirname +'/node_modules/pouchdb/dist/pouchdb.js')
});
app.get('/scripts/socket.js', function(req,res,next){
    res.sendFile(__dirname +'/node_modules/socket.io-client/dist/socket.io.js')
});

const server = http.createServer(app).listen(7788 ,'0.0.0.0', function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", '7788');
});

const io = new Server(server, {
    cors:{
        origin:['http://localhost:7787', 'https://localhost:7798'],
    }
});
io.on('connection', (socket) =>{
    io.emit('connected', 'welcome to socket server @ port:7788');
    // console.log(socket.id);

    socket.on('log', (e)=>{
        io.emit('insert', e);
    })
    
});



