import './home.css'
import '../../index.css'
import '../../components/panel-list/panel'
import '../../components/Checklist/checklist-cliente';
import Button from '../../components/button/button';
import logo from "../../assets/Logorevisabranca.svg";
import Panellist from '../../components/panel-list/panel';
import ClienteCheck from '../../components/Checklist/checklist-cliente';
import { useState } from "react";
import VeiculoCheck from '../../components/Checklist/checklist-veiculo';
import DiagnosticoCheck from '../../components/Checklist/checklist-diagnostico';
import FotoCheck  from '../../components/Checklist/checklist-foto';
export default function Home() {
  const [step, setStep] = useState(0);

  const Clist = [
    <ClienteCheck />,
    <VeiculoCheck />,
    <DiagnosticoCheck />,
    <FotoCheck />
  ];

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, Clist.length - 1));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  return (
    <section className='home-container'>
<div className="wrapper">
  <div className="vscode">
    <div className="titlebar">
      <div className="car"><img src= {logo} alt="" /></div>
        <div className="dot dot-r"></div>
      <div className="dot dot-y"></div>
      <div className="dot dot-g"></div>
    </div>
     <div className="layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <Panellist />
          </div>
       
      </div>
      <div  className="panel" id="panel">
           {Clist[step]}
        <div className="welcome">
          <div className="panel-title"></div>
          <div className="panel-sub">
            <div> <hr />
          </div>
          <div className="panel-sub-footer"><div onClick={prevStep} className="backbtn"><Button background='' text='← Anterior'/></div> <div onClick={nextStep} className="nextbtn"><Button background='#f1f1f1'  text='Próximo →' /></div></div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
    </section>
  

  )
}