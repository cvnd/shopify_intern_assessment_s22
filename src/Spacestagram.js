import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types'
var settings = require('./config.json');

const ROVERS = ['curiosity', 'spirit', 'opportunity'];

const fetchAPI = (user, url) => {
  return (
    fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${user}/photos?${url}&api_key=${settings.api_key}`, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(json => {
      return json;
    })
  )
};

const fetchManifest = (rover) => {
  return (
    fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}?api_key=${settings.api_key}`, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(json => {
      return json;
    })
  )

}

const Card = ({data, liked}) => {
  
  return (
    <div class="card">
      <div>HELLO</div>
      <div></div>
    </div>
  );
}

Card.propTypes = {
  data: PropTypes.object.isRequired,
  liked: PropTypes.bool
}

Card.defaultProps = {
  liked: false
}

const Viewer = ({rover}) => {
  const [photos, getPhotos] = useState();
};

Viewer.propTypes = {
  rover: PropTypes.string.isRequired
}


const Spacestagram = () => {
  const [images, setImages] = useState();
  const [manifests, setManifests] = useState([]);
  const [fetchingManifests, setFetchingManifests] = useState(false);
  const [roverFocus, setRoverFocus] = useState(null);
  useEffect(() => {
    console.log(manifests);
    if(!fetchingManifests && manifests.length === 0) {
      setFetchingManifests(true);
      console.log("Fetching rovers");
      const newManifests = [];
      ROVERS.forEach(async (rover) => {
        console.log(`Rover name: ${rover}`);
        newManifests.push(await fetchManifest(rover));
      });

      setManifests(newManifests);
    }
    console.log(manifests);
  }, [fetchingManifests, manifests]);

  
  return (
    <div className="Spacestagram">
      <div id="nav">
        <h4>Select a rover.</h4>
        <div>
          {Object.values(ROVERS).map(val => {
            return( <div onClick={() => setRoverFocus(val)}className="rover-selection button">{val}</div>);
          })}
        </div>
      </div>
      <div id="content">
          <Viewer rover={roverFocus}/>
      </div>
    </div>
  );
}

export default Spacestagram;
