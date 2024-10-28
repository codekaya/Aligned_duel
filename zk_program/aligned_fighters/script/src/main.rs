#![feature(slice_flatten)]
use std::io;

use aligned_sdk::core::types::{
    AlignedVerificationData, Network, PriceEstimate, ProvingSystemId, VerificationData,
};
use aligned_sdk::sdk::{deposit_to_aligned, estimate_fee};
use aligned_sdk::sdk::{get_next_nonce, submit_and_wait_verification};
use clap::Parser;
use dialoguer::Confirm;
use ethers::prelude::*;
use ethers::providers::{Http, Provider};
use ethers::signers::{LocalWallet, Signer};
use ethers::types::{Address, Bytes, H160, U256};
use sp1_sdk::{ProverClient, SP1Stdin};
use actix_web::{web, App, HttpServer, Responder, HttpResponse};
use std::str::FromStr;
//use serde::{Serialize, Deserialize};


abigen!(VerifierContract, "VerifierContract.json",);

const ELF: &[u8] = include_bytes!("../../program/elf/riscv32im-succinct-zkvm-elf");

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    #[arg(short, long)]
    keystore_path: String,
    #[arg(
        short,
        long,
        default_value = "https://ethereum-holesky-rpc.publicnode.com"
    )]
    rpc_url: String,
    #[arg(short, long, default_value = "wss://batcher.alignedlayer.com")]
    batcher_url: String,
    #[arg(short, long, default_value = "holesky")]
    network: Network,
    #[arg(short, long)]
    verifier_contract_address: H160,
}

//#[derive(Serialize, Deserialize, Debug)]
struct GameState {
    player_health: i32,
    opponent_health: i32,
    actions: Vec<(char, char)>, // Stores tuples of (player_action, opponent_action)
}

#[derive(Debug)]
struct Player {
    health: i32,
    attack_power: i32,
    defense: i32,
}

impl Player {
    fn new(health: i32, attack_power: i32, defense: i32) -> Self {
        Player {
            health,
            attack_power,
            defense,
        }
    }
}

