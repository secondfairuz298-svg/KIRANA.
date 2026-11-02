datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  GURU_BK
  SISWA
  KONSELOR
  KLIEN_UMUM
}

enum AssessmentType {
  MBTI
  BAKAT_MINAT
  CARA_BELAJAR
  MENTAL_HEALTH
}

model User {
  id              String           @id @default(uuid())
  email           String           @unique
  fullName        String
  title           String?          // Gelar untuk Guru BK / Konselor (cth: S.Psi., M.Pd.)
  studentIdNumber String?          // NISN / NIM untuk Siswa
  role            Role
  avatarUrl       String?          @default("https://api.dicebear.com/7.x/bottts/svg?seed=kirana-default")
  isDualRoleBK    Boolean          @default(false) // Guru BK membuka konseling independen
  counselorBio    String?          @db.Text
  counselingStyle String?          // Gaya pendekatan konseling
  hourlyRate      Decimal?         @db.Decimal(10, 2) // "Red Card" tarif jasa konseling
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relasi
  portfolios      PortfolioItem[]
  ownedRooms      Room[]           @relation("RoomOwner")
  joinedRooms     RoomMember[]
  pointLogs       PointLog[]       @relation("StudentPoints")
  givenPointLogs  PointLog[]       @relation("TeacherPointGiver")
  assessmentSubs  AssessmentSubmission[]
  peerActivities  PeerActivity[]
  sentMessages    ChatMessage[]
  meetingRooms    MeetingRoom[]    @relation("MeetingHost")

  @@index([email])
  @@index([role])
}

model PortfolioItem {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  type        String   // "JURNAL", "ARTIKEL", "SERTIFIKAT"
  fileUrl     String
  createdAt   DateTime @default(now())
}

model Room {
  id          String       @id @default(uuid())
  name        String       // Nama Kelas / Room (dapat diubah)
  code        String       @unique // Digunakan untuk link & QR Code
  teacherId   String
  teacher     User         @relation("RoomOwner", fields: [teacherId], references: [id], onDelete: Cascade)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  members     RoomMember[]

  @@index([teacherId])
}

model RoomMember {
  id        String   @id @default(uuid())
  roomId    String
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  studentId String
  student   User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  joinedAt  DateTime @default(now())

  @@unique([roomId, studentId])
}

model PointLog {
  id          String   @id @default(uuid())
  studentId   String
  student     User     @relation("StudentPoints", fields: [studentId], references: [id], onDelete: Cascade)
  teacherId   String
  teacher     User     @relation("TeacherPointGiver", fields: [teacherId], references: [id], onDelete: Cascade)
  deltaPoints Int      // Positif (prestasi) atau Negatif (pelanggaran)
  reason      String   @db.Text
  createdAt   DateTime @default(now())

  @@index([studentId])
}

model PeerActivity {
  id           String   @id @default(uuid())
  studentId    String
  student      User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  peerName     String
  peerCategory String   // "TEMAN_SEBAYA", "KAKAK_KELAS", "ADIK_KELAS"
  photoUrl     String
  isVerified   Boolean  @default(false)
  createdAt    DateTime @default(now())
}

model AssessmentSubmission {
  id             String         @id @default(uuid())
  userId         String
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  assessmentType AssessmentType
  rawAnswers     Json           // Format: { "q1": 3, "q2": 1, ... }
  calculatedResult Json         // Format: { "mbti": "INFJ", "dominantTrait": "Introversion", ... }
  createdAt      DateTime       @default(now())
}

model MeetingRoom {
  id           String   @id @default(uuid())
  hostId       String
  host         User     @relation("MeetingHost", fields: [hostId], references: [id], onDelete: Cascade)
  name         String   // Nama sesi pertemuan daring
  passwordHash String   // Proteksi password room meeting
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
}

model ChatMessage {
  id         String   @id @default(uuid())
  senderId   String
  sender     User     @relation(fields: [senderId], references: [id], onDelete: Cascade)
  receiverId String
  content    String   @db.Text
  createdAt  DateTime @default(now())
}
