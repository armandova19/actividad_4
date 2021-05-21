var app = require('express')(); 
var http = require('http').Server(app);
var io = require('socket.io')(http); 
var mysql = require('mysql');
const { createConnection } = require('net');

var conn = mysql.createConnection({
    host: 'localhost',
    database: 'chat_progra',
    user: 'root',
    password: ''
});

conn.connect(function(err){
    if(err){
        throw err;
    }else{
        console.log('conexion exitosa');
    }
});



app.get('/', function(req, res){
    res.sendFile(__dirname + '/chat.html');
});


io.on('connection', function(socket){ 
    console.log('Un usuario se ha conectado.');

    var username;

    socket.on('crearUser',function(data){
        username = data;
        conn.query('INSERT INTO usuarios (nombre_usuario, fecha) values ("'+ username 
        +'", CURDATE())');
    });

    socket.on('mjsNuevo', function(data){ 

        socket.broadcast.emit('mensaje', {
            usuario: username,
            mensaje: data

        });
        socket.emit('mensaje', {
            usuario: username,
            mensaje: data
        });
    });
});




http.listen(3000, function(){ 
    console.log("Servidor en marcha por puerto 3000");
});
