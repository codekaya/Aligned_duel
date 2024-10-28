# Aligned Fighters

## Introduction

Step into a world where pixels pack a punch and precision is everything. Aligned Arena is a high-stakes duel game where players face off in thrilling one-on-one battles, each wielding a unique pixel warrior with distinct abilities. It’s not just about strength; it’s about strategy, timing, and the perfect alignment of skill and reflexes.

In a universe where every pixel counts, you’ll go head-to-head with other players, mastering combos and dodges in fast-paced combat. With retro-style graphics and meticulously designed pixel characters, Aligned Arena brings together the nostalgia of classic games with the thrill of modern PvP gameplay.

Whether you're a seasoned gamer or new to the battlefield, the arena awaits those ready to fight for victory. Are you aligned for the challenge?

This intro highlights the competitive, retro aesthetic of the game while emphasizing skill and strategy. Let me know if you want to emphasize any other aspects!


## Requirements

1. [Rust](https://www.rust-lang.org/tools/install)
2. [Foundry](https://getfoundry.sh)

## Usage

### 1 - Create Keystore

You can use cast to create a local keystore.
If you already have one you can skip this step.

```bash
cast wallet new-mnemonic
```

Then you can import your created keystore using:

```bash
cast wallet import --interactive <path_to_keystore.json>
```

Then you need to obtain some funds to pay for gas and proof verification.
You can do this by using this [faucet](https://cloud.google.com/application/web3/faucet/ethereum/holesky)

### 2 -  Fight

To answer quiz questions run:

```bash
make answer_quiz KEYSTORE_PATH=<path_to_keystore.json>
```

This will:

1. Fight with each other
2. Generate ZK proof
3. Pay & submit proof to aligned for verification
4. Wait for proof to be verified in aligned
5. Claim NFT if proof is verified

