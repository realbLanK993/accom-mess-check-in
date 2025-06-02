-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "rollNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "allottedHostel" TEXT NOT NULL,
    "roomNo" TEXT NOT NULL,
    "code" TEXT,
    "arrivalDate" TEXT,
    "departureDate" TEXT,
    "allottedMess" TEXT NOT NULL,
    "messFrom" TEXT,
    "messTo" TEXT,
    "remarks" TEXT,
    "messPreference" TEXT,
    "mobileNo" TEXT,
    "emergencyContact" TEXT,
    "pwd" TEXT,
    "age" INTEGER,
    "email" TEXT,
    "department" TEXT,
    "messCardSerialNumber" TEXT,
    "messCardAllottedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_rollNo_key" ON "Student"("rollNo");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_messCardSerialNumber_key" ON "Student"("messCardSerialNumber");