#[tokio::main]
async fn main() {
    println!("Welcome to the zkFight Game! Battle the opponent, generate a zkProof, and claim your NFT!");

    let args = Args::parse();
    let rpc_url = args.rpc_url.clone();

    let keystore_password = rpassword::prompt_password("Enter keystore password: ")
        .expect("Failed to read keystore password");

    let provider =
        Provider::<Http>::try_from(rpc_url.as_str()).expect("Failed to connect to provider");

    let chain_id = provider
        .get_chainid()
        .await
        .expect("Failed to get chain_id");

    let wallet = LocalWallet::decrypt_keystore(args.keystore_path, &keystore_password)
        .expect("Failed to decrypt keystore")
        .with_chain_id(chain_id.as_u64());

    let signer = SignerMiddleware::new(provider.clone(), wallet.clone());

    if Confirm::with_theme(&dialoguer::theme::ColorfulTheme::default())
        .with_prompt("Do you want to deposit 0.004 ETH into Aligned? (Not needed if you've already deposited)")
        .interact()
        .expect("Failed to read user input")
    {
        deposit_to_aligned(U256::from(4000000000000000u128), signer.clone(), args.network)
            .await
            .expect("Failed to pay for proof submission");
    }

    // Initialize game
    let mut stdin = SP1Stdin::new();

    println!("Starting the fight...");

    let mut player = Player::new(100, 20, 10);
    let mut opponent = Player::new(100, 15, 5);

    let mut game_state = GameState {
        player_health: player.health,
        opponent_health: opponent.health,
        actions: Vec::new(),
    };

    // Game loop
    while player.health > 0 && opponent.health > 0 {
        let player_action = get_player_action();
        let opponent_action = get_opponent_action();

        // Record actions
        game_state.actions.push((player_action, opponent_action));

        // Apply actions
        apply_actions(&mut player, &mut opponent, player_action, opponent_action);

        // Update game state
        game_state.player_health = player.health;
        game_state.opponent_health = opponent.health;

        // Check for end of game
        if opponent.health <= 0 {
            println!("You defeated the opponent!");
            break;
        } else if player.health <= 0 {
            println!("You were defeated by the opponent!");
            break;
        } else {
            println!("The fight continues...");
        }
    }

    // Serialize game state for proof generation
    // let game_state_serialized = serde_json::to_string(&game_state).expect("Failed to serialize game state");
    // stdin.write(&game_state_serialized);

    // Serialize game state into the custom format
    let mut serialized = format!("{},{}", game_state.player_health, game_state.opponent_health);

    for (player_action, opponent_action) in &game_state.actions {
        serialized.push(';');
        serialized.push(*player_action);
        serialized.push(',');
        serialized.push(*opponent_action);
    }

    // Write to stdin for proof generation
    stdin.write(&serialized);

    //println!("Hello, world! {}",game_state_serialized );


    println!("Generating Proof...");

    let client = ProverClient::new();
    let (pk, vk) = client.setup(ELF);

    // Generate proof based on the game state
    let Ok(proof) = client.prove(&pk, stdin).run() else {
        println!("Failed to generate proof!");
        return;
    };

    // // Simulate one turn for simplicity
    // let player_action = get_player_action();
    // let opponent_action = get_opponent_action();

    // // Record actions (e.g., 'A' for attack, 'D' for defend)
    // let actions = format!("{}{}", player_action, opponent_action);
    // stdin.write(&actions);

    // // Apply actions
    // apply_actions(&mut player, &mut opponent, player_action, opponent_action);

    // // Check if player won
    // if opponent.health <= 0 {
    //     println!("You defeated the opponent!");
    // } else if player.health <= 0 {
    //     println!("You were defeated by the opponent!");
    //     return;
    // } else {
    //     println!("The fight continues... but for this demo, we'll stop here.");
    // }

    // println!("Generating Proof...");

    // let client = ProverClient::new();
    // let (pk, vk) = client.setup(ELF);

    // // Generate proof based on the game state
    // let Ok(proof) = client.prove(&pk, stdin).run() else {
    //     println!("Failed to generate proof!");
    //     return;
    // };

    println!("Proof generated successfully. Verifying proof...");
    client.verify(&proof, &vk).expect("Verification failed");
    println!("Proof verified successfully.");

    println!("Submitting proof...");

    // Serialize proof into bincode (format used by sp1)
    let proof = bincode::serialize(&proof).expect("Failed to serialize proof");

    let verification_data = VerificationData {
        proving_system: ProvingSystemId::SP1,
        proof,
        proof_generator_addr: wallet.address(),
        vm_program_code: Some(ELF.to_vec()),
        verification_key: None,
        pub_input: None,
    };

    let max_fee = estimate_fee(&rpc_url, PriceEstimate::Default)
        .await
        .expect("Failed to fetch gas price from the blockchain");

    let max_fee_string = ethers::utils::format_units(max_fee, 18).unwrap();

    if !Confirm::with_theme(&dialoguer::theme::ColorfulTheme::default())
        .with_prompt(format!("Aligned will use at most {max_fee_string} ETH to verify your proof. Do you want to continue?"))
        .interact()
        .expect("Failed to read user input")
    {
        return;
    }

    let nonce = get_next_nonce(&rpc_url, wallet.address(), args.network)
        .await
        .expect("Failed to get next nonce");

    println!("Submitting your proof...");

    let aligned_verification_data = submit_and_wait_verification(
        &args.batcher_url,
        &rpc_url,
        args.network,
        &verification_data,
        max_fee,
        wallet.clone(),
        nonce,
    )
    .await
    .unwrap();

    println!(
        "Proof submitted and verified successfully on batch {}",
        hex::encode(aligned_verification_data.batch_merkle_root)
    );
    println!("Claiming NFT prize...");

    claim_nft_with_verified_proof(
        &aligned_verification_data,
        signer,
        &args.verifier_contract_address,
    )
    .await
    .expect("Claiming of NFT failed...");
}

