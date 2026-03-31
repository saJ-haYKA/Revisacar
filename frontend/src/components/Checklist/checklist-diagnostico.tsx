import './check-list.css'
import { useState } from "react";
import { Textarea } from '../inputs/textarea';
import { RadioBox } from '../radio/diagnosticoRadio';
import '../../index.css'

export default function DiagnosticoCheck(){

  const [relato, setRelato] = useState("");
  const [obs, setObs] = useState("");
  const [status, setStatus] = useState<{ [key: string]: string }>({});

  function handleChange(key: string, value: string) {
    setStatus((prev) => ({
      ...prev,
      [key]: value
    }));
  }

  const sections = [
  {
    title: "⚙️ Motor",
    items: [
      "Nível de óleo",
      "Filtro de ar",
      "Bobina de ignição",
      "Correia dentada",
      "Velas de ignição",
      "Radiador / fluido de arrefecimento"
    ]
  },
  {
    title: "🛑 Freios",
    items: [
      "Pastilhas dianteiras",
      "Disco dianteiro",
      "Fluido de freio",
      "Pastilhas traseiras",
      "Disco traseiro",
      "ABS / sensor"
    ]
  },
  {
    title: "🔩 Suspensão",
    items: [
      "Amortecedor dianteiro",
      "Amortecedor traseiro",
      "Bandeja",
      "Pivô",
      "Barra estabilizadora",
      "Rolamento de roda"
    ]
  },
  {
    title: "⚡ Elétrica",
    items: [
      "Bateria",
      "Alternador",
      "Motor de arranque",
      "Fusíveis",
      "Iluminação dianteira",
      "Iluminação traseira"
    ]
  },
  {
    title: "🔄 Transmissão",
    items: [
      "Câmbio (operação)",
      "Embreagem",
      "Semi-eixo / homocinética",
      "Fluido de câmbio",
      "Diferencial"
    ]
  },
  {
    title: "🔘 Pneus & Rodas",
    items: [
      "Pneu dianteiro esq.",
      "Pneu dianteiro dir.",
      "Pneu traseiro esq.",
      "Pneu traseiro dir.",
      "Estepe",
      "Alinhamento / balanceamento"
    ]
  }
];

  return(
    <div>

      {/* RELATO */}
      <div className='Checklist relato'>
        <h1 className='tittle'>💬 Relato cliente</h1>

        <div className="relato-area"> 
          <Textarea 
            label='O que o cliente descreveu?'
            rows={5}
            name='relato'
            placeholder='Descreva o que o cliente relatou sobre o problema do veículo...'
            value={relato}
            onChangeValue={setRelato}
          />
        </div>
      </div>

      {/* DIAGNÓSTICO */}
      
      <div className='Checklist diagnostico'>
        <div className='inspeçao'><h1 className='tittle'>🔍 Checklist de Inspeção</h1></div>
        {sections.map((section) => (
          <div key={section.title}>
           
            <h3>{section.title}</h3>
            
            <div className="grid">
              {section.items.map((item) => {
                const key = item.toLowerCase().replace(/\s+/g, "-");

                return (
                    
                  <RadioBox
                    key={key}
                    desc={item}
                    name={key}
                    value={status[key] || ""}
                    onChange={(v) => handleChange(key, v)}
                  />
                );
              })}
            </div>
                
          </div>
        ))}

      </div>
<div className='Checklist relato'>
        <h1 className='tittle'>📝 Observações do Mecânico</h1>

        <div className="relato-area"> 
          <Textarea 
            label='Problemas adicionais encontrados ou anotações técnicas?'
            rows={5}
            name='obs'
            placeholder='Descreva aqui qualquer problema adicional encontrado durante a inspeção, informações técnicas relevantes, etc.'
            value={obs}
            onChangeValue={setObs}
          />
        </div>
      </div>
    </div>
  );
}