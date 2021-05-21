var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
/////
var app = require('express')(); 
var http = require('http').Server(app);
var io = require('socket.io')(http); 
var mysql = require('mysql');
const { createConnection } = require('net');


var connection = mysql.createConnection({
host     : 'localhost',
user     : 'root',
password : '',
database : 'nodelogin'
});

connection.connect(function(err){
    if(err){
        throw err;
    }else{
        console.log('conexion exitosa');
    }
});
//Express es lo que usaremos para nuestras aplicaciones web, esto incluye paquetes útiles en el desarrollo web, como sesiones y manejo de solicitudes HTTP, para inicializarlo podemos hacer:
var app = express();


app.use(session({
secret: 'secret',
resave: true,
saveUninitialized: true
}));


app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/login.html')); 
});


app.post('/auth', function(request, response) {
    var username = request.body.username; 
    var password = request.body.password; 

    if (username && password) { 
        
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
        if (results.length > 0) { 
            request.session.loggedin = true; 
            request.session.username = username; // Asignamos el nombre de usuario a una variable de sesión.
            response.redirect('/chat'); 
        } else {
            response.send('Usuarios y/o contraseña incorrectos!'); 
        }
        response.end(); 
        });
    } else {
        response.send('Ingresa usuario y contraseña!'); 
        response.end(); 
    }
});
/*regitro*/
app.post('/registrar', function(request, response) {
    var username = request.body.username; 
    var password = request.body.password; 
    var email = request.body.email;

    if (username && password && email) { 
        
        connection.query('SELECT * FROM accounts WHERE username = ? OR email = ?', [username, email], function(error, results, fields) {
        if (results.length > 0) { 
            response.send('Error, usuario ya existente');
        } else {
            connection.query('insert into accounts(username, password, email) values(?,?,?)', [username, password,email],
            function(error, results, fields){
                if(!error){
                    response.send('te has registrado ');
                }else{
                    response.send('ocurrio un error');
                }
            });
        }
        //response.end(); 
        });
    } else {
        response.send('Ingresa datos en todos los campos!'); 
        //response.end(); 
    }
});

/*app.get('/home', function(request, response) {
if (request.session.loggedin) { 
 response.send('Bienvenido de nuevo, ' + request.session.username + '! <br><br> <a href="/logout" class="btn btn-success">Cerrar sesión</a>'); 
} else {
    response.send('Iniciar sesión de nuevo, por favor!'); 
}
response.end(); 
});*/
/////chat
app.get('/chat', function(request, response) {
    if (request.session.loggedin) { 

     response.sendFile(path.join(__dirname + '/chat.html'));
    } else {
        response.send('Iniciar sesión de nuevo, por favor!'); 
    }
    //response.end(); 
});
////registrar
app.get('/registrar', function(request, response) {
    if (request.session.loggedin) { 
        response.sendFile(path.join(__dirname + '/register.html'));
    } else {
        response.send('Iniciar sesión de nuevo, por favor!'); 
    }
    //response.end(); 
});
// Cerrar sesión 
app.get('/logout', function (request, response) {
  request.session.destroy();
  response.send('Sesión terminada correctamente <br><br> <a href="/" class="btn btn-success">Inicar sesión de nuevo.</a>');
});


app.listen(3000, function(){
console.log('Puesto en marcha el server en puerto 3000');
});


/////////////////////////////////////////
/*var app = require('express')(); 
var http = require('http').Server(app);
var io = require('socket.io')(http); 
var mysql = require('mysql');
const { createConnection } = require('net');
*/
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
        console.log('conexion exitosa2');
    }
});



/*app.get('/', function(req, res){
    res.sendFile(__dirname + '/chat.html');
});*/


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