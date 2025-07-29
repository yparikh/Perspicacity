import react, { useState } from "react";
import axios from "axios";
import Papa from "papaparse";


import UploadDialog from "./UploadDialog";
import DataTable from "./DataTable";
import { Button } from "./ui/button";

function UploadForm() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [previewData, setPreviewData] = useState<any[][]>([]);
  const [headers, setHeaders] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
      complete: async (result: Papa.ParseResults<any>) => {
        console.log("Parsed data:", result.data);
        setPreviewData(result.data);

        try {
          const formData = new FormData();
          formData.append("csv", file);
          const config = { headers: { "Content-Type": "multipart/form-data" } };
          const data = await axios.post(
            "http://localhost:5000/upload/",
            formData,
            config
          );
          setDialogOpen(false);
          console.log(data);
        } catch (err) {
          console.log(err);
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
    <Button
        type="button"
        variant="outline"
        onClick={() => (setDialogOpen(true))}
      >
        Upload CSV
      </Button>
      <UploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onFileSelect={handleFileChange}
        onHeaderChange={setHeaders}
        onSubmit={handleSubmit}
        loading={loading}
        />

      <DataTable previewData={previewData} headers={headers} />
    </>
  );
}
export default UploadForm;
