-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('PERSONAL', 'BANK', 'CREDIT_CARD', 'FRIEND_FAMILY', 'MORTGAGE', 'VEHICLE', 'STUDENT', 'BUSINESS', 'OTHER');

-- CreateEnum
CREATE TYPE "LoanInterestType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "LoanInterestFrequency" AS ENUM ('ONE_TIME', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "LoanRepaymentFrequency" AS ENUM ('ONE_TIME', 'DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "LoanInstallmentType" AS ENUM ('FIXED', 'VARIABLE');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'LOAN_PAYMENT_DUE';
ALTER TYPE "NotificationType" ADD VALUE 'LOAN_PAYMENT_OVERDUE';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "isLoanPayment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "loanPaymentId" TEXT;

-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "notifyLoanPaymentReminder" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lenderName" TEXT NOT NULL,
    "loanType" "LoanType" NOT NULL,
    "principalAmount" DECIMAL(14,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "hasInterest" BOOLEAN NOT NULL DEFAULT false,
    "interestType" "LoanInterestType",
    "interestValue" DECIMAL(14,2),
    "interestFrequency" "LoanInterestFrequency",
    "repaymentFrequency" "LoanRepaymentFrequency" NOT NULL,
    "customRepaymentDays" INTEGER,
    "installmentType" "LoanInstallmentType" NOT NULL,
    "totalInstallments" INTEGER NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_repayment_schedules" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "principalComponent" DECIMAL(14,2) NOT NULL,
    "interestComponent" DECIMAL(14,2) NOT NULL,
    "totalDue" DECIMAL(14,2) NOT NULL,
    "amountPaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_repayment_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_payments" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "paidDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loans_userId_idx" ON "loans"("userId");

-- CreateIndex
CREATE INDEX "loans_userId_status_idx" ON "loans"("userId", "status");

-- CreateIndex
CREATE INDEX "loan_repayment_schedules_userId_idx" ON "loan_repayment_schedules"("userId");

-- CreateIndex
CREATE INDEX "loan_repayment_schedules_userId_dueDate_idx" ON "loan_repayment_schedules"("userId", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "loan_repayment_schedules_loanId_installmentNumber_key" ON "loan_repayment_schedules"("loanId", "installmentNumber");

-- CreateIndex
CREATE INDEX "loan_payments_loanId_idx" ON "loan_payments"("loanId");

-- CreateIndex
CREATE INDEX "loan_payments_userId_idx" ON "loan_payments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_loanPaymentId_key" ON "transactions"("loanPaymentId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_loanPaymentId_fkey" FOREIGN KEY ("loanPaymentId") REFERENCES "loan_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_repayment_schedules" ADD CONSTRAINT "loan_repayment_schedules_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_repayment_schedules" ADD CONSTRAINT "loan_repayment_schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_payments" ADD CONSTRAINT "loan_payments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_payments" ADD CONSTRAINT "loan_payments_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "loan_repayment_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_payments" ADD CONSTRAINT "loan_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

