import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const moduleAddress = "0x496fa09cb3f485f75ba07edbb668b619a994bbc3033d5e5799b43790457e10eb"; // Your Move module address
const moduleName = "SplitAndStealComputerMove"; // Your Move module name

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);

const GameWrapper1 = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="text-4xl font-semibold text-gray-800">
        ............Please connect your wallet to continue .............
      </div>
    </div>
  );
};

const GameWrapper2 = ({
  gameState,
  toggleGameState,
  handleMove,
  userSelection,
  computerSelection,
  result,
  userStats,
  userMoney,
  computerMoney,
  remainingSteals,
}: {
  gameState: boolean;
  toggleGameState: () => void;
  handleMove: (move: string) => void;
  userSelection: string;
  result: string;
  computerSelection: string;
  userStats: { win: number; lose: number; draw: number };
  userMoney: number;
  computerMoney: number;
  remainingSteals: number;
}) => {
  return (
    <div className="h-screen flex flex-col justify-center items-center ">
      <div className="w-4/5">
        <div className="flex justify-center">
          <button
            onClick={toggleGameState}
            className="bg-green-600 text-white font-semibold px-8 py-3 rounded-lg my-4 hover:bg-green-500 transition"
          >
            {gameState ? "Stop Game" : "Start Game"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* User Move */}
          <div className="bg-white shadow-lg rounded-lg p-5">
            <div className="text-xl font-semibold text-center text-gray-800 mb-4">
              Select Your Move
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {userSelection ? (
                <>
                  <button
                    onClick={() => handleMove("Clear")}
                    className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-400 transition"
                  >
                    Clear
                  </button>
                  <button className="bg-purple-600 text-white px-6 py-3 rounded-lg cursor-default">
                    {userSelection}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleMove("Split")}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-400 transition"
                  >
                    Split
                  </button>
                  <button
                    onClick={() => handleMove("Steal")}
                    className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-400 transition"
                    disabled={remainingSteals === 0}
                  >
                    Steal ({remainingSteals} left)
                  </button>
                </>
              )}
            </div>
          </div>
          {/* Computer Move */}
          <div className="bg-white shadow-lg rounded-lg p-5">
            <div className="text-xl font-semibold text-center text-gray-800 mb-4">
              Computer Move
            </div>
            <div className="flex justify-center">
              {computerSelection ? (
                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg cursor-default">
                  {computerSelection === "0" ? "Split" : "Steal"}
                </button>
              ) : (
                <div className="text-gray-500 text-lg font-semibold">
                  Take your turn first.
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Game Result */}
        <div className="mt-6">
          <div className="bg-green-500 text-white text-2xl font-semibold py-3 px-6 rounded-lg text-center">
            Game Results: {result || "-"}
          </div>
        </div>
        {/* User Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-blue-500 text-white text-lg font-semibold py-3 px-6 rounded-lg text-center">
            Wins: {userStats.win}
          </div>
          <div className="bg-red-500 text-white text-lg font-semibold py-3 px-6 rounded-lg text-center">
            Losses: {userStats.lose}
          </div>
          <div className="bg-yellow-500 text-white text-lg font-semibold py-3 px-6 rounded-lg text-center">
            Draws: {userStats.draw}
          </div>
        </div>
        {/* Money Display */}
        <div className="mt-6 flex justify-between w-full">
          <div className="bg-blue-500 text-white text-lg font-semibold py-3 px-6 rounded-lg text-center">
            Your Money: {userMoney} Rs
          </div>
          <div className="bg-purple-500 text-white text-lg font-semibold py-3 px-6 rounded-lg text-center">
            Computer Money: {computerMoney} Rs
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { account, connected, signAndSubmitTransaction } = useWallet();

  const [gameState, setGameState] = useState(false);
  const [userSelection, setUserSelection] = useState("");
  const [computerSelection, setComputerSelection] = useState("");
  const [result, setResult] = useState("");
  const [userStats, setUserStats] = useState({ win: 0, lose: 0, draw: 0 });
  const [userMoney, setUserMoney] = useState(100);
  const [computerMoney, setComputerMoney] = useState(100);
  const [remainingSteals, setRemainingSteals] = useState(5);
  const [turns, setTurns] = useState(0);

  async function toggleGameState() {
    setGameState(!gameState);

    const payload: InputTransactionData = {
      data: {
        function: `${moduleAddress}::${moduleName}::initialize`,
        functionArguments: [],
      },
    };

    await handleTransaction(payload);
    setUserSelection("");
    setComputerSelection("");
    setResult("");
    setTurns(0);
    setUserMoney(100);
    setComputerMoney(100);
    setRemainingSteals(5);
  }

  async function handleMove(move: string) {
    if (move === "Clear") {
      setUserSelection("");
      setComputerSelection("");
      setResult("");
    } else {
      // Generate random move for computer if not already done
      const randomMove = Math.random() < 0.5 ? "0" : "1"; // 0 = Split, 1 = Steal
      setComputerSelection(randomMove); // Assign random computer move immediately
      setUserSelection(move); // Set user selection
  
      if (move === "Steal") {
        setRemainingSteals((prev) => Math.max(prev - 1, 0)); // Decrease remaining steals
      }
  
      const payload: InputTransactionData = {
        data: {
          function: `${moduleAddress}::${moduleName}::generate_computer_move`,
          functionArguments: [],
        },
      };
  
      await handleTransaction(payload); // Continue with transaction to update on-chain data
    }
  }
  
  const handleTransaction = async (payload: InputTransactionData) => {
    if (!account) return;
  
    try {
      const tx = await signAndSubmitTransaction(payload);
      console.log(tx);
  
      const resultData = await client.getAccountResource({
        accountAddress: account?.address,
        resourceType: `${moduleAddress}::${moduleName}::get_computer_move`,
      });
  
      console.log(resultData.data.computer_move);
  
      const computerMove = resultData.data.computer_move;
      setComputerSelection(computerMove.toString());
  
      // Calculate money based on moves
      if (userSelection === "Split" && computerMove === 0) {
        setUserMoney(userMoney + 50);
        setComputerMoney(computerMoney + 50);
        setResult("Draw");
        setUserStats((prev) => ({ ...prev, draw: prev.draw + 1 }));
      } else if (userSelection === "Steal" && computerMove === 1) {
        setResult("Draw");
        setUserStats((prev) => ({ ...prev, draw: prev.draw + 1 }));
      } else if (userSelection === "Split" && computerMove === 1) {
        setUserMoney(userMoney);
        setComputerMoney(computerMoney + 100);
        setResult("You lose");
        setUserStats((prev) => ({ ...prev, lose: prev.lose + 1 }));
      } else if (userSelection === "Steal" && computerMove === 0) {
        setUserMoney(userMoney + 100);
        setComputerMoney(computerMoney);
        setResult("You win");
        setUserStats((prev) => ({ ...prev, win: prev.win + 1 }));
      }
  
      // Increment turns after game logic
      setTurns((prev) => prev + 1);
  
      // After 10 turns, determine the winner
      if (turns + 1 === 10) {
        if (userMoney > computerMoney) {
          setResult("You won the game!");
        } else if (userMoney < computerMoney) {
          setResult("Computer won the game!");
        } else {
          setResult("It's a tie!");
        }
      }
    } catch (error) {
      console.log("Error", error);
    }
  };
  

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center ">
      <div className="absolute right-4 top-4">
        <WalletSelector />
      </div>
      {connected ? (
        <GameWrapper2
          computerSelection={computerSelection}
          result={result}
          handleMove={handleMove}
          userSelection={userSelection}
          gameState={gameState}
          toggleGameState={toggleGameState}
          userStats={userStats}
          userMoney={userMoney}
          computerMoney={computerMoney}
          remainingSteals={remainingSteals}
        />
      ) : (
        GameWrapper1()
      )}
    </div>
  );
}

export default App;
