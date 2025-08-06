import axios from "axios";
import Papa, { type ParseResult } from "papaparse";
import { z } from "zod";

const RowSchema = z.object({
  dates: z.coerce.date(),
  category: z.string(),
  amount: z.coerce.number(),
  description: z.string(),
});

type Row = z.infer<typeof RowSchema>;

export async function parseCSV(file: File, headers: boolean): Promise<ParseResult<Record<string, unknown>>> {
  const text = await file.text();
  console.log("CSV file content:\n", text);
  const result: ParseResult<Record<string, unknown>> = Papa.parse<Record<string, unknown>>(text, {
    skipEmptyLines: true,
    header: headers,
  });

  console.log("Raw parsed result from Papa:", result.data);
  return result;
}

export function validateParsedRows(result: Record<string, unknown>[]) {
  const validRows: Row[] = [];
  const invalidRows: any[] = [];

  for (const row of result) {
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

  return { validRows, invalidRows };
}

export async function uploadValidRows(validRows: any[], fileName: string) {
  const csvString = Papa.unparse(validRows);
  const blob = new Blob([csvString], { type: "text/csv" });
  const cleanFile = new File([blob], fileName, {
    type: "text/csv",
  });

  const formData = new FormData();
  formData.append("csv", cleanFile);
  const config = {
    headers: {
      "X-Filename": fileName,
      "Content-Type": "multipart/form-data",
    },
  };

  const data = await axios.post(
    "http://localhost:5000/upload/",
    formData,
    config
  );

  await axios.post("/store-valid-data", {
  filename: fileName.trim().toLowerCase(),
  rows: validRows,
});

  return data;
}
