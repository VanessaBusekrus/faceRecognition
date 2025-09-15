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
      isSignedIn: false
    }
  }

  // NEW!
  calculateFaceLocation = (data) => {
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

  // NEW!
  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({ imageURL: this.state.input });
  
    fetch("https://api.clarifai.com/v2/models/" + 'face-detection' + "/outputs", returnClarifaiRequestOptions(this.state.input))
    .then(response => response.json()) //NEW!
    .then(response => {
      console.log('hi', response)
      if (response) {
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count}))
          })
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
  }

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
