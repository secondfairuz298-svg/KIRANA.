import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Mapping sesi socket aktif
const activeUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket: Socket) => {
  // 1. Registrasi Socket User
  socket.on('register-user', (userId: string) => {
    activeUsers.set(userId, socket.id);
    socket.data.userId = userId;
  });

  // 2. Chat 1-on-1
  socket.on('send-direct-message', async (data: { senderId: string; receiverId: string; message: string }) => {
    const savedMsg = await prisma.chatMessage.create({
      data: {
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.message
      }
    });

    const receiverSocketId = activeUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new-direct-message', savedMsg);
    }
    socket.emit('message-sent', savedMsg);
  });

  // 3. WebRTC 1-on-1 Signaling (Voice & Video)
  socket.on('call-user', (data: { userToCall: string; signalData: any; from: string; isVideo: boolean }) => {
    const receiverSocketId = activeUsers.get(data.userToCall);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incoming-call', {
        signal: data.signalData,
        from: data.from,
        isVideo: data.isVideo
      });
    }
  });

  socket.on('answer-call', (data: { to: string; signal: any }) => {
    const callerSocketId = activeUsers.get(data.to);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-accepted', data.signal);
    }
  });

  socket.on('end-call', (data: { to: string }) => {
    const targetSocketId = activeUsers.get(data.to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-ended');
    }
  });

  // 4. Konferensi Terproteksi (Zoom-style Group Video Meeting)
  socket.on('join-meeting-room', async (data: { meetingId: string; password: string; userId: string; peerId: string }) => {
    const meeting = await prisma.meetingRoom.findUnique({ where: { id: data.meetingId } });
    if (!meeting || !meeting.isActive) {
      return socket.emit('meeting-error', 'Ruang pertemuan tidak ditemukan atau sudah ditutup.');
    }

    const isMatch = await bcrypt.compare(data.password, meeting.passwordHash);
    if (!isMatch) {
      return socket.emit('meeting-error', 'Sandi ruang pertemuan salah.');
    }

    socket.join(data.meetingId);
    socket.to(data.meetingId).emit('user-joined-meeting', {
      userId: data.userId,
      peerId: data.peerId
    });

    socket.on('disconnect', () => {
      socket.to(data.meetingId).emit('user-left-meeting', data.peerId);
    });
  });

  socket.on('disconnect', () => {
    if (socket.data.userId) {
      activeUsers.delete(socket.data.userId);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server KIRANA aktif di port ${PORT}`);
});