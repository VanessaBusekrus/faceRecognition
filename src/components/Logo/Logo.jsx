import Tilt from 'react-parallax-tilt';
import './Logo.css';
import logoImage from './brain.png';

const Logo = () => {
	return (
		<div className="ma4 mt0">
			<Tilt className='Tilt br2 shadow-2' options={{max: 25}} style={{height: '150px', width: '150px'}}>
				<div className='Tilt-inner pa3'>
					<img src={logoImage} alt="logo"/> 
				</div>
			</Tilt>
		</div>
	);
}

export default Logo;