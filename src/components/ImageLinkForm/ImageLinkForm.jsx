import './ImageLinkForm.css';

const ImageLinkForm = ({ handleInputChange, handleImageSubmit }) => {
	return (
		<div className="tc">
			<p className="f3">
				{'This Magic Brain will detect faces in your pictures. Give it a try.'}
			</p>
			<div className="center">
				<div className="form center pa4 br3 shadow-5">
					<input className="f4 pa2 w-70" type="text" onChange={handleInputChange}/>
					<button 
					className="w-30 grow f4 link pv2 white bg-light-purple"
					onClick={handleImageSubmit}
					>Detect</button>
				</div>
			</div>
		</div>
	);
}

export default ImageLinkForm