import React, { useState } from 'react';

const WheelUI = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const options = [
    'Option 1',
    'Option 2',
    'Option 3',
    'Option 4',
    'Option 5',
    'Option 6',
  ];

  const handleSpin = () => {
    const randomIndex = Math.floor(Math.random() * options.length);
    setSelectedOption(options[randomIndex]);
  };

  return (
    <div className="wheel-container">
      <div className="wheel">
        {options.map((option, index) => (
          <div
            key={index}
            className={`slice ${selectedOption === option ? 'selected' : ''}`}
          >
            {option}
          </div>
        ))}
      </div>
      <button className="spin-button" onClick={handleSpin}>
        Spin
      </button>
      {selectedOption && (
        <div className="selected-option">You selected: {selectedOption}</div>
      )}
    </div>
  );
};

export default WheelUI;