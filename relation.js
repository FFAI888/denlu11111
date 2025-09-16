// v1.36 登录页面逻辑
async function connectWallet() {
  if (!window.ethereum) {
    alert("请安装 MetaMask");
    return;
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();

  localStorage.setItem("loginWallet", address);
  document.getElementById("referrerInput").value =
    localStorage.getItem("inviterWallet") || "";

  if (!localStorage.getItem("inviterWallet")) {
    window.location.href = "relation.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connectWalletBtn").addEventListener("click", connectWallet);
});
