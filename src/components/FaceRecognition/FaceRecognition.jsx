import './FaceRecognition.css';

const FaceRecognition = ({ imageURL, box }) => {
	if (!imageURL) return null;
	
	return (
		<div className="center ma">
			<div className="absolute mt2">
				<img id="inputImage" src={imageURL} alt="uploaded image" width="500px" height="auto"/>
				<div className="bounding-box" style={{top: box.topRow, right: box.rightCol, bottom: box.bottomRow, left: box.leftCol}}></div>
			</div>
		</div>
	);
}

export default FaceRecognition;