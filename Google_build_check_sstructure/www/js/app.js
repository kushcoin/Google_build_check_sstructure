document.addEventListener("DOMContentLoaded", (event) => {
  const loginForm = document.querySelector("#loginForm");
  const signupForm = document.querySelector("#signupForm");
  const forgotPasswordForm = document.querySelector("#forgotPasswordForm");
  const issueCheckForm = document.querySelector("#issueCheckForm");
  const addRecipientForm = document.querySelector("#addRecipientForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const result = await response.json();
          alert(result.message);
          return;
        }

        const result = await response.json();
        alert(result.message);
        if (result.message === "Login successful") {
          window.location.href = "ManagementCenter.html";
        } else {
          alert(result.message);
        }
      } catch (error) {
        alert("Error logging in. Please try again.");
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!username || !email || !password) {
        alert("All fields are required.");
        return;
      }

      if (!validateEmail(email)) {
        alert("Invalid email format.");
        return;
      }

      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
          const result = await response.json();
          alert(result.message);
          return;
        }

        const result = await response.json();
        alert(result.message);
        if (result.message === "User registered successfully") {
          window.location.href = "login.html";
        }
      } catch (error) {
        alert("Error signing up. Please try again.");
      }
    });
  }

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;

      if (!email) {
        alert("Email is required.");
        return;
      }

      try {
        const response = await fetch("/api/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const result = await response.json();
        alert(result.message);
      } catch (error) {
        alert("Error resetting password. Please try again.");
      }
    });
  }

  if (issueCheckForm) {
    issueCheckForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const payer = document.getElementById("payer").value;
      const recipientSelect = document.getElementById("recipient");
      const recipientId =
        recipientSelect.options[recipientSelect.selectedIndex].value;
      const amount = document.getElementById("amount").value;

      if (!payer || !recipientId || !amount) {
        alert("Please fill in all fields.");
        return;
      }

      try {
        const response = await fetch("/issue-check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payer, recipientId, amount }),
        });

        if (!response.ok) {
          const result = await response.json();
          alert(result.message);
          return;
        }

        const result = await response.json();
        alert(
          `Check issued successfully: ${result.transaction_receipt.transactionHash}`
        );
        issueCheckForm.reset();
      } catch (error) {
        alert("Error issuing check. Please try again.");
      }
    });

    loadRecipients();
  }

  if (addRecipientForm) {
    addRecipientForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const cryptoAddress = document
        .getElementById("cryptoAddress")
        .value.trim();
      const physicalAddress = document
        .getElementById("physicalAddress")
        .value.trim();
      const ein = document.getElementById("ein").value.trim();
      const companyInfo = document.getElementById("companyInfo").value.trim();

      if (!name || !cryptoAddress) {
        alert("Name and Crypto Address are required.");
        return;
      }

      // Basic validation for Ethereum address
      if (!web3.utils.isAddress(cryptoAddress)) {
        alert("Invalid Ethereum address.");
        return;
      }

      try {
        const response = await fetch("/add-recipient", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            cryptoAddress,
            physicalAddress,
            ein,
            companyInfo,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          alert(result.message);
          return;
        }

        const result = await response.json();
        alert(`Recipient added successfully with ID: ${result.recipient_id}`);
        addRecipientForm.reset();
      } catch (error) {
        alert("Error adding recipient. Please try again.");
      }
    });
  }
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

async function loadRecipients() {
  const recipientSelect = document.getElementById("recipient");

  try {
    const response = await fetch("/recipients");
    const recipients = await response.json();

    recipientSelect.innerHTML = recipients
      .map(
        (recipient) => `
            <option value="${recipient.id}">${recipient.name}</option>
        `
      )
      .join("");
  } catch (error) {
    recipientSelect.innerHTML =
      "<option>Error loading recipients. Please try again.</option>";
  }
}

async function loadChecks() {
  const checksList = document.getElementById("checks-list");

  if (checksList) {
    try {
      const response = await fetch("/review-checks");
      const checks = await response.json();

      checksList.innerHTML = checks
        .map(
          (check) => `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Check from ${check.payer} to ${check.payee}</h5>
                        <p class="card-text">Amount: $${check.amount}</p>
                        <button class="btn btn-success" onclick="approveCheck(${check.id})">Approve</button>
                    </div>
                </div>
            `
        )
        .join("");
    } catch (error) {
      checksList.innerHTML = "<p>Error loading checks. Please try again.</p>";
    }
  }
}

async function approveCheck(checkId) {
  try {
    const response = await fetch("/approve-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ check_id: checkId }),
    });

    if (!response.ok) {
      const result = await response.json();
      alert(result.message);
      return;
    }

    const result = await response.json();
    alert(
      `Check approved successfully: ${result.transaction_receipt.transactionHash}`
    );
    loadChecks();
  } catch (error) {
    alert("Error approving check. Please try again.");
  }
}

// Initialize Web3
if (typeof window.ethereum !== "undefined") {
  window.web3 = new Web3(window.ethereum);
  window.ethereum.enable();
} else {
  console.log("No Ethereum provider detected. Install MetaMask.");
}

// Contract ABI and Address
const contractABI = [
  /* ABI array here */
];
const contractAddress = "0xYourContractAddress";
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Issue Check
document
  .getElementById("issueCheckForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const amount = document.getElementById("amount").value;
    const recipients = document.getElementById("recipients").value.split(",");
    const contractHash = document.getElementById("contractHash").value;
    const expirationDate =
      new Date(document.getElementById("expirationDate").value).getTime() /
      1000;

    const accounts = await web3.eth.getAccounts();
    try {
      await contract.methods
        .issueCheck(amount, recipients, contractHash, expirationDate)
        .send({ from: accounts[0] });
      alert("Check issued successfully");
    } catch (error) {
      console.error(error);
      alert("Error issuing check. Please try again.");
    }
  });
