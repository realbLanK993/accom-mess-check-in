// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const csvFilePath = path.join(__dirname, "students_data.csv");
  if (!fs.existsSync(csvFilePath)) {
    console.error(`CSV file not found at ${csvFilePath}`);
    console.log(
      `Please create 'prisma/students_data.csv' with your student data.`
    );
    console.log(
      `Expected headers: S. No,Roll no.,Name of the Student,Gender,Allotted Hostel,Room no.,Code,Arrival date,Departure date,Allotted Mess,Mess from,Mess to,Remarks,Mess Preference,Mobile no.,Emergency contact,PWD,Age,Email,DataScience/ElectronicSystems Department`
    );
    return;
  }

  const csvFile = fs.readFileSync(csvFilePath, "utf8");

  const parsed = Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    console.error("CSV Parsing errors:", parsed.errors);
    return;
  }

  const studentData = parsed.data as any[];

  for (const student of studentData) {
    const age = parseInt(student["Age"]);
    const email = student["Email"]?.trim() || null;
    const rollNo = student["Roll no."]?.trim();

    if (!rollNo) {
      console.warn(
        `Skipping student with no Roll no.: ${student["Name of the Student"]}`
      );
      continue;
    }

    const existingStudent = await prisma.student.findUnique({
      where: { rollNo: rollNo },
    });

    if (existingStudent) {
      console.log(`Student with Roll No. ${rollNo} already exists. Skipping.`);
      continue;
    }

    // Define the common student data structure once
    const studentCreateData = {
      rollNo: rollNo,
      name: student["Name of the Student"] || "N/A",
      gender: student["Gender"] || "N/A",
      allottedHostel: student["Allotted Hostel"] || "N/A",
      roomNo: student["Room no."] || "N/A", // Ensure this is present
      code: student["Code"],
      arrivalDate: student["Arrival date"],
      departureDate: student["Departure date"],
      allottedMess: student["Allotted Mess"] || "N/A", // Ensure this is present
      messFrom: student["Mess from"],
      messTo: student["Mess to"],
      remarks: student["Remarks"],
      messPreference: student["Mess Preference"],
      mobileNo: student["Mobile no."],
      emergencyContact: student["Emergency contact"],
      pwd: student["PWD"],
      age: isNaN(age) ? null : age,
      email: email, // Initially try with the parsed email
      department: student["DataScience/ElectronicSystems Department"],
    };

    try {
      await prisma.student.create({
        data: studentCreateData,
      });
      console.log(`Created student with Roll No: ${rollNo}`);
    } catch (e: any) {
      if (e.code === "P2002" && e.meta?.target?.includes("rollNo")) {
        console.warn(
          `Student with Roll No. ${rollNo} already exists (caught by DB constraint). Skipping.`
        );
      } else if (e.code === "P2002" && e.meta?.target?.includes("email")) {
        console.warn(
          `Student with email ${email} already exists (caught by DB constraint for student ${rollNo}). Attempting to create with email set to null.`
        );
        await prisma.student
          .create({
            data: {
              ...studentCreateData, // Spread the common data
              email: null, // Override the email
            },
          })
          .catch((finalError) => {
            // Add a catch here in case the second attempt also fails (e.g., rollNo still conflicts if the first check was somehow bypassed)
            console.error(
              `Error creating student ${rollNo} even after setting email to null:`,
              finalError.message
            );
          });
      } else {
        console.error(`Error creating student ${rollNo}:`, e.message);
      }
    }
  }
  console.log(`Seeding finished.`);
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
