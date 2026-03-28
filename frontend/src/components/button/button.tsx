import './button.css'

type ButtonProps = {
  text: string;
  background: string;
  onClick?: () => void;


};

export default function Button({ text, background, onClick  }: ButtonProps) {


    
  return (
    <button style={{ background }}  onClick={onClick} className='btn'>{text}</button>
  );
}