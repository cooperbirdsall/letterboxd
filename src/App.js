import { MantineProvider, Select } from '@mantine/core';
import '@mantine/core/styles.css'
import './App.css';
import { useState, useReducer } from 'react';
import { films } from './films.js';
import Confetti from 'react-confetti';


function App() {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const getRandomFilm = () => {
    return(
      films[Math.floor(Math.random() * films.length)]
    );
  }
  const [currentFilm] = useState(() => { return getRandomFilm() });
  const [selectState, setSelectState] = useState("");
  const [hasWon, setWin] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [yearVisible, setYearVisible] = useState(false);
  const [ratingVisible, setRatingVisible] = useState(false);
  const [wrongGuesses, setWrongGuesses] = useState([]);
  // const [wrongGuessLabels, setWrongGuessLabels] = useState([]);
  const [currentAnswerClass] = useState(() => {
    const length = currentFilm.title.length;
    if (length < 21) {
      return "answer-text-big";
    } else if (length < 34) {
      return "answer-text-medium";
    } else {
      return "answer-text-small";
    }
  });
  const [reviews] = useState(() => {
    let totalList = currentFilm.reviews;
    let newList = [];
    const reg = new RegExp(`${currentFilm.title}`, 'ig');
    //maybe also remove "The", etc. from the title
    for (let i = 0; i < 3; i++) {
      const rand = Math.floor(Math.random() * totalList.length);
      let selected = totalList[rand];
      //censor review if it contains the title
      selected.review = selected.review.replaceAll(reg, "[redacted]");
      newList.push(selected);
      totalList.splice(rand, 1);
    }
    return newList;
  });
  const [reviewsVisible, setReviewsVisible] = useState(1);
  const selectData = Array.from(films, (film) => { return(film.title) })

  const guess = () => {
    if (selectState !== null && selectState.length > 1) {
      if (selectState === currentFilm.title) {
        setWin(true);
        setTitleVisible(true);
        setYearVisible(true);
        setRatingVisible(true);
        setReviewsVisible(3);
      } else {
        const newGuesses = wrongGuesses;
        newGuesses.push(selectState);
        setWrongGuesses(newGuesses);
        forceUpdate();
        if (wrongGuesses.length > 2) {
          setTitleVisible(true);
          setYearVisible(true);
          setRatingVisible(true);
          setReviewsVisible(3);
        }
      }
    }
  }

  const wrongGuessLabels = wrongGuesses.map((text) => {
    return(
       <div className="wrong-guess" key={Math.random()}>
        <p className="wrong-x">X</p>
        {text}
      </div>
    );
  });
  

  return (
    <MantineProvider>
      <div className="App">
        <Confetti
          run={hasWon}
          gravity={0.9}
          numberOfPieces={400}
          recycle={false}
          style={{marginTop: -30}}
          initialVelocityY={30}
        />
        <h1>Guess the Movie by its Letterboxd Reviews</h1>
        <div id="search">
          <Select
            placeholder="Search for a film. . ."
            data={selectData}
            searchable
            value={selectState}
            rightSection={''}
            withCheckIcon={false}
            onChange={setSelectState}
            styles={{
              input: {
                height: 64,
                border: "none",
                fontStyle: "italic",
                color: "#15181C",
                fontSize: 20,
                backgroundColor: "#D9D9D9",
              }
            }}
          />
          <button 
            onClick={guess}
            disabled={wrongGuesses.length > 2}
            style={{fontWeight: "bolder", fontSize: 20}}>
            GUESS
          </button>
        </div>
        <div id="wrong-guess-wrapper">
          {wrongGuessLabels}
        </div>
        <div id="solution-wrapper">
            <div id="title-wrapper">
              <h2>REVIEWS OF</h2>
              { (titleVisible === false) &&
                <div id="title-cover" onClick={() => setTitleVisible(true)}>
                  Click to reveal answer
                  <h2 id="title-cover-text">REVIEWS OF</h2>
                </div>
              }
              <h1 className={currentAnswerClass}>
                {currentFilm.title}
              </h1>
            </div>
            <div id="year-wrapper">
              { (yearVisible === false) &&
                <div id="year-cover" onClick={() => setYearVisible(true)}>
                  Show
                  <h2 id="year-cover-text">YEAR</h2>
                </div>
              }
              <h2>RELEASED</h2>
              <p id="year-text">{currentFilm.year}</p>
            </div>
            <div id="rating-wrapper">
              { (ratingVisible === false) &&
                <div id="rating-cover" onClick={() => setRatingVisible(true)}>
                  Show
                  <h2 id="year-cover-text">RATING</h2>
                </div>
              }
              <p id="rating-text">{currentFilm.rating}</p>
              <p className="stars">★★★★★</p>
            </div>
        </div>
        <div id="review-wrapper">
          <div className="review">
            <div className="review-metadata">
              <p className="stars review-stars"
                style={{ marginRight: reviews[0].rating.length > 0 ? 8 : 2 }}
              >
                {reviews[0].rating}
              </p>
              <h3>
                Reviewed by
                <strong>{reviews[0].username}</strong>
              </h3>
            </div>
            <p>{`${reviews[0].review}`}</p>
          </div>
          { reviewsVisible > 1 &&
            <div className="review">
              <div className="review-metadata">
                <p className="stars review-stars"
                  style={{ marginRight: reviews[1].rating.length > 0 ? 8 : 2 }}
                >{
                  reviews[1].rating}
                </p>
                <h3>
                  Reviewed by
                  <strong>{reviews[1].username}</strong>
                </h3>
              </div>
              <p>{`${reviews[1].review}`}</p>
            </div>
          }
          { reviewsVisible > 2 &&
            <div className="review">
              <div className="review-metadata">
                <p className="stars review-stars" 
                  style={{ marginRight: reviews[2].rating.length > 0 ? 8 : 2 }}
                >
                  {reviews[2].rating}
                </p>
                <h3>
                  Reviewed by
                  <strong>{reviews[2].username}</strong>
                </h3>
              </div>
              <p>{`${reviews[2].review}`}</p>
            </div>
          }
          { reviewsVisible < 3 &&
            <div id="show-more-button" 
              onClick={() => setReviewsVisible(reviewsVisible + 1)}
            >
              <p id="show-more-plus">+</p>
              <p id="show-more-text">Reveal another review</p>
            </div>
          }
        </div>
      </div>
    </MantineProvider>
  );
}

export default App;
