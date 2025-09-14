import './App.css'
import Navigation from './components/Navigation/Navigation.jsx';
import Logo from './components/Logo/Logo.jsx';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.jsx';
import Rank from './components/Rank/Rank.jsx';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.jsx';
import ParticlesBg from 'particles-bg';
import { Component } from 'react';

/*-----------------------------------------*/

const returnClarifaiRequestOptions = (imageURL) => {
  // Your PAT (Personal Access Token) can be found in the Account's Security section
  const PAT = import.meta.env.VITE_API_PAT;
  // Specify the correct user_id/app_id pairings
  // Since you're making inferences outside your app's scope
  const USER_ID = import.meta.env.VITE_API_USER_ID;
  const APP_ID = import.meta.env.VITE_API_APP_ID;
  // Change these to whatever model and image URL you want to use
  // const MODEL_ID = 'face-detection';
  const IMAGE_URL = imageURL;

  const raw = JSON.stringify({
    "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
    },
    "inputs": [
        {
            "data": {
                "image": {
                    "url": IMAGE_URL
                }
            }
        }
    ]
  });

  const requestOptions = {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
    },
    body: raw
  };

  return requestOptions;
}

/*-----------------------------------------*/

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageURL: '',
      box: {}
    }
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageURL: this.state.input});

    fetch(`https://api.clarifai.com/v2/models/face-detection/outputs`, returnClarifaiRequestOptions(this.state.input))
    .then(response => response.json())
    .then(result => {

        // const regions = result.outputs[0].data.regions;
        let regions;

        if (
          result &&
          result.outputs &&
          result.outputs[0] &&
          result.outputs[0].data &&
          result.outputs[0].data.regions
        ) {
          regions = result.outputs[0].data.regions;
        } else {
          regions = [];
        }

        regions.forEach(region => {
            // Accessing and rounding the bounding box values
            const boundingBox = region.region_info.bounding_box;
            const topRow = boundingBox.top_row.toFixed(3);
            const leftCol = boundingBox.left_col.toFixed(3);
            const bottomRow = boundingBox.bottom_row.toFixed(3);
            const rightCol = boundingBox.right_col.toFixed(3);

            // region.data.concepts.forEach(concept => {
            //     // Accessing and rounding the concept value
            //     const name = concept.name;
            //     const value = concept.value.toFixed(4);
            // });
            console.log(
              `Face BBox: top=${topRow}, left=${leftCol}, bottom=${bottomRow}, right=${rightCol}`
            );

            if (regions.length === 0) {
              console.log("No faces detected.");
            }
          });

    })
    .catch(error => console.log('error', error));
  }

  render() {
    return (
      <>
        <div>
        <ParticlesBg type="cobweb" bg={true} />
          <div className="App">
            <Navigation />
            <Logo />
            <Rank />
            <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition imageURL={this.state.imageURL}/>    
          </div>
        </div>
      </>
    )
  }
}

export default App
