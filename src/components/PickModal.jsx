import React, { useState } from 'react';
import { optionMap } from '../assets/img';

const PickModal = ({handlePick}) => {
  const [selected, setSelected] = useState(null);

  const options = [
    {
      id: 1,
      title: 'Option 1',
      img: optionMap.option1,
      val:"FG_1"
    },
    {
      id: 2,
      title: 'Option 2',
      img: optionMap.option2,
      val:'FG_2'
    },
  ];



  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-96 max-w-[90%] p-6 relative">
        <h2 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Pick Free Spin Type
        </h2>

        <div className="flex justify-center gap-6 mb-6">
          {options.map((option) => (
            <div
              key={option.id}
              className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center transition-all ${
               selected &&  selected.id === option.id
                  ? 'border-green-500 scale-105'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
              onClick={() => setSelected(option)}
            >
              <img
                src={option.img}
                alt={option.title}
                className="w-24 h-24 object-cover mb-2 rounded-lg"
              />
              <span className="text-gray-800 dark:text-white font-medium">
                {option.title}
              </span>
            </div>
          ))}
        </div>

        <button
          className={`w-full py-2 rounded-lg text-white font-semibold transition ${
            selected
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!selected}
          onClick={() => handlePick(selected.val)}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default PickModal;
