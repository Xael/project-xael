// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String    @id
  email            String    @unique
  displayName      String
  firstName        String
  avatarUrl        String?
  strikes          Int       @default(0)
  isBanned         Boolean   @default(false)
  hasAcceptedTerms Boolean   @default(true)
  xp               Int       @default(0)
  level            Int       @default(1)
  settings         Json?     // Stores sectors, themeColor, designStyle, backgroundUrl
  projects         Project[]
  feedItems        HistoryItem[]
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

model Project {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sectorId    String
  title       String
  description String
  imageUrl    String
  year        String
  link        String?
  tags        String[]
  createdAt   DateTime @default(now())
}

model HistoryItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  timestamp Int      // Firebase used number timestamps
  content   String
  userName  String
  type      String
  data      Json     // Stores AI response data
  geometry  Json     // x, y, color, branchId
  votes     Int      @default(0)
  createdAt DateTime @default(now())
}
