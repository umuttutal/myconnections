import { useState, useEffect } from "react";
import "./App.css";

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "_");

const puzzleData = {
  groups: [
    { title: "Words from Pulp songs", difficulty: 1, words: ["Common", "Disco", "Skirt", "Italia"] },
    { title: "Elements of Station Eleven", difficulty: 2, words: ["King Lear", "Prophet", "Comic Book", "Symphony"] },
    { title: "Where we love to drink", difficulty: 3, words: ["Stairs", "Roof", "Pub", "Park"] },
    { title: "Elkiran family", difficulty: 4, words: ["Idyll", "Alexander", "Fire", "Cause"] },
  ],
  difficultyColors: {
    1: "bg-yellow-100 border-yellow-200 text-yellow-900",
    2: "bg-green-100 border-green-200 text-green-900",
    3: "bg-blue-100 border-blue-200 text-blue-900",
    4: "bg-purple-100 border-purple-200 text-purple-900",
  },
};

const getInitialWords = () => {
  let allWords = [];
  puzzleData.groups.forEach(group => {
    const groupId = slugify(group.title);
    group.words.forEach(word => {
      allWords.push({ word, groupId });
    });
  });
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

  const toggleSelect = (word) => {
    if (mistakes === 0) return;
    if (selected.includes(word)) {
      setSelected(selected.filter((w) => w !== word));
    } else if (selected.length < 4) {
      setSelected([...selected, word]);
    }
  };

  const submitGroup = () => {
    if (selected.length !== 4) return;
    const groupId = selected[0].groupId;
    const allSameGroup = selected.every((w) => w.groupId === groupId);

    if (allSameGroup) {
      const groupInfo = puzzleData.groups.find(
        (g) => slugify(g.title) === groupId
      );
      const newRevealedGroup = {
        title: groupInfo.title,
        words: groupInfo.words.join(", "),
        color: puzzleData.difficultyColors[groupInfo.difficulty],
        order: groupInfo.difficulty,
      };
      setRevealedGroups((prev) => [...prev, newRevealedGroup]);
      setWords(words.filter((w) => !selected.includes(w)));
      setSelected([]);
      setMessage("");
    } else {
      const remainingMistakes = mistakes - 1;
      setMistakes(remainingMistakes);
      setIncorrectSelection([...selected]);
      setTimeout(() => setIncorrectSelection([]), 800);
      const groupCounts = selected.reduce((acc, w) => {
        acc[w.groupId] = (acc[w.groupId] || 0) + 1;
        return acc;
      }, {});
      if (Object.values(groupCounts).some((count) => count === 3)) {
        setMessage("One away...");
      } else {
        setMessage("");
      }
      setSelected([]);
    }
  };

  const revealRemainingGroups = () => {
    const revealedIds = new Set(revealedGroups.map((g) => slugify(g.title)));
    const remainingGroups = puzzleData.groups
      .filter((g) => !revealedIds.has(slugify(g.title)))
      .sort((a, b) => a.difficulty - b.difficulty)
      .map((group) => ({
        title: group.title,
        words: group.words.join(", "),
        color: puzzleData.difficultyColors[group.difficulty],
        order: group.difficulty,
      }));
    setRevealedGroups((prev) => [...prev, ...remainingGroups]);
    setWords([]);
    setSelected([]);
    setMessage("");
  };

  useEffect(() => {
    if (!message) return;
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
          {revealedGroups.map(({ title, words, color }, idx) => (
            <div key={idx} className={`group-box ${color}`}>
              <h3>{title}</h3>
              <p>{words}</p>
            </div>
          ))}
        </div>

        <div className="words-grid">
          {words.map((w, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleSelect(w)}
              disabled={mistakes === 0}
              className={`word-button 
                ${incorrectSelection.includes(w) ? "incorrect" : ""} 
                ${selected.includes(w) ? "selected" : ""}
              `}
            >
              <div>{w.word}</div>
            </button>
          ))}
        </div>

        <div className="bottom-bar">
          <div className="mistakes">
            <span>Mistakes remaining:</span>
            <div className="dots">
              {[...Array(mistakes).keys()].map((i) => (
                <span key={i} className="dot filled"></span>
              ))}
              {[...Array(4 - mistakes).keys()].map((i) => (
                <span key={i} className="dot empty"></span>
              ))}
            </div>
          </div>
          {mistakes === 0 ? (
            <button
              onClick={revealRemainingGroups}
              className="submit-button reveal"
            >
              Reveal
            </button>
          ) : (
            <button
              onClick={submitGroup}
              disabled={selected.length !== 4}
              className="submit-button"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
