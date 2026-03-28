
import { useState } from "react";
import ClienteCheck from '../../components/Checklist/checklist-cliente';
import VeiculoCheck from '../../components/Checklist/checklist-veiculo';


     export default function  NextStep() {
          const [step, setStep] = useState(0);
    const Clist = [
        <ClienteCheck />,
        <VeiculoCheck />
    ];
    if (step < Clist.length - 1) {
      setStep(step + 1);
    }
  }


    
