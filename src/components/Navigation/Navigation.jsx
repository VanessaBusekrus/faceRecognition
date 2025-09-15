const Navigation = ({ route, onRouteChange }) => {
	return (
	  <nav style={{ display: 'flex', justifyContent: 'flex-end' }}>
		{route === 'signIn' && (
		  <p
			onClick={() => onRouteChange('register')}
			className="f3 link dim black underline pa3 pointer"
		  >
			Register
		  </p>
		)}
		{route === 'register' && (
		  <p
			onClick={() => onRouteChange('signIn')}
			className="f3 link dim black underline pa3 pointer"
		  >
			Sign In
		  </p>
		)}
		{route === 'home' && (
		  <p
			onClick={() => onRouteChange('signOut')}
			className="f3 link dim black underline pa3 pointer"
		  >
			Sign Out
		  </p>
		)}
	  </nav>
	);
  };
  
  export default Navigation;
  