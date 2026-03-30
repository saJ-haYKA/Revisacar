import './check-list.css'
import '../../index.css'
import { Input } from '../inputs/input';
import { useState } from "react";
//import Button from '../../components/button/button';


export default function VeiculoCheck(){
const [modelo, setModelo] = useState("");
const [placa, setPlaca] = useState("");
const [ano, setAno] = useState("");
const [cor, setCor] = useState("");
const [km, setKM] = useState("");

function validatePLaca (placa: string){
    if (/^[A-Za-z]{3}\d[A-Za-z]\d{2}$/.test(placa)){
            return'Placa MERCOSUL válida'
    }
    else if (/^[A-Za-z]{3}-?\d{4}$/.test(placa)){
        return'Placa pré-Mercosul válida'
    }
    else if (placa.length > 0){
        return 'placa inválida'
    }
}
    return(
        
        <div className='Checklist vei'>
            
            <h1 className='tittle'>🚗Dados do veículo</h1>
           <div className="modelo-input"> <Input 
                label='Modelo / Marca'
                name='modelo'
                placeholder='Ex: Toyota Corolla'
                value={modelo}
                onChangeValue={setModelo}
            />
            </div>
              <div className="placa-input"><Input 
                label='Placa'
                name='placa'
                placeholder='ABC1C34 / ABC-1234'
                value={placa}
                onChangeValue={setPlaca}
                error={validatePLaca(placa)}
                 
              
               
            />
            </div> 
               <div className="ano-input"><Input 
                label='Ano'
                name='ano'
                placeholder='2014'
                value={ano}
                onlyNumbers
                onChangeValue={setAno}
                error={ano && ano.length !== 4 ?  'Ano inválido' : ''}
                
            />
            </div>
            <div className="cor-input"> <Input 
                label='Cor'
                name='cor'
                placeholder='Prata'
                value={cor}
                onlyText
                onChangeValue={setCor}
             
                
            />
            
    </div>
      <div className="KM-input"> <Input 
                label='Quilometragem'
                name='km'
                placeholder='67.000 km'
                value={km}
                onlyNumbers
                onChangeValue={setKM}
               
            />
            
    </div>
        </div>
    )
}


