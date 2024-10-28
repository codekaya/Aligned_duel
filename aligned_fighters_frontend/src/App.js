import React, { useState, useEffect } from "react";
import "./App.css";
import Navbar from './Navbar';
import { io } from "socket.io-client";

const socket = io('https://duel-breaker-api.onrender.com'); // Connect to the backend server


// Character data with real images and fight stats
const characters = [
  { id: 1, name: "Warrior", info: "A powerful warrior with futuristic armor and glowing swords.", image: "https://hunterpunks.com/images/characters/10.svg", health: 100, fightScore: 90 },
  { id: 2, name: "Ninja", info: "A fast and agile ninja, skilled in stealth and combat.", image: "https://hunterpunks.com/images/characters/1.svg", health: 80, fightScore: 95 },
  { id: 3, name: "Sorcerer", info: "A mystical sorcerer wielding a glowing staff with powerful magic.", image: "https://hunterpunks.com/images/characters/2.svg", health: 70, fightScore: 85 },
  { id: 4, name: "Assassin", info: "A deadly assassin who strikes from the shadows.", image: "https://hunterpunks.com/images/characters/3.svg", health: 90, fightScore: 88 },
  { id: 5, name: "Beast", info: "A fearsome beast with immense strength and agility.", image: "https://hunterpunks.com/images/characters/4.svg", health: 120, fightScore: 80 },
  { id: 6, name: "Robot", info: "A highly advanced robot with mechanical precision.", image: "https://hunterpunks.com/images/characters/5.svg", health: 110, fightScore: 92 },
  { id: 7, name: "Alien", info: "An extraterrestrial being with unknown powers.", image: "https://hunterpunks.com/images/characters/6.svg", health: 85, fightScore: 93 },
  { id: 8, name: "Pirate", info: "A cunning pirate with a thirst for adventure.", image: "https://hunterpunks.com/images/characters/7.svg", health: 95, fightScore: 84 },
  { id: 9, name: "Samurai", info: "A disciplined samurai with a code of honor.", image: "https://hunterpunks.com/images/characters/8.svg", health: 100, fightScore: 87 }
];

function App() {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonsOpen, setIsButtonsOpen] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedButtonText, setSelectedButtonText] = useState(null); // Track the selected button text
  const [walletAddress, setWalletAddress] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [fightStarted, setFightStarted] = useState(false); // Track if the fight has started
  const [showAnimation, setShowAnimation] = useState(true); // Track if the fight animation should show
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeOpponent, setShakeOpponent] = useState(false);

  const [waitingForPlayer, setWaitingForPlayer] = useState(true);

  const [gameState, setGameState] = useState({
    player1: null,
    player2: null,
    playerCharacter: { id: 1, name: "Warrior", info: "A powerful warrior with futuristic armor and glowing swords.", image: "https://hunterpunks.com/images/characters/10.svg", health: 100, fightScore: 90 },
    opponentCharacter: null,
    gameOver: false,
    winner: null,
  });

  useEffect(() => {

    // Listen for game state updates from the server
    socket.on('gameState', (newGameState) => {
      setGameState(newGameState);
      if (newGameState.player2) {
        console.log("set waiting for plllater", waitingForPlayer)
        setWaitingForPlayer(false); // Stop waiting if both players are present
      }
    });

    return () => {
      socket.off('gameState');
    };
  }, []);

  const handleClick = (buttonIndex) => {
    setSelectedButtonText(`${generateButtonText(buttonIndex)}`);
    setIsModalOpen(true); // Open the character selection modal
  };

  const handleFightClick = () => {
    if (!walletAddress && selectedButtonText.trim() !== "Free!") {
      console.log("olmadibe")
      setShowAlert(true); 
      
    } else {
      // Proceed with fight logic
      console.log("Fight started!");
      socket.emit('joinGame',selectedCharacter);
      
      setFightStarted(true); // Start the fight
      setShowAnimation(true); // Show animation
      setTimeout(() => {
        setShowAnimation(false); // Hide animation after 2 seconds
      }, 2000);
    }
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setIsModalOpen(false); // Close the modal after character selection
    setIsButtonsOpen(false);
  };

