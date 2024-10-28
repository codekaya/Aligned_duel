// #![no_main]
// #![no_std]

// use sp1_zkvm::entrypoint;
// use sp1_zkvm::io;

// entrypoint!(main);

#![no_main]
#![no_std]

extern crate alloc;

use sp1_zkvm::entrypoint;
use sp1_zkvm::io;

// Import necessary types from `alloc`
use alloc::string::String;
use alloc::vec::Vec;
use alloc::format; // For `format!` macro
entrypoint!(main);


pub fn main() {
    let input = io::read::<String>();

    // Split the input into parts
    let parts: Vec<&str> = input.trim().split(';').collect();

    // Parse initial health values
    let healths: Vec<&str> = parts[0].split(',').collect();
    let mut player_health = parse_i32(healths[0]);
    let mut opponent_health = parse_i32(healths[1]);

    // Initialize constants
    let player_attack_power = 20;
    let player_defense = 10;
    let opponent_attack_power = 15;
    let opponent_defense = 5;

    // Simulate the game
    for action_pair in &parts[1..] {
        let actions: Vec<&str> = action_pair.split(',').collect();
        if actions.len() != 2 {
            panic!("Invalid action pair");
        }
        let player_action = actions[0].chars().next().unwrap();
        let opponent_action = actions[1].chars().next().unwrap();

        match (player_action, opponent_action) {
            ('A', 'A') => {
                opponent_health -= player_attack_power;
                player_health -= opponent_attack_power;
            }
            ('A', 'D') => {
                let damage = player_attack_power - opponent_defense;
                if damage > 0 {
                    opponent_health -= damage;
                }
            }
            ('D', 'A') => {
                let damage = opponent_attack_power - player_defense;
                if damage > 0 {
                    player_health -= damage;
                }
            }
            ('D', 'D') => {
                // Both defend; nothing happens
            }
            _ => {
                panic!("Invalid actions");
            }
        }

        // Check for negative health
        if player_health <= 0 || opponent_health <= 0 {
            break;
        }
    }

    // Verify the player won
    if opponent_health > 0 {
        panic!("Player did not win the game");
    }

    // If all checks pass, the proof is valid
}


fn parse_i32(s: &str) -> i32 {
    let bytes = s.as_bytes();
    let mut num = 0i32;
    let mut is_negative = false;
    let mut idx = 0;

    if !bytes.is_empty() && bytes[0] == b'-' {
        is_negative = true;
        idx = 1;
    }

    for &b in &bytes[idx..] {
        if b < b'0' || b > b'9' {
            panic!("Invalid number");
        }
        num = num * 10 + ((b - b'0') as i32);
    }

    if is_negative {
        -num
    } else {
        num
    }
}

