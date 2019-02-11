const express = require('express');
const ip = require('ip');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

const users = [];
const messages = [];

function getUserBySocket(socket_id) {
  let user = null;

  users.map(mapUser => {
  	if(mapUser.socket_id === socket_id)
  	  user = mapUser;
  });

  return user;
}

function removeUserBySocket(socket_id) {
  users.map((mapUser, index) => {
  	if(mapUser.socket_id === socket_id)
  	  users.splice(index, 1);
  });
}

app.listen(80, () => {
  server.listen(3000, () => {
    console.log(`Running at ${ip.address()}`);
  });
});

io.on('connection', socket => {
  socket.on('user-connect', user => {
  	users.push({ name: user.name, imageUrl: user.imageUrl, socket_id: socket.id });
  	io.sockets.emit('users-connected', users);
  	io.sockets.emit('old-messages', messages);
  });

  socket.on('message', text => {
  	const user = getUserBySocket(socket.id);
  	messages.push({ user, text });
  	console.log(`${user.name} > ${text}`);
  	io.sockets.emit('new-message', { user, text });
  });

  socket.on('disconnect', () => {
  	removeUserBySocket(socket.id);
  	io.sockets.emit('users-connected', users);
  });
});