import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onFileSelect: React.ChangeEventHandler<HTMLInputElement>;
  onHeaderChange: (checked: boolean) => void;
  loading: boolean;
  file?: File;
};

export default function UploadDialog({
  open,
  onOpenChange,
  onSubmit,
  onFileSelect,
  onHeaderChange,
  loading,
  file,
}: UploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={onSubmit} encType={"multipart/form-data"}>
          <DialogHeader>
            <DialogTitle>Upload your CSV</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="csv">CSV Upload</Label>
              <Input
                id="csv"
                type="file"
                accept=".csv"
                onChange={onFileSelect}
              />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="header"
                onCheckedChange={(checked) => onHeaderChange(!!checked)}
              />
              <Label htmlFor="header">
                Does your CSV include a header row?
              </Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || !file}>
              {loading ? "Uploading..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
