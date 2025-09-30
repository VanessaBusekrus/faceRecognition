import './FaceRecognition.css';

const FaceRecognition = ({ image, boxes, handleImageLoad, imageRef }) => {	
	return (
		<div className="center ma">
			<div className="absolute mt2">
				{image && (
				<img 
					id="inputImage" 
					ref={imageRef} // Reference passed from parent. Needed here for image load event and actual dimensions and face box calculations
					src={image} 
					alt="uploaded image" 
					width="500px" 
					height="auto"
					onLoad={handleImageLoad}
				/>
				)}
				{/* Render multiple bounding boxes for each detected face. map() creates one <div> for each face detected */}
				{boxes.map((box) => ( // "box" is the current item variable. map() goes through each item in the boxes array and returns a new array of JSX elements
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