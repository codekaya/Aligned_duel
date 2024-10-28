// // src/Navbar.js
// import React, { useState, useEffect } from 'react';
// import './Navbar.css';
// import { Connection, PublicKey } from '@solana/web3.js';

// function Navbar({ setWalletAddress }) {
//    const [walletAddress, setLocalWalletAddress] = useState(null);

//   // Check if Phantom is installed
//   const isPhantomInstalled = () => {
//     return window.solana && window.solana.isPhantom;
//   };

//   // Connect to Phantom wallet
//   const connectWallet = async () => {
//     if (isPhantomInstalled()) {
//       try {
//         const { solana } = window;
//         const response = await solana.connect();
//         setWalletAddress(response.publicKey.toString());
//         setLocalWalletAddress(response.publicKey.toString());
//         console.log("Connected to wallet: ", response.publicKey.toString());
//       } catch (err) {
//         console.error("Wallet connection failed: ", err);
//       }
//     } else {
//       alert("Phantom wallet is not installed!");
//     }
//   };

//   // Check if the wallet is already connected
//   useEffect(() => {
//     if (isPhantomInstalled()) {
//       const { solana } = window;
//       solana.on("connect", () => {
//         const wallet = solana.publicKey.toString();
//         setWalletAddress(wallet);  // Update the wallet address in App.js
//         setLocalWalletAddress(wallet); // Update the local wallet address in Navbar
//       });

//     }
//   }, [setWalletAddress]);

//   return (
//     <nav className="navbar">
//       <div className="navbar-logo">Duel Breaker</div>
//       <ul className="navbar-links">
//         <li><a href="#home">Home</a></li>
//         <li><a href="#about">About</a></li>
//         <li><a href="#services">Services</a></li>
//         <li><a href="#contact">Contact</a></li>
//       </ul>

//       <div className="wallet-button-container">
//         {walletAddress ? (
//           <p>Connected: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</p>
//         ) : (
//           <button className="wallet-button" onClick={connectWallet}>
//             Connect Wallet
//           </button>
//         )}
//       </div>
//     </nav>
//   );
// }

// export default Navbar;
// src/Navbar.js
import React, { useState, useEffect } from 'react';
import './Navbar.css';

function Navbar({ setWalletAddress }) {
  const [walletAddress, setLocalWalletAddress] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  };

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    if (isMetaMaskInstalled()) {
      try {
        const { ethereum } = window;

        // Request account access if needed
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setWalletAddress(account);
        setLocalWalletAddress(account);
        console.log('Connected to wallet:', account);

        // Switch to Holesky testnet
        await switchToHoleskyNetwork();
      } catch (err) {
        console.error('Wallet connection failed:', err);
      }
    } else {
      alert('MetaMask is not installed!');
    }
  };

  // Switch to Holesky testnet
  const switchToHoleskyNetwork = async () => {
    const { ethereum } = window;
    const holeskyChainId = '0x4268'; // Hexadecimal chain ID of 17000
    try {
      // Try to switch to Holesky
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: holeskyChainId }],
      });
      console.log('Switched to Holesky testnet');
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Add Holesky network to MetaMask
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: holeskyChainId,
                chainName: 'Holesky Testnet',
                rpcUrls: ['https://holesky.blockchain-node-provider.com'], // Replace with an actual RPC URL
                nativeCurrency: {
                  name: 'Test ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://holesky.etherscan.io'], // Replace with actual explorer URL if available
              },
            ],
          });
          console.log('Added and switched to Holesky testnet');
        } catch (addError) {
          console.error('Failed to add Holesky testnet:', addError);
        }
      } else {
        console.error('Failed to switch to Holesky testnet:', switchError);
      }
    }
  };

  // Check if the wallet is already connected on page load/reload
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (isMetaMaskInstalled()) {
        const { ethereum } = window;
        try {
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const account = accounts[0];
            setWalletAddress(account);
            setLocalWalletAddress(account);
            console.log('Wallet already connected:', account);

            // Optionally switch to Holesky network if not already
            await switchToHoleskyNetwork();
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        }
      }
    };

    checkWalletConnection();

    // Listen for wallet connection events
    if (isMetaMaskInstalled()) {
      const { ethereum } = window;

      ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          const account = accounts[0];
          setWalletAddress(account);
          setLocalWalletAddress(account);
          console.log('Wallet connected:', account);
        } else {
          setWalletAddress(null);
          setLocalWalletAddress(null);
          console.log('Wallet disconnected');
        }
      });

      ethereum.on('chainChanged', (chainId) => {
        console.log('Chain changed to:', chainId);
        // You can add logic here to handle chain changes
      });
    }
  }, [setWalletAddress]);

  return (
    <nav className="navbar">
      <div className="navbar-logo">Aligned Fighters</div>
      <ul className="navbar-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        {/* Add other navigation links as needed */}
      </ul>

      <div className="wallet-button-container">
        {walletAddress ? (
          <p>
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        ) : (
          <button className="wallet-button" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
