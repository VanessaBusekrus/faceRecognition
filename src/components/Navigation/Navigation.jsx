const Navigation = ({ route, handleRouteChange }) => {
	return (
	  <nav style={{ display: 'flex', justifyContent: 'flex-end' }}>
		{(route === 'signIn' || route === '2fa-verify') && (
		  <p
			onClick={() => handleRouteChange('register')}
			className="f3 link dim black underline pa3 pointer"
		  >
			Register
		  </p>
		)}
		{route === 'register' && (
		  <p
			onClick={() => handleRouteChange('signIn')}
			className="f3 link dim black underline pa3 pointer"
		  >
			Sign In
		  </p>
		)}
		{route === 'home' && (
		  <>
			<p
			  onClick={() => handleRouteChange('settings')}
			  className="f3 link dim black underline pa3 pointer"
			>
			  Settings
			</p>
			<p
			  onClick={() => handleRouteChange('signOut')}
			  className="f3 link dim black underline pa3 pointer"
			>
			  Sign Out
			</p>
		  </>
		)}
		{(route === 'settings' || route === '2fa-setup') && (
		  <>
			<p
			  onClick={() => handleRouteChange('home')}
			  className="f3 link dim black underline pa3 pointer"
			>
			  Home
			</p>
			<p
			  onClick={() => handleRouteChange('signOut')}
			  className="f3 link dim black underline pa3 pointer"
			>
			  Sign Out
			</p>
		  </>
		)}
	  </nav>
	);
  };
  
  export default Navigation;
  