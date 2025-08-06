import react, { useState } from "react";
import axios from "axios";
import Papa from "papaparse";

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
import {
  parseCSV,
  uploadValidRows,
  validateParsedRows,
} from "@/utils/uploadUtils";
import {
  showInvalidRowsToast,
  showUploadErrorToast,
  showUploadSuccessToast,
} from "@/utils/toasts";

function UploadForm() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [previewData, setPreviewData] = useState<Record<string, string>[] | []>(
    []
  );
  const [headers, setHeaders] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const result = await parseCSV(file, headers);
      const { validRows, invalidRows } = validateParsedRows(result.data);
      if (invalidRows.length > 0) {
        showInvalidRowsToast(invalidRows);
      }
      const data = await uploadValidRows(validRows, file.name);

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
      showUploadSuccessToast();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        showUploadErrorToast(
          "Duplicate File Detected. Try again with a new file or change name."
        );
      } else {
        console.log(err);
        showUploadErrorToast("Upload Failed. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

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
