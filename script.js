// v1.36 登录页面 JS
async function connectWallet() {
  console.log("点击连接钱包触发");

  if (!window.ethereum) { alert("请安装 MetaMask"); return; }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    localStorage.setItem("loginWallet", address);
    const referrerInput = document.getElementById("referrerInput");
    referrerInput.value = localStorage.getItem("inviterWallet") || "";

    showToast("钱包已连接: " + address, "success");

    if (!localStorage.getItem("inviterWallet")) {
      showToast("跳转确认关系页面", "info");
      setTimeout(() => { window.location.href = "relation.html"; }, 1000);
    }
  } catch (err) {
    console.error("连接钱包失败:", err);
    alert("连接钱包失败: " + err.message);
  }
}

function showToast(msg, type="info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(()=>toast.remove(),2000);
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("connectWalletBtn");
  if(!btn) console.error("connectWalletBtn 按钮未找到");
  btn.addEventListener("click", connectWallet);
});
