-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "tipe" TEXT NOT NULL DEFAULT 'text';
