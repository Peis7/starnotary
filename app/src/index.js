import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function() {
    const { createStar } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    const starSymbol = document.getElementById("starSymbol").value;
    await createStar(name, starSymbol, id).send({from: this.account});
    App.setStatus("New Star Owner is " + this.account + ".");
  },

  approveStar: async function() {
    const { approveStar } = this.meta.methods;
    const approvedAddress = document.getElementById("approvedAddress").value;
    const starToBeApprovedId = document.getElementById("starToBeApprovedId").value;
    await approveStar(approvedAddress, starToBeApprovedId).send({from: this.account});
    App.setStatus( this.account + "  was appoved to buy " + starToBeApprovedId);
  },

  putStarUpForSale: async function() {
    const { putStarUpForSale } = this.meta.methods;
    const starPrice = document.getElementById("starPrice").value;
    const priceStarId = document.getElementById("priceStarId").value;
    await putStarUpForSale(priceStarId, starPrice).send({from: this.account});
    App.setStatus( priceStarId + "  price is set to " + starPrice);
  },

  buyStar: async function() {
    const { buyStar } = this.meta.methods;
    const starForBuyId = document.getElementById("starForBuyId").value;
    console.log('before '+ starForBuyId);
    await buyStar(starForBuyId).send({from: this.account});
    console.log('after');
    App.setStatus( this.account + "  now owns the start with id " + starForBuyId);
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function () {
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const lookid = document.getElementById("lookid").value;
    console.log("lookid: " + lookid);
    const data = await lookUptokenIdToStarInfo(lookid).call();
    console.log(data);
    App.setStatus( "name: " + data.name + " symbol: " + data.symbol);
  }

};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }

  App.start();
});