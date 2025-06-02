// app/admin/dashboard/page.tsx
"use client";

import { useState, useTransition, FormEvent } from "react";
import { Student } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // <-- Import AlertDialog
import { Label } from "@/components/ui/label";
import {
  getStudentByRollNo,
  allotMessCard,
  revokeMessCard, // <-- Import new action
  handleLogout,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function AdminDashboard() {
  const [rollNo, setRollNo] = useState("");
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [messCardSerial, setMessCardSerial] = useState("");
  const [isSearching, startSearchTransition] = useTransition();
  const [isAllotting, startAllotTransition] = useTransition();
  const [isRevoking, startRevokeTransition] = useTransition(); // <-- New transition state
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const { toast } = useToast();
  const router = useRouter();

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!rollNo.trim()) {
      toast({
        title: "Input Error",
        description: "Please enter a roll number.",
        variant: "destructive",
      });
      return;
    }
    setNotFound(false);
    setSearchedStudent(null);
    startSearchTransition(async () => {
      const student = await getStudentByRollNo(rollNo);
      if (student) {
        setSearchedStudent(student);
      } else {
        setNotFound(true);
        toast({
          title: "Not Found",
          description: `Student with Roll No. ${rollNo} not found.`,
          variant: "default",
        });
      }
    });
  };

  const handleAllotCard = async () => {
    if (!searchedStudent) return;
    if (
      !messCardSerial ||
      messCardSerial.length !== 4 ||
      !/^\d{4}$/.test(messCardSerial)
    ) {
      toast({
        title: "Input Error",
        description: "Mess card serial must be 4 digits.",
        variant: "destructive",
      });
      return;
    }

    startAllotTransition(async () => {
      const result = await allotMessCard(searchedStudent.id, messCardSerial);
      if (result.success && result.student) {
        setSearchedStudent(result.student);
        toast({ title: "Success", description: result.message });
        setMessCardSerial("");
        document.getElementById("closeDialogButton")?.click();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  // --- NEW: Handle Revoke Card ---
  const handleRevokeCard = async () => {
    if (!searchedStudent || !searchedStudent.messCardSerialNumber) return;

    startRevokeTransition(async () => {
      const result = await revokeMessCard(searchedStudent.id);
      if (result.success && result.student) {
        setSearchedStudent(result.student); // Update student data on client
        toast({ title: "Success", description: result.message });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const onLogout = async () => {
    startLogoutTransition(async () => {
      await handleLogout();
      toast({
        title: "Logged Out",
        description: "You have been logged out.",
      });
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          {" "}
          {/* Group buttons */}
          <Link href="/admin/allotted-list">
            <Button variant="secondary">View Allotted List</Button>
          </Link>
          <Button onClick={onLogout} variant="outline" disabled={isLoggingOut}>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6 items-end">
        <div className="flex-grow">
          <Label htmlFor="rollNo">Search Student by Roll No.</Label>
          <Input
            id="rollNo"
            type="text"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value.toUpperCase())}
            placeholder="E.g., B22CS001"
            disabled={isSearching}
          />
        </div>
        <Button type="submit" disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </form>

      {notFound && (
        <p className="text-red-500 text-center">Student not found.</p>
      )}

      {searchedStudent && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {searchedStudent.name} ({searchedStudent.rollNo})
            </CardTitle>
            <CardDescription>
              Department: {searchedStudent.department || "N/A"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Gender:</Label> {searchedStudent.gender}
            </div>
            <div>
              <Label>Email:</Label> {searchedStudent.email || "N/A"}
            </div>
            <div>
              <Label>Mobile No:</Label> {searchedStudent.mobileNo || "N/A"}
            </div>
            <div>
              <Label>Allotted Hostel:</Label> {searchedStudent.allottedHostel} (
              {searchedStudent.roomNo})
            </div>
            <div>
              <Label>Allotted Mess:</Label> {searchedStudent.allottedMess}
            </div>
            {searchedStudent.messFrom && (
              <div>
                <Label>Mess From:</Label> {searchedStudent.messFrom}
              </div>
            )}
            {searchedStudent.messTo && (
              <div>
                <Label>Mess To:</Label> {searchedStudent.messTo}
              </div>
            )}
            {searchedStudent.messCardSerialNumber ? (
              <div className="md:col-span-2 p-3 bg-green-100 rounded-md">
                <p className="font-semibold text-green-700">
                  Mess Card Allotted: #{searchedStudent.messCardSerialNumber}
                </p>
                <p className="text-sm text-green-600">
                  Allotted on:{" "}
                  {new Date(
                    searchedStudent.messCardAllottedAt!
                  ).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="md:col-span-2 p-3 bg-yellow-100 rounded-md">
                <p className="font-semibold text-yellow-700">
                  Mess Card Not Yet Allotted
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {" "}
            {/* Updated for multiple buttons */}
            {!searchedStudent.messCardSerialNumber ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Provide Mess Card</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      Allot Mess Card for {searchedStudent.name}
                    </DialogTitle>
                    <DialogDescription>
                      Enter the 4-digit serial number for the mess card.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="serial" className="text-right">
                        Serial No.
                      </Label>
                      <Input
                        id="serial"
                        value={messCardSerial}
                        onChange={(e) => setMessCardSerial(e.target.value)}
                        className="col-span-3"
                        maxLength={4}
                        placeholder="E.g., 1234"
                        disabled={isAllotting}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        id="closeDialogButton"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="button"
                      onClick={handleAllotCard}
                      disabled={isAllotting || messCardSerial.length !== 4}
                    >
                      {isAllotting ? "Allotting..." : "Allot Card"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              // --- NEW: Revoke Button with AlertDialog ---
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isRevoking}>
                    {isRevoking ? "Revoking..." : "Revoke Mess Card"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will revoke the mess card (
                      <strong>#{searchedStudent.messCardSerialNumber}</strong>)
                      allotted to <strong>{searchedStudent.name}</strong>. This
                      cannot be undone easily (you'll have to re-allot it).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isRevoking}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRevokeCard}
                      disabled={isRevoking}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90" // Keep destructive styling
                    >
                      {isRevoking ? "Revoking..." : "Yes, Revoke Card"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
