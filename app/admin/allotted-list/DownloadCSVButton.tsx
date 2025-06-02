// app/admin/allotted-list/DownloadCSVButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { generateAllottedStudentsCSV } from "@/lib/actions"; // Server Action
import { useTransition } from "react";
import { Download } from "lucide-react"; // For icon
import { useToast } from "@/hooks/use-toast";

export default function DownloadCSVButton() {
  const [isDownloading, startDownloadTransition] = useTransition();
  const { toast } = useToast();

  const handleDownload = () => {
    startDownloadTransition(async () => {
      try {
        const csvString = await generateAllottedStudentsCSV();
        if (!csvString) {
          toast({
            title: "No Data",
            description: "No allotted students to download.",
            variant: "default",
          });
          return;
        }

        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
          // feature detection
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", "allotted_mess_cards.csv");
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url); // Clean up
          toast({
            title: "Success",
            description: "CSV download initiated.",
          });
        } else {
          toast({
            title: "Error",
            description: "CSV download not supported by your browser.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error downloading CSV:", error);
        toast({
          title: "Error",
          description: "Failed to generate or download CSV.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Button onClick={handleDownload} disabled={isDownloading}>
      <Download className="mr-2 h-4 w-4" />
      {isDownloading ? "Downloading..." : "Download Allotted List (CSV)"}
    </Button>
  );
}
