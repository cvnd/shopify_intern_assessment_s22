import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types'
var settings = require('./config.json');

const ROVERS = ['curiosity', 'opportunity', 'spirit'];
const PAGE_LIMIT = 25;
const fetchIMGS = (params) => {
  return (
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${settings.api_key}&${params}`, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      const arr = [];
      data.forEach(d => {
        if(d.media_type !== "video") {
          arr.push(d);
        }
      })
      return arr;
    })
  )
};

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
}

const Card = ({data, liked}) => {
  
  return (
    <div className="card">
      {/* <div className="card-title">{data.copyright || "NASA"}</div> */}
      {/* <div className="card-photo"> */}
      <img className="card-photo" src={data.hdrul || data.url}/>
      {/* </div> */}
      {/* <h5>
        Taken on {data.date}
      </h5> */}
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

const Spacestagram = () => {
  const [photos, setPhotos] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [oldest, setOldest] = useState(new Date());
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    if(isFetching) {
      const end_date = oldest;
      const start_date = new Date(end_date);
      start_date.setDate(oldest.getDate() - PAGE_LIMIT + 1);
      fetchIMGS(`end_date=${formatDate(end_date)}&start_date=${formatDate(start_date)}`).then(data => {
        setIsFetching(false);
        if(photos) {
          setPhotos([...photos, ...data.reverse()]);
        } else {
          setPhotos(data.reverse());
        }

        setOldest(start_date);
      });
    }
  }, [oldest, isFetching, photos]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  
  useEffect(() => {
    if(scrollPosition / window.innerHeight > 0.60 && !isFetching) {
      setIsFetching(true);
    }
  }, [scrollPosition]);
  

  return (
    <div className="Spacestagram">
      <main>
        {photos && Object.values(photos).map((photo) => {
          return(<Card data={photo}/>)
        })}
      </main>
    </div>
  );
}

export default Spacestagram;
