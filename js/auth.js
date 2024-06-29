document.addEventListener("DOMContentLoaded", async () => {
  if (typeof window.ethereum !== "undefined") {
    const web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      document.getElementById(
        "user-account"
      ).textContent = `Logged in as: ${account}`;

      const ipfs = IpfsHttpClient({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
      });

      const contractAddress = "0xYourContractAddress";
      const contractABI = [
        // Paste your contract ABI here
      ];
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      async function uploadAgreementToIPFS(file) {
        const added = await ipfs.add(file);
        return added.path;
      }

      async function storeAgreementOnChain(checkId, ipfsHash) {
        await contract.methods
          .storeAgreement(checkId, ipfsHash)
          .send({ from: account });
        alert("Agreement stored on blockchain");
      }

      document
        .getElementById("uploadAgreementButton")
        .addEventListener("click", async () => {
          const fileInput = document.getElementById("agreementFile");
          const file = fileInput.files[0];
          const ipfsHash = await uploadAgreementToIPFS(file);
          const checkId = 1; // Replace with the actual check ID
          await storeAgreementOnChain(checkId, ipfsHash);
        });

      // Update the UI based on login status
      document.getElementById("management-center-link").style.display = "block";
      document.getElementById("issue-check-link").style.display = "block";
      document.getElementById("review-checks-link").style.display = "block";
      document.getElementById("add-recipient-link").style.display = "block";
    } catch (error) {
      console.error("User denied account access or there was an error:", error);
    }
  } else {
    console.log("No Ethereum provider found. Install MetaMask.");
  }
});
