import './App.css';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faHeart as fHeart, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faHeart as oHeart } from '@fortawesome/free-regular-svg-icons'

var settings = require('./config.json');

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

const Card = ({data, toggleModal, setModalData}) => {
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
    <div className="card">
      <div className="card-info">
        {/* <div className="card-title">{data.title}</div> */}
        {data.copyright && <div className="card-owner">{data.copyright}</div>}

        <button className="card-desc-btn btn" onClick={() => handleModal()}>
          <FontAwesomeIcon icon={faSearch}/>
        </button>
        <button className="card-like-btn btn" onClick={() => setIsLiked(!isLiked)}>
          <FontAwesomeIcon icon={isLiked ? fHeart : oHeart}/>
        </button>
      </div>
      <img alt={data.title} className="card-photo" src={data.hdrul || data.url}/>
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
          <FontAwesomeIcon icon={faTimes}/>
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
  data: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  setVisible: PropTypes.func.isRequired
}



const Spacestagram = () => {
  const [photos, setPhotos] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [oldest, setOldest] = useState(new Date());
  const [scrollPosition, setScrollPosition] = useState(0);
  const [modalData, setModalData] = useState();
  const [modalVisibility, setModalVisibility] = useState(false);
  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
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
  

  return (
    <div className="Spacestagram">
      <PhotoModal data={modalData} visible={modalVisibility} setVisible={setModalVisibility}/>

      <main>
        {photos && Object.values(photos).map((photo) => {
          return(<Card data={photo} toggleModal={setModalVisibility} setModalData={setModalData}/>)
        })}
      </main>
      <footer className={photos ? "" : "first-loading"}>
        {(isFetching || !photos ) &&
          <div className="loading-wrapper">
            <div className="loading">
              <FontAwesomeIcon icon={faCog} spin/>
            </div>
            <p>Loading...</p>
          </div>
        }
      </footer>
    </div>
  );
}

export default Spacestagram;
