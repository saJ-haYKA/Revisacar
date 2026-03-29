import './radio.css'
import '../inputs/input.css'

import { Radio } from './radio';

type BoxProps = {
  desc: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
};
type StatusItemProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
};

export function RadioDiag({ name, value, onChange }: StatusItemProps) {

const options = [
  { label: "OK", value: "Ok", color: "#22c55e" },
  { label: "Atenção", value: "Atencao", color: "#f59e0b" },
  { label: "Crítico", value: "Critico", color: "#ef4444" },
  { label: "N/A", value: "Na", color: "#6b7280" }
];
   

    return(
        <div className='Status-radio'>
      {options.map((opt) => (
  <Radio
    key={opt.value}
    name={name}
    label={opt.label}
    value={opt.value}
    checked={value === opt.value}
    onChangeValue={onChange}
    activeColor={opt.color} 
  />
))}

        </div>
    
    )
}

export function RadioBox({ desc, name, value, onChange }: BoxProps) {
  return (
    <div className="Radio-container">
      <span className='span-desc'>{desc}</span>

      <RadioDiag
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}