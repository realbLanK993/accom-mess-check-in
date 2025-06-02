"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, User, Phone, Mail, Home, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StudentData {
  sNo: string;
  rollNo: string;
  name: string;
  gender: string;
  allottedHostel: string;
  roomNo: string;
  code: string;
  arrivalDate: string;
  departureDate: string;
  allottedMess: string;
  messFrom: string;
  messTo: string;
  remarks: string;
  messPreference: string;
  mobileNo: string;
  emergencyContact: string;
  pwd: string;
  age: string;
  email: string;
}

export default function StudentSearch() {
  const [searchRollNo, setSearchRollNo] = useState("");
  const [searchResults, setSearchResults] = useState<StudentData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [studentData, setStudentData] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        // Fetch the CSV file from the public directory
        const response = await fetch("/students.csv");
        if (!response.ok) {
          throw new Error("Failed to load student data");
        }

        const csvText = await response.text();
        const parsedData = parseCSV(csvText);

        if (parsedData.length === 0) {
          throw new Error("No valid data found in the CSV file");
        }

        setStudentData(parsedData);
        setError("");
      } catch (err) {
        setError(
          `Error loading student data: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadStudentData();
  }, []);

  const parseCSV = (csvText: string): StudentData[] => {
    const lines = csvText.split("\n").filter((line) => line.trim() !== "");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const data: StudentData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
      if (values.length >= headers.length) {
        const student: StudentData = {
          sNo: values[0] || "",
          rollNo: values[1] || "",
          name: values[2] || "",
          gender: values[3] || "",
          allottedHostel: values[4] || "",
          roomNo: values[5] || "",
          code: values[6] || "",
          arrivalDate: values[7] || "",
          departureDate: values[8] || "",
          allottedMess: values[9] || "",
          messFrom: values[10] || "",
          messTo: values[11] || "",
          remarks: values[12] || "",
          messPreference: values[13] || "",
          mobileNo: values[14] || "",
          emergencyContact: values[15] || "",
          pwd: values[16] || "",
          age: values[17] || "",
          email: values[18] || "",
        };
        data.push(student);
      }
    }
    return data;
  };

  const handleSearch = () => {
    if (!searchRollNo.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const results = studentData.filter((student) =>
      student.rollNo.toLowerCase().includes(searchRollNo.toLowerCase())
    );
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Student Hostel Management System</h1>
        <p className="text-muted-foreground">
          Search for student information by roll number
        </p>
      </div>

      {/* Status Section */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Loading student data...</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Successfully loaded {studentData.length} student records from
            students.csv
          </AlertDescription>
        </Alert>
      )}

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Student
          </CardTitle>
          <CardDescription>
            Enter the roll number to find student details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter roll number (e.g., CS2021001)"
              value={searchRollNo}
              onChange={(e) => setSearchRollNo(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isLoading || !!error}
            />
            <Button onClick={handleSearch} disabled={isLoading || !!error}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {searchResults.length === 0
                ? `No student found with roll number "${searchRollNo}"`
                : `Found ${searchResults.length} student(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchResults.length > 0 ? (
              <div className="space-y-6">
                {searchResults.map((student, index) => (
                  <div key={`${student.rollNo}-${index}`} className="space-y-4">
                    {/* Student Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Personal Info
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <strong>Name:</strong> {student.name}
                          </div>
                          <div>
                            <strong>Roll No:</strong> {student.rollNo}
                          </div>
                          <div>
                            <strong>Gender:</strong> {student.gender}
                          </div>
                          <div>
                            <strong>Age:</strong> {student.age}
                          </div>
                          <div className="flex items-center gap-2">
                            <strong>PWD:</strong>
                            <Badge
                              variant={
                                student.pwd.toLowerCase() === "yes"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {student.pwd}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Hostel Info
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <strong>Hostel:</strong> {student.allottedHostel}
                          </div>
                          <div>
                            <strong>Room No:</strong> {student.roomNo}
                          </div>
                          <div>
                            <strong>Code:</strong> {student.code}
                          </div>
                          <div>
                            <strong>Arrival:</strong> {student.arrivalDate}
                          </div>
                          <div>
                            <strong>Departure:</strong> {student.departureDate}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">
                            Contact Info
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span className="text-sm">{student.mobileNo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span className="text-sm break-all">
                              {student.email}
                            </span>
                          </div>
                          <div>
                            <strong>Emergency:</strong>{" "}
                            {student.emergencyContact}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Detailed Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Complete Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Field</TableHead>
                                <TableHead>Value</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">
                                  S. No
                                </TableCell>
                                <TableCell>{student.sNo}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Roll No.
                                </TableCell>
                                <TableCell>{student.rollNo}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Name of the Student
                                </TableCell>
                                <TableCell>{student.name}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Gender
                                </TableCell>
                                <TableCell>{student.gender}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Allotted Hostel
                                </TableCell>
                                <TableCell>{student.allottedHostel}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Room No.
                                </TableCell>
                                <TableCell>{student.roomNo}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Code
                                </TableCell>
                                <TableCell>{student.code}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Arrival Date
                                </TableCell>
                                <TableCell>{student.arrivalDate}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Departure Date
                                </TableCell>
                                <TableCell>{student.departureDate}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Allotted Mess
                                </TableCell>
                                <TableCell>{student.allottedMess}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Mess From
                                </TableCell>
                                <TableCell>{student.messFrom}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Mess To
                                </TableCell>
                                <TableCell>{student.messTo}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Remarks
                                </TableCell>
                                <TableCell>{student.remarks}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Mess Preference
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      student.messPreference.toLowerCase() ===
                                      "vegetarian"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {student.messPreference}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Mobile No.
                                </TableCell>
                                <TableCell>{student.mobileNo}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Emergency Contact
                                </TableCell>
                                <TableCell>
                                  {student.emergencyContact}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  PWD
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      student.pwd.toLowerCase() === "yes"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {student.pwd}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Age
                                </TableCell>
                                <TableCell>{student.age}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Email
                                </TableCell>
                                <TableCell className="break-all">
                                  {student.email}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No student found with the provided roll number.</p>
                <p className="text-sm">
                  Please check the roll number and try again.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
