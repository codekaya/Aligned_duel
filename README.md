# Aligned Fighters

Welcome to **Aligned Fighters**, a multiplayer online game where players engage in thrilling turn-based battles with a twist of chance. Each attack has a 50% chance of being valid, making every move unpredictable and exciting. Prove your skills, defeat your opponents, and earn the right to mint a unique NFT as a token of your victory!

![Aligned Fighters](aligned_fight_screen.png)


## Table of Contents

- [Description](#description)
- [Installation and Setup Guide](#installation-and-setup-guide)
- [Game Mechanics](#game-mechanics)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Description

**Aligned Fighters** is a blockchain-integrated game built with React on the frontend and Rust on the backend. It leverages zero-knowledge proofs (zk-SNARKs) to ensure fair play and allows winners to mint a unique NFT upon victory.

### Features

- **Multiplayer Turn-Based Battles**: Engage in strategic fights against other players.
- **Chance-Based Attacks**: Each attack has a 50% chance of being valid, adding excitement to every move.
- **Unique Characters**: Choose from a roster of characters, each with unique stats and abilities.
- **Blockchain Integration**: Interact with Ethereum blockchain networks for NFT minting.
- **Zero-Knowledge Proofs**: Ensure fair play by verifying game outcomes without revealing private data.

---

## Installation and Setup Guide

### Prerequisites

- **Node.js and npm**: For running the frontend React application.
- **Rust and Cargo**: For building and running the backend server and zk program.
- **Ethereum Wallet**: Required for blockchain interactions (e.g., MetaMask).
- **Aligned SDK**: Ensure you have the Aligned SDK installed for zk-SNARK functionalities.

### Clone the Repository

```bash
git clone https://github.com/yourusername/aligned-fighters.git
cd aligned-fighters
```
### Frontend Setup

1.  **Navigate to the frontend directory:**

```bash
    cd aligned_fighters_frontend
```

2.  **Install dependencies:**

```bash
    npm install
```

3.  **Start the React application:**

```bash
    npm start
```

The application should now be running at `http://localhost:3000`.

### Backend Setup

1.  **Navigate to the backend directory:**

```bash
    cd backend
```

2.  **Build the Rust backend:**

```bash
    cargo build --release
```

3.  **Run the backend server:**

```bash
    cargo run --release
```
    The server should now be running at `http://localhost:5005`.

### zk Program Setup

1.  **Navigate to the zk program directory:**

```bash
    cd zk_program
```

2.  **Build the zk program:**

```bash
    cargo build --release --target=riscv32im-unknown-none-elf
```
    This will generate the ELF file needed for proof generation.

* * * * *

Game Mechanics
--------------

-   **Character Selection**: Players select a character, each with unique health and fight score attributes.
-   **Battle Mechanics**:
    -   **Turn-Based Fights**: Players take turns to attack or defend.
    -   **Attack Probability**: Each attack has a 50% chance to be successful.
    -   **Health Reduction**: Successful attacks reduce the opponent's health based on attack power.
-   **Winning the Game**:
    -   The player who reduces the opponent's health to zero wins.
    -   Winners can mint a unique NFT as a token of their victory.
-   **NFT Minting**:
    -   Upon winning, the backend generates a zk-SNARK proof verifying the game's validity.
    -   The proof is submitted to the blockchain to mint an NFT.

* * * * *

Quick Start
-----------

1.  **Launch the Frontend and Backend**:

    -   Start both the frontend and backend servers as per the setup guide.
2.  **Access the Game**:

    -   Open your browser and navigate to `http://localhost:3000`.
3.  **Connect Your Wallet**:

    -   Click on the "Connect Wallet" button to link your Ethereum wallet.
4.  **Select a Character and Fight**:

    -   Choose your character and enter the battle arena.
    -   Engage in turn-based combat against another player.
5.  **Mint Your NFT**:

    -   If you win, follow the prompts to mint your unique NFT.

* * * * *

Architecture
------------

### Overview

The project consists of three main components:

1.  **Frontend (React)**:

    -   User interface for game interaction.
    -   WebSocket connection to the backend for real-time updates.
    -   Wallet integration for blockchain interactions.
2.  **Backend (Rust with Actix-Web)**:

    -   WebSocket server handling game logic and state.
    -   Manages player connections and actions.
    -   Generates zk-SNARK proofs upon game completion.
3.  **zk Program (Rust, no_std)**:

    -   Validates the integrity of the game.
    -   Ensures that the game was played fairly.
    -   Used by the backend to generate proofs.

### Data Flow

-   Players connect to the backend via WebSockets.
-   Game state is synchronized in real-time between the frontend and backend.
-   After the game ends, the backend generates a zk-SNARK proof of the game's validity.
-   The proof is submitted to the blockchain to mint an NFT.

* * * * *

Project Structure
-----------------
```bash

aligned-fighters/
├── frontend/          # React application
│   ├── src/
│   │   └── App.js     # Main React component
│   └── package.json   # Frontend dependencies
├── backend/           # Rust backend server
│   ├── src/
│   │   └── main.rs    # Main backend code
│   └── Cargo.toml     # Backend dependencies
├── zk_program/        # zk-SNARK program
│   ├── src/
│   │   └── lib.rs     # zk program code
│   └── Cargo.toml     # zk program dependencies
├── README.md          # Project README
└── LICENSE            # Project license
```
* * * * *

Contributing
------------

We welcome contributions from the community! Here's how you can help:

-   **Report Bugs**: If you find a bug, please open an issue with detailed information.
-   **Submit Pull Requests**: Fork the repository, make your changes, and submit a pull request.
-   **Feature Requests**: Have an idea for a new feature? Open an issue to discuss it.

### Development Setup

1.  **Fork and Clone the Repository**

   ```bash

    git clone https://github.com/codekaya/aligned-fighters.git
```
2.  **Create a New Branch**

```

    git checkout -b feature/my-new-feature
```

3.  **Make Your Changes**

4.  **Commit and Push**

```bash

    git add .
    git commit -m "Add my new feature"
    git push origin feature/my-new-feature
```

5.  **Submit a Pull Request**

* * * * *

## License

[Apache-2.0](LICENSE)