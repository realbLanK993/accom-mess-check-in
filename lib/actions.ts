// lib/actions.ts
"use server"; // This should already be at the top of your file

import { PrismaClient, Student } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers"; // Import cookies for login action
import Papa from "papaparse"; // For CSV generation

const prisma = new PrismaClient();

// --- Your existing actions ---
export async function getStudentByRollNo(
  rollNo: string
): Promise<Student | null> {
  // ... (implementation as before)
  if (!rollNo?.trim()) {
    return null;
  }
  try {
    const student = await prisma.student.findUnique({
      where: { rollNo: rollNo.trim().toUpperCase() },
    });
    return student;
  } catch (error) {
    console.error("Error fetching student:", error);
    return null;
  }
}

export async function allotMessCard(
  studentId: string,
  serialNumber: string
): Promise<{ success: boolean; message: string; student?: Student }> {
  // ... (implementation as before)
  if (
    !serialNumber ||
    serialNumber.length !== 4 ||
    !/^\d{4}$/.test(serialNumber)
  ) {
    return { success: false, message: "Serial number must be 4 digits." };
  }

  try {
    const existingCard = await prisma.student.findFirst({
      where: { messCardSerialNumber: serialNumber },
    });
    if (existingCard && existingCard.id !== studentId) {
      return {
        success: false,
        message: `Serial number ${serialNumber} is already allotted to another student (${existingCard.rollNo}).`,
      };
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        messCardSerialNumber: serialNumber,
        messCardAllottedAt: new Date(),
      },
    });
    revalidatePath("/admin/dashboard");
    return {
      success: true,
      message: "Mess card allotted successfully!",
      student: updatedStudent,
    };
  } catch (error: any) {
    console.error("Error allotting mess card:", error);
    if (
      error.code === "P2002" &&
      error.meta?.target?.includes("messCardSerialNumber")
    ) {
      return {
        success: false,
        message: `Serial number ${serialNumber} is already in use.`,
      };
    }
    return {
      success: false,
      message: "Failed to allot mess card. Database error.",
    };
  }
}

export async function handleLogout() {
  const { logout } = await import("@/lib/auth"); // Keep this import dynamic as auth.ts uses cookies()
  await logout();
  revalidatePath("/", "layout");
}

// --- NEW LOGIN ACTION ---
const ADMIN_SESSION_KEY = "admin-session"; // You can centralize this if needed

export async function attemptLogin(
  password: string
): Promise<{ success: boolean; message: string }> {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD environment variable is not set.");
    return { success: false, message: "Server configuration error." };
  }

  if (password === ADMIN_PASSWORD) {
    cookies().set(ADMIN_SESSION_KEY, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    return { success: true, message: "Login successful!" };
  }
  return { success: false, message: "Invalid password." };
}

export async function revokeMessCard(
  studentId: string
): Promise<{ success: boolean; message: string; student?: Student }> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return { success: false, message: "Student not found." };
    }

    if (!student.messCardSerialNumber) {
      return {
        success: false,
        message: "No mess card is currently allotted to this student.",
      };
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        messCardSerialNumber: null, // Set to null
        messCardAllottedAt: null, // Set to null
      },
    });
    revalidatePath("/admin/dashboard"); // Revalidate the dashboard to show updated data
    return {
      success: true,
      message: "Mess card revoked successfully!",
      student: updatedStudent,
    };
  } catch (error) {
    console.error("Error revoking mess card:", error);
    return {
      success: false,
      message: "Failed to revoke mess card. Database error.",
    };
  }
}

export async function getAllottedStudents(): Promise<Student[]> {
  try {
    const students = await prisma.student.findMany({
      where: {
        messCardSerialNumber: {
          not: null, // Students who have a serial number
        },
        messCardAllottedAt: {
          not: null, // And an allotment date
        },
      },
      orderBy: {
        name: "asc", // Or rollNo, or messCardAllottedAt
      },
    });
    return students;
  } catch (error) {
    console.error("Error fetching allotted students:", error);
    return [];
  }
}

// Action to generate CSV string
export async function generateAllottedStudentsCSV(): Promise<string> {
  const students = await getAllottedStudents();
  if (!students.length) {
    return ""; // Return empty string if no students
  }

  // Define CSV headers and data mapping
  const csvData = students.map((student) => ({
    "Roll No.": student.rollNo,
    Name: student.name,
    Department: student.department || "N/A",
    "Allotted Hostel": student.allottedHostel,
    "Room No.": student.roomNo,
    "Mess Card Serial No.": student.messCardSerialNumber,
    "Allotted At": student.messCardAllottedAt
      ? new Date(student.messCardAllottedAt).toLocaleString()
      : "N/A",
    Email: student.email || "N/A",
    "Mobile No.": student.mobileNo || "N/A",
  }));

  return Papa.unparse(csvData);
}
