-- AlterTable
ALTER TABLE "jwks" ADD COLUMN     "alg" TEXT,
ADD COLUMN     "crv" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ALTER COLUMN "createdAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");
