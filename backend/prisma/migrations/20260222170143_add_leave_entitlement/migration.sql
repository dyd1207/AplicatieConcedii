-- CreateTable
CREATE TABLE "LeaveEntitlement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "type" "LeaveType" NOT NULL,
    "annualDays" INTEGER NOT NULL DEFAULT 0,
    "carryoverDays" INTEGER NOT NULL DEFAULT 0,
    "usedDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeaveEntitlement_userId_idx" ON "LeaveEntitlement"("userId");

-- CreateIndex
CREATE INDEX "LeaveEntitlement_year_idx" ON "LeaveEntitlement"("year");

-- CreateIndex
CREATE INDEX "LeaveEntitlement_type_idx" ON "LeaveEntitlement"("type");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveEntitlement_userId_year_type_key" ON "LeaveEntitlement"("userId", "year", "type");

-- AddForeignKey
ALTER TABLE "LeaveEntitlement" ADD CONSTRAINT "LeaveEntitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
