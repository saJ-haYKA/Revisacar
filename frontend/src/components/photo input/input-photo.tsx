import { useState } from "react";
import './Iphoto.css'
import { Input } from "../inputs/input";
import '../../index.css'
type FotoProps = { 
  error?: string;
  onChangeValue?: (file: File) => void;
};

export function Inputphoto({ error, onChangeValue }: FotoProps){
const [Legenda, setLegenda] = useState("");
const [preview, setPreview] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    onChangeValue?.(file);

    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  return(
    <div>
      <input 
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/bmp, image/tiff"
        onChange={handleFile} 
      />

      {preview && (
        <div className="preview-wrapper"><img src={preview} />
            <Input 
                label=''
                name='legenda'
                placeholder='Legenda (ex: freio dianteiro esq).'
                value={Legenda}
                onChangeValue={setLegenda}
               
                />
        </div>
      )}

      {error && <span>{error}</span>}
    </div>
  );
}