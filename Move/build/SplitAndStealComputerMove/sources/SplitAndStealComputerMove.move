module metaschool::SplitAndStealComputerMove {
    use std::signer;
    use aptos_framework::randomness;

    /// Struct to store the computer's move
    struct ComputerMoveResult has key {
        computer_move: u8, // 0 = Split, 1 = Steal
    }

    /// Initialize the computer move storage
    public entry fun initialize(account: &signer) {
        if (!exists<ComputerMoveResult>(signer::address_of(account))) {
            let result = ComputerMoveResult { computer_move: 2 }; // Default value (2 means uninitialized)
            move_to(account, result);
        }
    }

    /// Generate and store the computer's move
    #[randomness]
     entry fun generate_computer_move(account: &signer) acquires ComputerMoveResult {
        let random_value = randomness::u64_range(0, 2); // Generates 0 or 1
        let result = borrow_global_mut<ComputerMoveResult>(signer::address_of(account));
        result.computer_move = random_value as u8; // Cast u64 to u8 for storage
    }

    /// Retrieve the computer's move
    public fun get_computer_move(account: &signer): u8 acquires ComputerMoveResult {
        let result = borrow_global<ComputerMoveResult>(signer::address_of(account));
        result.computer_move
    }
}