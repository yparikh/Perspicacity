import { toast } from "sonner";

export function showInvalidRowsToast(invalidRows: any[]) {
 
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

  export function showUploadSuccessToast() {
  toast.success("Upload Successful");
}

export function showUploadErrorToast(message: string) {
  toast.warning(message);
}