const handlePlayerAttack = () => {
  socket.emit('playerAttack');
  setShakeOpponent(true);
  setTimeout(() => setShakeOpponent(false), 500); 
};

  const handleCloseAlert = () => {
    setShowAlert(false);  // Close the custom alert
  };

  const handleUndoClick = () => {
    setSelectedCharacter(null);
    setIsButtonsOpen(true); // Show the main screen with the buttons
    setSelectedButtonText(null); // Reset button text
    setFightStarted(false); // Reset the fight state
    setWaitingForPlayer(true);
    setGameState({
      player1: null,
      player2: null,
      playerCharacter: { id: 1, name: "Warrior", info: "A powerful warrior with futuristic armor and glowing swords.", image: "https://hunterpunks.com/images/characters/10.svg", health: 100, fightScore: 90 },
      opponentCharacter: null,
      gameOver: false,
      winner: null,
    });
    socket.emit('resetGame');
  };

// Function to generate Fibonacci sequence for the buttons, starting from the 4th button
const generateButtonText = (index) => {
  if (index === 0) return "Free!"; // First button is "Free!"
  if (index === 1) return "5$"; // Second button is "5$"
  if (index === 2) return "10$"; // Third button is "10$"

  // Fibonacci logic for the rest of the buttons (4th onwards)
  let a = 5;
  let b = 10;
  let result = 0;

  for (let i = 3; i <= index; i++) {
    result = a + b;
    a = b;
    b = result;
  }

  return `${result}$`; // Return the Fibonacci number with "$" suffix
};


  return (
    <div className="App">
      <Navbar setWalletAddress={setWalletAddress} />
      
      {!fightStarted && (<h1 className="duel-text">Duel!</h1>)}

      {/* Main Screen: Button Grid */}
      {/* {isButtonsOpen && !fightStarted && (<div className="button-container">
        {[...Array(9)].map((_, index) => (
          <button
            key={index}
            className="fight-button"
            //onClick={handleClick}
            onClick={() => handleClick(index)}
            disabled={loading}
          >
            {loading ? "Loading..." : `${(index + 1) * 5}$`}
          </button>
        ))}
      </div>)} */}

      {/* Main Screen: Button Grid */}
      {isButtonsOpen && !fightStarted && (
        <div className="button-container">
          {[...Array(9)].map((_, index) => (
            <button
              key={index}
              className="fight-button"
              onClick={() => handleClick(index)}
              disabled={loading}
            >
              {loading ? "Loading..." : generateButtonText(index)} {/* Use Fibonacci text generator */}
            </button>
          ))}
        </div>
      )}
      

      {/* Modal for Character Selection */}
      {isModalOpen && !fightStarted && (
        <div className="modal">
          <div className="modal-content">
            <h2>Select Your Character</h2>
            <div className="character-list">
              {characters.map((character) => (
                <div 
                  key={character.id} 
                  className="character-option" 
                  onClick={() => handleCharacterSelect(character)}
                >
                  <img src={character.image} alt={character.name} className="character-image" />
                  <div className="character-info-overlay">
                    <h3>{character.name}</h3>
                    <p>Health: {character.health}</p>
                    <p>Fight Score: {character.fightScore}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Display Selected Character Info */}
      {selectedCharacter && !fightStarted && (
        <div className="character-info">
          <img src={selectedCharacter.image} alt={selectedCharacter.name} className="selected-character-image" />
          <h2>Selected Character: {selectedCharacter.name}</h2>
          <p>{selectedCharacter.info}</p>
          <p>Health: {selectedCharacter.health}</p>
          <p>Fight Score: {selectedCharacter.fightScore}</p>
          <h2 className="selected-amount">Selected: {selectedButtonText}</h2>
          <button className="fight-button-fancy" onClick={() => handleFightClick()} >Fight!</button>

          {/* Undo Button inside character info */}
          <button className="undo-button" onClick={handleUndoClick}>
            &#x21A9; {/* Unicode for Undo symbol */}
          </button>

        </div>
      )}

      

      {/* Waiting for player popup */}
      {/* {fightStarted && selectedCharacter && waitingForPlayer &&(
        <div className="custom-alert">
          <div className="alert-content">
            <h2>Waiting for an opponent to join...</h2>
          </div>
        </div>
      )} */}

      {/* Waiting for player popup */}
      {fightStarted && selectedCharacter && waitingForPlayer && (
        <div className="custom-alert fancy-waiting-popup">
          <div className="alert-content">
            <h2>Waiting for an opponent to join...</h2>
            <div className="loading-character"></div> {/* Character Animation */}
            <div className="loading-spinner"></div> {/* Spinner Animation */}
            <p className="waiting-tips">
              Battle tip: Stay patient, victory awaits!
            </p>
            <div className="loading-bar">
              <div className="loading-fill"></div>
            </div>
          </div>
        </div>
      )}

      


      {/* Fight Start Animation */}
      {fightStarted && !waitingForPlayer && showAnimation &&  (
              <div className="fight-animation">
                <h1 className="fight-text">Fight!</h1>
              </div>
            )}

      {/* Game Screen for player 1*/}
      {fightStarted && !showAnimation && selectedCharacter && !waitingForPlayer && gameState.player1 === socket.id &&(
        <div className="game-screen">
          <div className="game-characters">
            {/* Player's Character */}
            <div className={`character player`}>
              <div className={`character-content ${shakePlayer ? 'shake' : ''}`}>
                <img src={gameState.playerCharacter.image} alt={gameState.playerCharacter.name} />
                <p>{gameState.playerCharacter.name}</p>
                <div className="health-bar">
                  <div
                    className="health"
                    style={{ width: `${gameState.playerCharacter.health}%` }}
                  ></div>
                  <div className="health-text">{gameState.playerCharacter.health}/100</div>
                </div>
                <div className="action-buttons">
                  <button className="attack-button" onClick={handlePlayerAttack}>Attack</button>
                  <button className="hide-button" onClick={() => {console.log("hide")}}>Hide</button>
                </div>
              </div>
            </div>

            {/* Opponent's Character */}
            <div className={`character opponent`}>
              <div className={`character-content ${shakeOpponent ? 'shake' : ''}`}>
                <img src={gameState.opponentCharacter.image} alt={gameState.opponentCharacter.name} />
                <p>{gameState.opponentCharacter.name}</p>
                <div className="health-bar">
                  <div
                    className="health"
                    style={{ width: `${gameState.opponentCharacter.health}%` }}
                  ></div>
                  <div className="health-text">{gameState.opponentCharacter.health}/100</div>
                </div>
                <div style={{ height: "155px" }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

       {/* Game Screen for player 2*/}
       {fightStarted && !showAnimation && selectedCharacter && !waitingForPlayer && gameState.player2 === socket.id &&(
        <div className="game-screen">
          <div className="game-characters">
            {/* Player's Character */}
            <div className={`character player`}>
              <div className={`character-content ${shakePlayer ? 'shake' : ''}`}>
                <img src={gameState.opponentCharacter.image} alt={gameState.opponentCharacter.name} />
                <p>{gameState.opponentCharacter.name}</p>
                <div className="health-bar">
                  <div
                    className="health"
                    style={{ width: `${gameState.opponentCharacter.health}%` }}
                  ></div>
                  <div className="health-text">{gameState.opponentCharacter.health}/100</div>
                </div>
                <div className="action-buttons">
                  <button className="attack-button" onClick={handlePlayerAttack}>Attack</button>
                  <button className="hide-button" onClick={() => {console.log("hide")}}>Hide</button>
                </div>
              </div>
            </div>

            {/* Opponent's Character */}
            <div className={`character opponent`}>
              <div className={`character-content ${shakeOpponent ? 'shake' : ''}`}>
                <img src={gameState.playerCharacter.image} alt={gameState.playerCharacter.name} />
                <p>{gameState.playerCharacter.name}</p>
                <div className="health-bar">
                  <div
                    className="health"
                    style={{ width: `${gameState.playerCharacter.health}%` }}
                  ></div>
                  <div className="health-text">{gameState.playerCharacter.health}/100</div>
                </div>
                <div style={{ height: "155px" }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Game Over Pop-up */}
        {gameState.gameOver && (
        <div className="custom-alert">
          <div className="alert-content">
            <h2>{gameState.winner === socket.id ? "You Win!" : "You Lose!"}</h2>
            <p>{`Selected amount: ${selectedButtonText}`}</p>
            <button onClick={handleUndoClick} className="alert-button">Play Again</button>
          </div>
        </div>
      )}

      {/* Fancy Alert Message */}
      {showAlert && (
        <div className="custom-alert">
          <div className="alert-content">
            <h2>Oops!</h2>
            <p>Please connect your wallet first.</p>
            <button onClick={handleCloseAlert} className="alert-button">Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
