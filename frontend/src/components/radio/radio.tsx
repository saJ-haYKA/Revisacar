import '../inputs/input.css'
import './radio.css'

type RadioProps = { 
  label: string;
  name: string;
  checked: boolean;
  value: string;
  error?: string;
   activeColor?: string;
  onChangeValue?: (value: string) => void;
  
};

export function Radio({ label, name, value, error, onChangeValue, checked, activeColor= '#f1f1f1' }: RadioProps) {

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChangeValue?.(e.target.value);
  }

return (
  <div className="radio-group">
    <label className="radio-box"
    style={{ "--active-color": activeColor } as React.CSSProperties}>

      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={handleChange}
      />

      <span className="box">{label}</span>
    </label>

    {error && <span>{error}</span>}
  </div>
);
}
     