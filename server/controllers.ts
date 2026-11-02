import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ==================== 1. MANAJEMEN AKUN & AUTENTIKASI ====================
export const authenticateUser = async (req: Request, res: Response) => {
  const { email, fullName, role, title, studentIdNumber } = req.body;
  try {
    // Persistent Login: Cek apakah akun dengan email ini sudah ada
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Pendaftaran pertama atau pendaftaran ulang setelah dihapus
      user = await prisma.user.create({
        data: {
          email,
          fullName,
          role,
          title: role === Role.GURU_BK || role === Role.KONSELOR ? title : null,
          studentIdNumber: role === Role.SISWA ? studentIdNumber : null
        }
      });
    }

    return res.status(200).json({ success: true, user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    // Hapus total data terkait (Cascade Delete di Prisma)
    await prisma.user.delete({ where: { id: userId } });
    return res.status(200).json({ message: 'Akun berhasil dihapus. Pendaftaran ulang dengan email ini tetap diizinkan.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==================== 2. FITUR GURU BK: RUANG KELAS & POIN ====================
export const createClassRoom = async (req: Request, res: Response) => {
  const { teacherId, roomName } = req.body;
  try {
    // Validasi batas maksimal 5 kelas per Guru BK
    const currentRoomsCount = await prisma.room.count({ where: { teacherId } });
    if (currentRoomsCount >= 5) {
      return res.status(400).json({ error: 'Batas maksimal 5 kelas telah tercapai untuk akun ini.' });
    }

    const uniqueCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const newRoom = await prisma.room.create({
      data: {
        name: roomName,
        code: uniqueCode,
        teacherId
      }
    });

    return res.status(201).json({
      room: newRoom,
      joinLink: `${process.env.APP_FRONTEND_URL}/join/${uniqueCode}`
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateClassRoomName = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { newName } = req.body;
  try {
    const updated = await prisma.room.update({
      where: { id: roomId },
      data: { name: newName }
    });
    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const recordPointAction = async (req: Request, res: Response) => {
  const { studentId, teacherId, deltaPoints, reason } = req.body;

  if (!reason || reason.trim() === '') {
    return res.status(400).json({ error: 'Alasan perubahan poin wajib dicantumkan.' });
  }

  try {
    const log = await prisma.pointLog.create({
      data: { studentId, teacherId, deltaPoints, reason }
    });

    // Peringatan otomatis jika terjadi penurunan poin drastis (<= -15 poin)
    let alertTriggered = false;
    if (deltaPoints <= -15) {
      alertTriggered = true;
      // Di sini dapat dihubungkan ke service push-notification / webhook
    }

    return res.status(201).json({ success: true, log, alertTriggered });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==================== 3. DIREKTORI KONSELOR (PRIVASI TERJAGA) ====================
export const getPublicCounselorsDirectory = async (_req: Request, res: Response) => {
  try {
    // Tampilkan konselor murni atau Guru BK yang mengaktifkan opsi konselor independen
    const counselors = await prisma.user.findMany({
      where: {
        OR: [
          { role: Role.KONSELOR },
          { role: Role.GURU_BK, isDualRoleBK: true }
        ]
      },
      select: {
        id: true,
        fullName: true,
        title: true,
        avatarUrl: true,
        counselorBio: true,
        counselingStyle: true,
        hourlyRate: true,
        portfolios: {
          select: {
            id: true,
            title: true,
            type: true,
            fileUrl: true
          }
        }
        // Catatan: email, nomor identitas, dan data privat tidak disertakan
      }
    });

    return res.status(200).json(counselors);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==================== 4. ASESMEN MBTI ENGINE ====================
export const evaluateMBTI = async (req: Request, res: Response) => {
  const { userId, answers } = req.body; 
  // answers: Array of 100 objek [{ questionIndex: number, dimension: 'EI'|'SN'|'TF'|'JP', value: 1 | -1 }]
  
  try {
    let score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    answers.forEach((ans: { dimension: string; value: number }) => {
      if (ans.dimension === 'EI') ans.value > 0 ? score.E++ : score.I++;
      if (ans.dimension === 'SN') ans.value > 0 ? score.S++ : score.N++;
      if (ans.dimension === 'TF') ans.value > 0 ? score.T++ : score.F++;
      if (ans.dimension === 'JP') ans.value > 0 ? score.J++ : score.P++;
    });

    const mbtiResult = [
      score.E >= score.I ? 'E' : 'I',
      score.S >= score.N ? 'S' : 'N',
      score.T >= score.F ? 'T' : 'F',
      score.J >= score.P ? 'J' : 'P'
    ].join('');

    const submission = await prisma.assessmentSubmission.create({
      data: {
        userId,
        assessmentType: 'MBTI',
        rawAnswers: answers,
        calculatedResult: { mbti: mbtiResult, breakdown: score }
      }
    });

    return res.status(200).json(submission);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
