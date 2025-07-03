import { useState, useEffect } from "react";
import "./App.css";

const puzzleData = {
  groups: {
    words_from_pulp_songs: { difficulty: 1, words: ["Common", "Disco", "Skirt", "Italia"] },
    elements_of_station_eleven: { difficulty: 2, words: ["King Lear", "Prophet", "Comic Book", "Symphony"] },
    where_we_love_to_drink: { difficulty: 3, words: ["Stairs", "Roof", "Pub", "Park"] },
    elkiran_family: { difficulty: 4, words: ["Idyll", "Alexander", "Fire", "Cause"] },
  },
  difficultyColors: {
    1: "bg-yellow-100 border-yellow-200 text-yellow-900",
    2: "bg-green-100 border-green-200 text-green-900",
    3: "bg-blue-100 border-blue-200 text-blue-900",
    4: "bg-purple-100 border-purple-200 text-purple-900",
  }
};

const getInitialWords = () => {
  let allWords = [];
  for (const groupName in puzzleData.groups) {
    const group = puzzleData.groups[groupName];
    const wordsInGroup = group.words.map(word => ({
      word: word,
      group: groupName
    }));
    allWords = [...allWords, ...wordsInGroup];
  }
  return allWords;
};

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  const [words, setWords] = useState(() => shuffle(getInitialWords()));
  const [selected, setSelected] = useState([]);
  const [revealedGroups, setRevealedGroups] = useState([]);
  const [mistakes, setMistakes] = useState(4);
  const [message, setMessage] = useState("");
  const [incorrectSelection, setIncorrectSelection] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  const toggleSelect = (word) => {
    if (gameOver) return;

    if (selected.includes(word)) {
      setSelected(selected.filter((w) => w !== word));
    } else if (selected.length < 4) {
      setSelected([...selected, word]);
    }
  };

  const submitGroup = () => {
    if (selected.length !== 4 || gameOver) return;

    const groupName = selected[0].group;
    const allSameGroup = selected.every((w) => w.group === groupName);

    if (allSameGroup) {
      const groupInfo = puzzleData.groups[groupName];
      const newRevealedGroup = {
        groupName: groupName.replace(/_/g, " "),
        words: groupInfo.words.join(", "),
        color: puzzleData.difficultyColors[groupInfo.difficulty],
        order: groupInfo.difficulty,
      };

      setRevealedGroups(prev => [...prev, newRevealedGroup].sort((a, b) => a.order - b.order));
      setWords(words.filter((w) => !selected.includes(w)));
      setSelected([]);
      setMessage("");

      if (revealedGroups.length + 1 === Object.keys(puzzleData.groups).length) {
        setMessage("Congratulations! You found all groups!");
        setGameOver(true);
      }

    } else {
      const remainingMistakes = mistakes - 1;
      setMistakes(remainingMistakes);

      setIncorrectSelection([...selected]);
      setTimeout(() => setIncorrectSelection([]), 800);

      const groups = selected.map(w => w.group);
      const groupCounts = groups.reduce((acc, group) => {
          acc[group] = (acc[group] || 0) + 1;
          return acc;
      }, {});

      if (Object.values(groupCounts).some(count => count === 3)) {
          setMessage("One away...");
      } else {
          setMessage("Not a valid group.");
      }

      if (remainingMistakes <= 0) {
        setMessage("Game Over! Better luck next time.");
        setGameOver(true);
      }
      setSelected([]);
    }
  };

  useEffect(() => {
    if (!message || message.startsWith("Congratulations") || message.startsWith("Game Over")) return;
    const timeout = setTimeout(() => setMessage(""), 2500);
    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <div className="app-container">
      <div className="game-wrapper">
        <header>
          <h1>MyConnections</h1>
          <p>Create four groups of four!</p>
        </header>

        <div className="message-area">
          {message && <div className="message">{message}</div>}
        </div>

        <div className="revealed-groups">
          {revealedGroups.map(({ groupName, words, color, order }) => (
            <div key={order} className={`group-box ${color}`}>
              <h3>{groupName.replace(/_/g, " ")}</h3>
              <p>{words}</p>
            </div>
          ))}
        </div>

        <div className="words-grid">
          {words.map((w, i) => {
            const isSelected = selected.includes(w);
            const isIncorrect = incorrectSelection.includes(w);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleSelect(w)}
                className={`word-button 
                  ${isIncorrect ? "incorrect" : ""} 
                  ${isSelected ? "selected" : ""}
                `}
                disabled={gameOver}
              >
                {w.word}
              </button>
            );
          })}
        </div>

        <div className="bottom-bar">
          <div className="mistakes">
            <span>Mistakes remaining:</span>
            <div className="dots">
              {[...Array(mistakes).keys()].map(i => (
                <span key={i} className="dot filled"></span>
              ))}
              {[...Array(4 - mistakes).keys()].map(i => (
                <span key={i} className="dot empty"></span>
              ))}
            </div>
          </div>
          <button
            onClick={submitGroup}
            disabled={selected.length !== 4 || gameOver}
            className="submit-button"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
