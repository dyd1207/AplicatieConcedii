-- AlterTable
ALTER TABLE "LeaveRequest" ADD COLUMN     "endorsedAt" TIMESTAMP(3),
ADD COLUMN     "endorsedById" INTEGER;

-- CreateIndex
CREATE INDEX "LeaveRequest_endorsedById_idx" ON "LeaveRequest"("endorsedById");

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_endorsedById_fkey" FOREIGN KEY ("endorsedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
