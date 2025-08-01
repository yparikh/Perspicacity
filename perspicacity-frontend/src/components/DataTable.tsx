import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DataTableProps = {
  previewData: any[] | Record<string, string | undefined>[];
  headers: boolean;
};

export default function DataTable({ previewData, headers }: DataTableProps) {
  if (!previewData || previewData.length === 0) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {(headers
            ? Object.keys(previewData[0] as Record<string, string>)
            : (previewData[0] as string[])
          ).map((key, i) =>
            headers ? (
              <TableHead key={i}>{key}</TableHead>
            ) : (
              <TableCell key={i}>{key}</TableCell>
            )
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {previewData.slice(headers ? 0 : 1).map((row, i) => (
          <TableRow key={i}>
            {(headers
              ? Object.values(row as Record<string, string>)
              : (row as string[])
            ).map((cell, j) => (
              <TableCell key={j}> {cell} </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
