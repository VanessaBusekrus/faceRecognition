const FaceRecognition = ({ imageURL }) => {
	return (
		<div className="center ma">
			<div className="absolute mt2">
				{imageURL &&
					<img src={imageURL} alt="uploaded image" width="500px" height="auto"/>
				}
			</div>
		</div>
	);
}

export default FaceRecognition;