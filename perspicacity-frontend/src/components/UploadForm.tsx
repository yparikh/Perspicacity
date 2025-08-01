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
  const [previewData, setPreviewData] = useState<Record<string, string>[] | []>(
    []
  );
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

    if (!file) {
      return;
    }

    setLoading(true);

    const text = await file.text();
    console.log("CSV file content:\n", text);
    const result = Papa.parse(text, {
      skipEmptyLines: true,
      header: headers,
    });

    console.log("Raw parsed result from Papa:", result.data);

    try {
      const validRows: Row[] = [];
      const invalidRows: any[] = [];

      for (const row of result.data) {
        const parsed = RowSchema.safeParse(row);
        console.log("Row before parsing:", row);
        if (parsed.success) {
          validRows.push(parsed.data);
        } else {
          console.warn("Failed row:", z.treeifyError(parsed.error));
          invalidRows.push({
            row,
            error: z.treeifyError(parsed.error),
          });
        }
      }

      if (invalidRows.length > 0) {
        console.warn("Invalid rows detected:", invalidRows);
        invalidRows.map(({ row, error }, i) =>
          toast.warning(
            <div key={i}>
              <p>
                Row {i + 1}: {JSON.stringify(row)}
              </p>
              <p>{JSON.stringify(error, null, 2)}</p>
            </div>
          )
        );
      }
      
      const csvString = Papa.unparse(validRows);
      const blob = new Blob([csvString], { type: "text/csv" });
      const cleanFile = new File([blob], file.name, {
        type: "text/csv",
      });

      const formData = new FormData();
      formData.append("csv", cleanFile);
      const config = { headers: { "Content-Type": "multipart/form-data" } };

      console.log("Valid rows for backend:", validRows);
      console.log("CSV string being sent:", csvString);

      const data = await axios.post(
        "http://localhost:5000/upload/",
        formData,
        config
      );
      setDialogOpen(false);
      setPreviewData(
        validRows.map((row) => ({
          dates: row.dates.toISOString().split("T")[0],
          category: row.category,
          amount: row.amount.toString(),
          description: row.description,
        }))
      );
      console.log(data);
      toast.success("Upload Successful");
    } catch (err) {
      console.log(err);
      setError("Upload failed. Please try again.");
      toast.warning("Upload Failed. Please try again");
    } finally {
      setLoading(false);
    }
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
      <Toaster richColors />
      <DataTable previewData={previewData} headers={headers} />
    </>
  );
}
export default UploadForm;