// Function to get player's action
fn get_player_action() -> char {
    println!("Choose your action:");
    println!("A. Attack");
    println!("D. Defend");

    loop {
        let mut action = String::new();

        io::stdin()
            .read_line(&mut action)
            .expect("Failed to read from stdin");

        action = action.trim().to_string();
        if action.len() != 1 {
            println!("Please enter a valid action (A or D)");
            continue;
        }

        let c = action.chars().next().unwrap().to_uppercase().next().unwrap();
        if c != 'A' && c != 'D' {
            println!("Please enter a valid action (A or D)");
            continue;
        }

        return c;
    }
}

// Function to simulate opponent's action
fn get_opponent_action() -> char {
    // For simplicity, opponent randomly chooses an action
    use rand::Rng;
    let actions = ['A', 'D'];
    let idx = rand::thread_rng().gen_range(0..actions.len());
    actions[idx]
}

// Function to apply actions and update player and opponent states
fn apply_actions(
    player: &mut Player,
    opponent: &mut Player,
    player_action: char,
    opponent_action: char,
) {
    println!(
        "You chose to {}. Opponent chose to {}.",
        action_to_string(player_action),
        action_to_string(opponent_action)
    );

    match (player_action, opponent_action) {
        ('A', 'A') => {
            // Both attack
            opponent.health -= player.attack_power;
            player.health -= opponent.attack_power;
        }
        ('A', 'D') => {
            // Player attacks, opponent defends
            let damage = player.attack_power - opponent.defense;
            if damage > 0 {
                opponent.health -= damage;
            }
        }
        ('D', 'A') => {
            // Opponent attacks, player defends
            let damage = opponent.attack_power - player.defense;
            if damage > 0 {
                player.health -= damage;
            }
        }
        ('D', 'D') => {
            // Both defend, nothing happens
            println!("Both defended. Nothing happens.");
        }
        _ => {}
    }

    println!(
        "Your health: {}. Opponent's health: {}.",
        player.health, opponent.health
    );
}

// Helper function to convert action character to string
fn action_to_string(action: char) -> &'static str {
    match action {
        'A' => "Attack",
        'D' => "Defend",
        _ => "Unknown",
    }
}

async fn claim_nft_with_verified_proof(
    aligned_verification_data: &AlignedVerificationData,
    signer: SignerMiddleware<Provider<Http>, LocalWallet>,
    verifier_contract_addr: &Address,
) -> anyhow::Result<()> {


    let address_str = "0xC5954e227057f8Ff459EeEbeC10C5F12a880bf6b";
    let address = Address::from_str(address_str).expect("Invalid address");
    let verifier_contract = VerifierContract::new(address, signer.into());

    let index_in_batch = U256::from(aligned_verification_data.index_in_batch);
    let merkle_path = Bytes::from(
        aligned_verification_data
            .batch_inclusion_proof
            .merkle_path
            .as_slice()
            .flatten()
            .to_vec(),
    );

    let receipt = verifier_contract
        .verify_batch_inclusion(
            aligned_verification_data
                .verification_data_commitment
                .proof_commitment,
            aligned_verification_data
                .verification_data_commitment
                .pub_input_commitment,
            aligned_verification_data
                .verification_data_commitment
                .proving_system_aux_data_commitment,
            aligned_verification_data
                .verification_data_commitment
                .proof_generator_addr,
            aligned_verification_data.batch_merkle_root,
            merkle_path,
            index_in_batch,
        )
        .send()
        .await
        .map_err(|e| anyhow::anyhow!("Failed to send tx {}", e))?
        .await
        .map_err(|e| anyhow::anyhow!("Failed to submit tx {}", e))?;

    match receipt {
        Some(receipt) => {
            println!(
                "Prize claimed successfully. Transaction hash: {:x}",
                receipt.transaction_hash
            );
            Ok(())
        }
        None => {
            anyhow::bail!("Failed to claim prize: no receipt");
        }
    }
}
