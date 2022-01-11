import './App.css';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faHeart as fHeart, faRocket, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faHeart as oHeart } from '@fortawesome/free-regular-svg-icons'
import { tab } from '@testing-library/user-event/dist/tab';

var settings = require('./config.json');

const PAGE_LIMIT = 25;


const formatDate = (date) => {
  return date.toISOString().split('T')[0];
}

const Card = ({data, toggleModal, setModalData, tabIndex}) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleModal = () => {
    setModalData(data);
    toggleModal(true);
  }

  useEffect(() => {
    const url = data.hdrul || data.url;
    const liked = window.localStorage.getItem(url);
    if(!liked) {
      window.localStorage.setItem(url, false);
    } else {
      setIsLiked(JSON.parse(liked))
    }
  }, []);

  useEffect(() => {
    const url = data.hdrul || data.url;
    window.localStorage.setItem(url, isLiked);
  }, [isLiked]);
  
  return (
    <div className="card" key={data.hdurl || data.url}>
      <div className="card-info">
        {data.copyright && <h6 className="card-owner">{data.copyright}</h6>}

        <button tabIndex={tabIndex} className="card-desc-btn btn" onClick={() => handleModal()}>
          <FontAwesomeIcon alt="Read more" icon={faSearch}/>
        </button>
        <button tabIndex={tabIndex} className={`card-like-btn btn ${isLiked ? "liked" : "not-liked"}`} onClick={() => setIsLiked(!isLiked)}>
          <FontAwesomeIcon alt="Like this photo" icon={isLiked ? fHeart : oHeart}/>
        </button>
      </div>
      <img onClick={() => handleModal()} alt={data.title} className="card-photo" src={data.hdrul || data.url}/>
    </div>
  );
}

Card.propTypes = {
  data: PropTypes.object.isRequired,
  toggleModal: PropTypes.func.isRequired,
  setModalData: PropTypes.func.isRequired

}


const PhotoModal = ({data, visible, setVisible}) => {
  if(!data) {
    return null;
  }

  return (
    <div id="modal-wrapper" className={visible ? "visible" : "hidden"} onClick={() => setVisible(false)}>
      <div id="modal">
        <button className="modal-close-btn btn" onClick={() => setVisible(false)}>
          <FontAwesomeIcon alt="Exit modal" icon={faTimes} />
        </button>
        <div className="modal-image">
          <img alt={data.title} src={data.hdrul || data.url}/>
        </div>
        <div className="modal-info">
          <div>
            <h3>{data.title}</h3>
            {data.copyright && <h5>by {data.copyright}</h5>}
            <article>
              <p>{data.explanation}</p>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}

PhotoModal.propTypes = {
  data: PropTypes.object,
  visible: PropTypes.bool.isRequired,
  setVisible: PropTypes.func.isRequired,
  tabIndex: PropTypes.number
}

PhotoModal.defaultProps = {
  data: null,
  tabIndex: 0
}


const Spacestagram = () => {
  const [photos, setPhotos] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [oldest, setOldest] = useState(new Date());
  const [scrollPosition, setScrollPosition] = useState(0);
  const [modalData, setModalData] = useState();
  const [modalVisibility, setModalVisibility] = useState(false);
  const [error, setError] = useState(null);
  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };
  const fetchIMGS = (params) => {
    return (
      fetch(`https://api.nasa.gov/planetary/apod?api_key=${settings.api_key}&${params}`, {
        method: 'GET',
      })
      .then(response => {
        if(response.status > 400) {
          setError("Uh oh! Something went wrong. Reload the page and try again?");
          return;
        }
        setError(null);
        return response.json();
      })
      .then(data => {
        if(!data) {
          return null;
        }
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
  useEffect(() => {
    console.log(photos);
    if(isFetching) {
      const end_date = oldest;
      if(photos) {
        end_date.setDate(end_date.getDate() - 1);
      }
      const start_date = new Date(end_date);

      start_date.setDate(oldest.getDate() - PAGE_LIMIT);
      fetchIMGS(`end_date=${formatDate(end_date)}&start_date=${formatDate(start_date)}`).then(data => {
        setIsFetching(false);
        setOldest(start_date);
        if(photos) {
          setPhotos([...photos, ...data.reverse()]);
        } else {
          setPhotos(data.reverse());
        }

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
    if(scrollPosition / document.body.clientHeight > 0.60 && !isFetching) {
      setIsFetching(true);
    }
  }, [scrollPosition]);
  
  useEffect(() => {
    if(modalVisibility) {
      document.addEventListener("keydown", handleEscape, false);
    } else {
      document.removeEventListener("keydown", handleEscape, false);
    }
  }, [modalVisibility])

  const handleEscape = (ev) => {
    if(ev.keyCode === 27) {
      setModalVisibility(false);
    }

  }

  return (
    <div className="Spacestagram">
      <PhotoModal data={modalData} visible={modalVisibility} setVisible={setModalVisibility}/>
      <header>
        <div>
          <FontAwesomeIcon icon={faRocket}/>
          <h1>spacestagram</h1>
        </div>
        <p><i>brought to you by NASA</i></p>
      </header>
      <main >
        {photos && Object.values(photos).map((photo) => {
          return(<Card data={photo} tabIndex={modalVisibility ? -1 : 0} toggleModal={setModalVisibility} setModalData={setModalData}/>)
        })}
      </main>
      <footer className={photos ? "" : "first-loading"}>
        {(isFetching || !photos ) && !error &&
          <div className="loading-wrapper">
            <div className="loading">
              <FontAwesomeIcon alt="Loading..." icon={faCog} spin/>
            </div>
            <p>Loading...</p>
          </div>
        }
        {error && 
          <p className="error">{error}</p>
        }
      </footer>
    </div>
  );
}

export default Spacestagram;
