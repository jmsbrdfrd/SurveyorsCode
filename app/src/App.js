import './style.css';
import React, {useState} from 'react';
import {Route, BrowserRouter as Router, Link} from 'react-router-dom';


import Home from './pages/Home';
import About from './pages/About';


function App() {	

	return (
		<Router>
			<div className="App">

				<Link to="/">Home</Link>
				<Link to="/about">About</Link>

				<Route path="/" exact component={Home} />
				<Route path="/about" component={About} />

			</div>	
		</Router>
	);
}

export default App;
