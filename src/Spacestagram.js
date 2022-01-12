import './App.css';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faHeart as fHeart, faRocket, faSearch, faTimes, faArrowLeft, faArrowRight, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { faHeart as oHeart } from '@fortawesome/free-regular-svg-icons'
import DatePicker from 'react-datepicker';

var settings = require('./config.json');

const PAGE_LIMIT = 25;
const DATE_ASCENDING = 0;
const DATE_DESCENDING = 1;
const CURRENT_DATE = new Date();

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
}

function range(a, b) {
  if(b < a) {
    return null;
  }
  return [...Array(b - a).keys()].map(i => i + a);
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

const Calendar = ({currentDate, setDate}) =>{
  const years = range(1995, CURRENT_DATE.getYear() + 1901);
  console.log(years);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return (
    <DatePicker
      renderCustomHeader={({
        date,
        changeYear,
        changeMonth,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className="calendar-header-inner">
          <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className='calendar-header-selection'>
            <select
              style={{fontSize: "0.9em", backgroundColor: "transparent", border: "none"}}
              value={months[date.getMonth()]}
              onChange={({ target: { value } }) =>
                changeMonth(months.indexOf(value))
              }
            >
              {months.map((option) => {
                console.log(date.getYear());
                if(date.getYear() === 95 && !months.includes(option, 5)) {
                  return null;
                }
                return (<option key={option} value={option}>
                  {option}
                </option>)
              })}
            </select>
            <select
              style={{fontSize: "0.9em", backgroundColor: "transparent", border: "none"}}
              value={date.getYear() + 1900}
              onChange={({ target: { value } }) => changeYear(value)}
            >
              {years.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      )}
      selected={currentDate}
      onChange={(date) => setDate(date)}
      showPreviousMonths={false}
      minDate={new Date("1995-06-16")}
      maxDate={CURRENT_DATE}
    />
  );
}

Calendar.propTypes = {
  currentDate: PropTypes.object,
  setDate: PropTypes.func.isRequired,
}

const Spacestagram = () => {
  const [photos, setPhotos] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [endDate, setEndDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [scrollPosition, setScrollPosition] = useState(0);
  const [modalData, setModalData] = useState();
  const [modalVisibility, setModalVisibility] = useState(false);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState(DATE_DESCENDING);
  const [filterError, setFilterError] = useState(null);
  
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

  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    console.log(photos);
    if(isFetching) {
      const end_date = endDate;
      if(photos) {
        end_date.setDate(end_date.getDate() - 1);
      }
      const start_date = new Date(end_date);

      start_date.setDate(endDate.getDate() - PAGE_LIMIT);
      // fetchIMGS(`end_date=${formatDate(end_date)}&start_date=${formatDate(start_date)}`).then(data => {
      //   setIsFetching(false);
      //   setEndDate(start_date);
      //   if(photos) {
      //     setPhotos([...photos, ...data.reverse()]);
      //   } else {
      //     setPhotos(data.reverse());
      //   }

      // });
    }
  }, [sort, startDate, endDate, isFetching, photos]);

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

  useEffect(() => {
    if(endDate < startDate) {
      setFilterError("End date can't be earlier than start date");
    }
  }, [startDate, endDate]);

  return (
    <div className="Spacestagram">
      <PhotoModal data={modalData} visible={modalVisibility} setVisible={setModalVisibility}/>
      <header>
        <div id='header-siteinfo'>
          <FontAwesomeIcon icon={faRocket}/>
          <h1>spacestagram</h1>
        </div>
        <p><i>brought to you by NASA</i></p>
        <div id='controls'>
          <ul className='controls-options'>
            <li className="sort-selection">
              <label>Sort by</label>
              <select 
                style={{fontSize: "0.8em", padding: "0.5em", backgroundColor: "#e1e1e1", border: "none"}}
                value={sort}
                onChange={(ev) => setSort(ev.target.value)}
              >
                <option value={DATE_DESCENDING}>Newest</option>
                <option value={DATE_ASCENDING}>Oldest</option>
              </select>
            </li>
            <li className="date-selection">
              <label>To</label>
              <Calendar currentDate={startDate} setDate={(date) => setStartDate(date)}/>
              {/* <DatePicker dateFormat="yyyy/MM/dd" selected={startDate} onChange={(date) => console.log(date)} /> */}
              <label>From</label>
              {/* <DatePicker dateFormat="yyyy/MM/dd" selected={endDate} onChange={(date) => console.log(date)} /> */}
              <Calendar currentDate={endDate} setDate={(date) => setEndDate(date)}/>
            </li>
          </ul>
        </div>
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
