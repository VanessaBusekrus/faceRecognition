import './FaceRecognition.css';

// are imageURL anf imageRef both necessary. Can we just use imageRef?
const FaceRecognition = ({ imageURL, box, handleImageLoad, imageRef }) => {	
	return (
		<div className="center ma">
			<div className="absolute mt2">
				{imageURL && (
				<img 
					id="inputImage" 
					ref={imageRef}
					src={imageURL} 
					alt="uploaded image" 
					width="500px" 
					height="auto"
					onLoad={handleImageLoad}
				/>
				)}
				<div className="bounding-box" style={{top: box.topRow, right: box.rightCol, bottom: box.bottomRow, left: box.leftCol}}></div>
			</div>
		</div>
	);
}

export default FaceRecognition;