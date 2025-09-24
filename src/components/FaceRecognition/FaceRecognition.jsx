import './FaceRecognition.css';

const FaceRecognition = ({ imageURL, boxes, handleImageLoad, imageRef }) => {	
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
				{/* Render multiple bounding boxes for each detected face */}
				{boxes.map((box) => (
					<div 
						key={box.id}
						className="bounding-box" 
						style={{
							top: box.topRow, 
							right: box.rightCol, 
							bottom: box.bottomRow, 
							left: box.leftCol
						}}
					></div>
				))}
			</div>
		</div>
	);
}

export default FaceRecognition;