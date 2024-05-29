import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isMobile } from 'react-device-detect';
import Confetti from 'react-confetti';
import './Imagedisplay.css';
import jsonData from './images.json';

const ItemTypes = {
  IMAGE: 'image',
};

// Helper function to shuffle an array
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const ImageBox = ({ src, type, onDrop, isMatched, isFixed }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.IMAGE,
    item: { src },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !isFixed,
  }), [isFixed]);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.IMAGE,
    drop: (item) => onDrop(item.src, src),
    canDrop: (item) => type === 'value' && !isMatched,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [isMatched]);

  const opacity = isDragging ? 0.4 : 1;
  const backgroundColor = isMatched
    ? 'transparent'
    : isOver && canDrop
    ? 'yellow'
    : 'transparent';

  return (
    <div
      ref={type === 'key' ? drag : drop}
      className="image-box"
      style={{ opacity, backgroundColor, visibility: isMatched && type === 'value' ? 'hidden' : 'visible' }}
    >
      <img src={src} alt="Drag and Drop" />
    </div>
  );
};

const Imagedisplay = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({});
  const [keys, setKeys] = useState([]);
  const [values, setValues] = useState([]);
  const [matchedKeys, setMatchedKeys] = useState([]);
  const [matchedValues, setMatchedValues] = useState([]);
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    const pageData = jsonData[currentPage];
    setData(pageData);
    setKeys(shuffleArray(Object.keys(pageData)));
    setValues(shuffleArray(Object.values(pageData)));
    setMatchedKeys([]);
    setMatchedValues([]);
    setMessage('');
    setShowConfetti(false);
    setTries(0);
  }, [currentPage]);

  const handleDrop = (draggedSrc, droppedSrc) => {
    setTries(prevTries => prevTries + 1);
    const matchedKey = Object.keys(data).find(key => data[key] === droppedSrc);
    if (matchedKey === draggedSrc) {
      setMessage('Correct!');
      setMatchedKeys((prevMatchedKeys) => [...prevMatchedKeys, draggedSrc]);
      setMatchedValues((prevMatchedValues) => [...prevMatchedValues, droppedSrc]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 10000);
    } else {
      setMessage('Wrong!');
    }
  };

  const handleNextPage = () => {
    if (currentPage < Object.keys(jsonData).length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handleRestart = () => {
    setCurrentPage(1);
  };

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div className='background'>
        <div className="title">
          <h1 className='text align text-center'>Match the images</h1>
          <p className='mt-0 tries-text fw-bold text-danger'>Tries: {tries}</p>
        </div>
        <div className="data-container">
          <div className="keys-column">
            {keys.map((key, index) => (
              <ImageBox
                key={index}
                src={key}
                type="key"
                isMatched={matchedKeys.includes(key)}
              />
            ))}
          </div>
          <div className="middle-message">
            {message && (
              <div className={`message ${message === 'Correct!' ? 'correct' : 'wrong'}`}>
                {message}
              </div>
            )}
          </div>
          <div className="values-column">
            {values.map((value, index) => (
              <ImageBox
                key={index}
                src={value}
                type="value"
                onDrop={handleDrop}
                isMatched={matchedValues.includes(value)}
                isFixed={matchedValues.includes(value)}
              />
            ))}
          </div>
        </div>
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
        {currentPage < Object.keys(jsonData).length ? (
          <button onClick={handleNextPage} className="btn btn-primary mt-5">
            Next
          </button>
        ) : (
          <div>
            <button onClick={handleRestart} className="btn btn-primary mt-5">
              Restart
            </button>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default Imagedisplay;
