import './App.css'
import Navigation from './components/Navigation/Navigation.jsx';
import Logo from './components/Logo/Logo.jsx';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.jsx';
import Rank from './components/Rank/Rank.jsx';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.jsx';
import SignIn from './components/SignIn/SignIn.jsx';
import Register from './components/Register/Register.jsx';
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

// const app = new Clarifai.App({
//   apiKey: import.meta.env.VITE_API_PAT
// });

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageURL: '',
      box: {},
      route: 'signIn',
      isSignedIn: false,
      user: {
        id: '',
        entries: 0
      }
    }
  }

  calculateFaceLocation = (data) => {
    if (!data.outputs || data.outputs.length === 0) {
      console.warn("No face detected or invalid response:", data);
      return null;
    }

    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = async () => {
    this.setState({ imageURL: this.state.input });
    const MODEL_ID = 'face-detection';
    const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';
      
    try {
      const response = await fetch(
        `/api/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
        returnClarifaiRequestOptions(this.state.input)
      );
      

      const data = await response.json();
      console.log("Clarifai Response:", data);

      // if (data) {
      //   const updateRes = await fetch("/api/image", {
      //     method: "PUT",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       id: this.state.user.id
      //     })
      //   });

      //   const count = await updateRes.json();
      //   this.setState(Object.assign(this.state.user, { entries: count }));
      // }

      const box = this.calculateFaceLocation(data);
      if (box) {
        this.displayFaceBox(box);
        }
      } catch (err) {
      console.error("Error fetching Clarifai data:", err);
    }
  };

  onRouteChange = (route) => {
    if (route === 'signOut') {
      this.setState({ isSignedIn: false, route: 'signIn' });
    } else if (route === 'home') {
      this.setState({ isSignedIn: true, route: 'home' });
    } else {
      this.setState({ route: route });
    }
  };     
  
  render() {
    const { route, box, imageURL } = this.state;
    let page;
  
    if (route === 'signIn') {
      page = <SignIn onRouteChange={this.onRouteChange} />;
    } else if (route === 'register') {
      page = <Register onRouteChange={this.onRouteChange} />;
    } else if (route === 'home') {
      page = (
        <>
          <Rank />
          <ImageLinkForm 
            onInputChange={this.onInputChange} 
            onButtonSubmit={this.onButtonSubmit}
          />
          <FaceRecognition box={box} imageURL={imageURL} />
        </>
      );
    }
  
    return (
      <>
        <ParticlesBg type="cobweb" bg={true} />
        <div className="App">
          <Navigation route={route} onRouteChange={this.onRouteChange} />
          <Logo />
          {page}
        </div>
      </>
    );
  }  
}

export default App
