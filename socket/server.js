const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);

app.use(express.static('public'));

server.listen(3000, () => console.log('Server running on port 3000'));

const users = {};
const groupMessages = [];

io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);

    socket.on('username', (data) => {
        users[data.name] = socket;
        console.log(`${data.name} connected`);
    });

    socket.on('chatMessage', (data) => {
        console.log('Message: ', data.message);
        groupMessages.push(data);
        io.emit('chatMessage', data);
    });

    socket.on('privateMessage', (data) => {
        const recipientSocket = users[data.recipient];
        if (recipientSocket) {
            recipientSocket.emit('privateMessage', { sender: data.sender, recipient: data.recipient, message: data.message });
        }
    });

    socket.on('requestGroupChatMessages', () => {
        socket.emit('groupChatMessages', groupMessages);
    });

    socket.on('disconnect', () => {
        for (let name in users) {
            if (users[name].id === socket.id) {
                delete users[name];
                break;
            }
        }
        console.log('Socket disconnected', socket.id);
    });
});
