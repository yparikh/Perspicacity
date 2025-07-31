import react, { useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import { z } from "zod";

import UploadDialog from "./UploadDialog";
import DataTable from "./DataTable";
import { Button } from "./ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function UploadForm() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [previewData, setPreviewData] = useState<any[][]>([]);
  const [headers, setHeaders] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const RowSchema = z.object({
    dates: z.coerce.date(),
    category: z.string(),
    amount: z.coerce.number(),
    description: z.string(),
  });

  type Row = z.infer<typeof RowSchema>;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("Selected file:", file);
    if (file) {
      setFile(file);
      console.log("file selected in handleFileChange:", file.name);
    } else setFile(undefined);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handleSubmit triggered");
    console.log("file state at submit:", file);
    if (!file) {
      return;
    }

    console.log("Submitting with file:", file?.name);
    setLoading(true);
    Papa.parse(file, {
      complete: async (result: Papa.ParseResult<any>) => {
        console.log("Parsed data:", result.data);
        setPreviewData(result.data);

        try {
          const validRows: Row[] = [];
          const invalidRows: any[] = [];

          for (const row of result.data) {
            const parsed = RowSchema.safeParse(row);
            if (parsed.success) {
              validRows.push(parsed.data);
            } else {
              invalidRows.push({
                row,
                error: z.treeifyError(parsed.error),
              });
            }
          }

          if (invalidRows.length > 0) {
            console.warn("Invalid rows detected:", invalidRows);
            toast.warning("Invalid Rows Found");
          }

          const csvString = Papa.unparse(validRows);

          const blob = new Blob([csvString], { type: "text/csv" });
          const cleanFile = new File([blob], "validated.csv", {
            type: "text/csv",
          });

          const formData = new FormData();
          formData.append("csv", cleanFile);
          const config = { headers: { "Content-Type": "multipart/form-data" } };
          const data = await axios.post(
            "http://localhost:5000/upload/",
            formData,
            config
          );
          setDialogOpen(false);
          console.log(data);
          toast.success("Upload Successful");
        } catch (err) {
          console.log(err);
          setError("Upload failed. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      skipEmptyLines: true,
      header: headers,
    });
  };

  console.log("Preview data state:", previewData);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialogOpen(true)}
          >
            Upload CSV
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Valid Columns: Date, Category, Amount, Description</p>
        </TooltipContent>
      </Tooltip>
      <UploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onFileSelect={handleFileChange}
        onHeaderChange={setHeaders}
        onSubmit={handleSubmit}
        loading={loading}
        file={file}
      />
      <Toaster />
      <DataTable previewData={previewData} headers={headers} />
    </>
  );
}
export default UploadForm;
