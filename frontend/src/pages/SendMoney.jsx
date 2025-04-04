import { useState } from "react";

export const SendMoney = ({ recipientName = "Alex" }) => {
  const [amount, setAmount] = useState("");

  const handleTransfer = () => {
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount!");
      return;
    }
    console.log(`Sending Rs ${amount} to ${recipientName}`);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="h-full flex flex-col justify-center w-full max-w-md">
        <div className="border h-min text-card-foreground bg-white shadow-lg rounded-lg p-6 space-y-8">
          <div className="flex flex-col space-y-1.5">
            <h2 className="text-3xl font-bold text-center text-gray-800">Send Money</h2>
          </div>

          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-2xl text-white">{recipientName[0]}</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-700">{recipientName}</h3>
            </div>

            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-gray-700" htmlFor="amount">
                  Amount (in Rs)
                </label>
                <input
                  type="number"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  id="amount"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                />
              </div>

              <button
                className="justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 w-full bg-green-500 text-white hover:bg-green-600"
                onClick={handleTransfer}
              >
                Initiate Transfer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
