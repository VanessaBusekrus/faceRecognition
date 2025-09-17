import './FaceRecognition.css';

const FaceRecognition = ({ imageURL, box, onImageLoad, imageRef }) => {
	if (!imageURL) return null;
	
	return (
		<div className="center ma">
			<div className="absolute mt2">
				<img 
					id="inputImage" 
					ref={imageRef}
					src={imageURL} 
					alt="uploaded image" 
					width="500px" 
					height="auto"
					onLoad={onImageLoad}
				/>
				<div className="bounding-box" style={{top: box.topRow, right: box.rightCol, bottom: box.bottomRow, left: box.leftCol}}></div>
			</div>
		</div>
	);
}

export default FaceRecognition;