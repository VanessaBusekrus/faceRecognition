import './FaceRecognition.css';

const FaceRecognition = ({ image, boxes, handleImageLoad, imageRef }) => {	
	return (
		<div className="center ma">
			<div className="absolute mt2">
				{image && (
				<img 
					id="inputImage" 
					ref={imageRef}
					src={image} 
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