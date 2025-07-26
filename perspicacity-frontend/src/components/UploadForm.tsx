import react from 'react'
import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

function UploadForm () {
    const [file, setFile] = useState<File | null>(null);

    function handleSubmit = (e: InputEvent) => { 
        const file = event.target.files[0];
        setFile(file);
    };


    <>
        <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="picture">CSV Upload</Label>
            <Input id="picture" type="file" />
        </div>
        <Button onSubmit={setfile()}>Submit</Button>
    </>
}
export default UploadForm;

