import './panel.css'
import Button from '../../components/button/button';


export default function Panellist() {
    return(
        <div className="list-panel">
                <div className="panel-items">
                    <Button background='' text='1.Cliente'/>
                    <Button background=''text='2.Veiculo'/>
                    <Button background=''text='3.Diagnostico'/>
                    <Button background=''text='4.Foto'/>
                    <Button background=''text='5.Peças'/>
                    <Button background=''text='6.Resumo'/>
                </div>
        </div>
    )

}

