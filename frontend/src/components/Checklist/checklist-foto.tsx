import './check-list.css'
import { Input } from '../inputs/input';
import { useState } from "react";
import { Inputphoto } from '../photo input/input-photo'
//import Button from '../../components/button/button';


export default function FotoCheck(){

    return(
        
        <div className='Checklist foto'>
            <Inputphoto />
        </div>
    )
}