// app/admin/allotted-list/page.tsx
import { getAllottedStudents } from "@/lib/actions";
import { Student } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // We'll create this client component
import DownloadCSVButton from "./DownloadCSVButton";

export const dynamic = "force-dynamic"; // Ensure fresh data on each request

export default async function AllottedListPage() {
  // const allottedStudents: Student[] = await getAllottedStudents();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <Link href={"/admin/dashboard"}>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </Link>
        <Link href="/admin/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
      <div>Under construction</div>
      {/* {allottedStudents.length > 0 ? (
        <>
          <div className="mb-4 flex justify-end">
            <DownloadCSVButton />
          </div>
          <Table>
            <TableCaption>
              A list of students who have been allotted mess cards.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Mess Card Serial</TableHead>
                <TableHead>Allotted At</TableHead>
                <TableHead>Hostel (Room)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allottedStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.rollNo}
                  </TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.department || "N/A"}</TableCell>
                  <TableCell>{student.messCardSerialNumber}</TableCell>
                  <TableCell>
                    {student.messCardAllottedAt
                      ? new Date(
                          student.messCardAllottedAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {student.allottedHostel} ({student.roomNo})
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <p className="text-center text-gray-500">
          No students have been allotted mess cards yet.
        </p>
      )} */}
    </div>
  );
}
