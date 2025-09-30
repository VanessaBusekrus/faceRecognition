import './ImageLinkForm.css';

const ImageLinkForm = ({ handleInputChange, handleImageSubmit, isLoading, input }) => {
	const handleSubmit = (event) => {
		event.preventDefault(); // Prevent page refresh
		handleImageSubmit(); // Call the parent's submit handler
	};

	let buttonText = 'Detect';
	let buttonColor = 'bg-light-purple';
	
	if (isLoading) {
		buttonText = '⏳ Loading...';
		buttonColor = 'bg-gray';
	}

	return (
		<div className="tc">
			<p className="f3">
				{'This Magic Brain will detect faces in your pictures. Give it a try.'}
			</p>
			<div className="center">
				<form className="form center pa4 br3 shadow-5" onSubmit={handleSubmit}>
					<input 
						className="f4 pa2 w-70" 
						type="text" 
						id="image-url-input"
						name="imageUrl"
						value={input}
						onChange={handleInputChange}
						placeholder="Enter image URL..."
						required
						disabled={isLoading}
					/>
					<button 
						type="submit"
						className={`w-30 grow f4 link pv2 white ${buttonColor}`}
						disabled={isLoading}
					>
						{buttonText}
					</button>
				</form>
			</div>
		</div>
	);
}

export default ImageLinkForm