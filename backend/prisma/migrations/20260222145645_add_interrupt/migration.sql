-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'INTERRUPTED';

-- AlterTable
ALTER TABLE "LeaveRequest" ADD COLUMN     "interruptedAt" TIMESTAMP(3),
ADD COLUMN     "interruptedById" INTEGER;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_interruptedById_fkey" FOREIGN KEY ("interruptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
