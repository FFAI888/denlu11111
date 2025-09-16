let provider, signer, userAddress, inviterAddress;

const CRC_ADDRESS = "0x5b2fe2b06e714b7bea4fd35b428077d850c48087";
const CRC_ABI = ["function transfer(address to, uint256 amount) public returns (bool)"];
const BSC_HTTP = "https://bsc-dataseed.binance.org/";

function showToast(msg,type="info"){
  const container=document.getElementById("toastContainer");
  const t=document.createElement("div");
  t.className=`toast toast-${type}`;
  t.textContent=msg;
  container.appendChild(t);
  setTimeout(()=>t.remove(),2000);
}

async function initWallet(){
  const ethereum = window.ethereum || window.BinanceChain;
  if(!ethereum){ alert("请安装支持以太坊/BSC 的钱包"); return; }

  provider = new ethers.providers.Web3Provider(ethereum);
  await provider.send("eth_requestAccounts",[]);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();
  document.getElementById("walletInput").value = userAddress;
  document.getElementById("qrContainer").textContent = "🔳";

  const network = await provider.getNetwork();
  if(network.chainId !== 56){
    showToast("请切换到 BSC 主网","error");
    return;
  }

  ethereum.on("chainChanged",(chainId)=>{
    const id = parseInt(chainId,16);
    if(id !== 56){ showToast("当前不是 BSC 主网，请切换","error"); }
    else{ showToast("已切换到 BSC 主网","success"); }
  });
}

// 使用 getLogs 监听 CRC 转账事件，替代轮询
async function listenCRCTransfer(callback){
  const filter = {
    address: CRC_ADDRESS,
    topics: [
      ethers.utils.id("Transfer(address,address,uint256)")
    ]
  };
  provider.on(filter, (log)=>{
    try{
      const parsed = new ethers.utils.Interface(CRC_ABI).parseLog(log);
      const from = parsed.args[0];
      const to = parsed.args[1];
      const value = parsed.args[2];
      callback({from,to,value});
    }catch(e){ console.error("解析事件出错:",e);}
  });
}

document.addEventListener("DOMContentLoaded", async ()=>{
  await initWallet();

  const btnReceive = document.getElementById("btnReceive");
  const btnSend = document.getElementById("btnSend");
  const btnBind = document.getElementById("btnBind");
  const inviterBox = document.getElementById("inviterBox");
  const inviterInput = document.getElementById("inviterInput");
  const sendBtn = document.getElementById("sendBtn");
  const tipsText = document.getElementById("tipsText");
  const crcContract = new ethers.Contract(CRC_ADDRESS,CRC_ABI,signer);

  function handleTx(tx){
    if(tx.to.toLowerCase() === userAddress.toLowerCase() && !btnReceive.disabled){
      inviterAddress = tx.from;
      btnReceive.disabled = false;
      showToast("检测到邀请人转账，确认接收按钮已激活","success");
    }
    if(inviterAddress &&
       tx.from.toLowerCase() === userAddress.toLowerCase() &&
       tx.to.toLowerCase() === inviterAddress.toLowerCase() &&
       !btnSend.disabled){
      btnSend.disabled = false;
      showToast("检测到 CRC 发送成功，确认发送按钮已激活","success");
    }
  }

  listenCRCTransfer(handleTx);

  btnReceive.addEventListener("click",()=>{
    tipsText.style.display="none";
    btnReceive.disabled = true;
    btnSend.classList.remove("hidden");
    inviterBox.classList.remove("hidden");
    inviterInput.value = inviterAddress || "0x检测中...";
  });

  sendBtn.addEventListener("click", async ()=>{
    if(!inviterAddress){ showToast("邀请人地址未检测到","error"); return; }
    try{
      const tx = await crcContract.transfer(inviterAddress,ethers.BigNumber.from("1"));
      showToast("CRC 转账已提交","info");
      sendBtn.disabled = true;
      await tx.wait();
      showToast("CRC 转账成功","success");
    }catch(err){
      showToast("CRC 转账失败: "+err.message,"error");
      sendBtn.disabled = false;
    }
  });

  btnSend.addEventListener("click",()=>{
    btnSend.disabled = true;
    btnBind.classList.remove("hidden");
  });

  btnBind.addEventListener("click",()=>{
    localStorage.setItem("inviterWallet",inviterAddress);
    showToast("确认关系成功，返回首页","success");
    setTimeout(()=>{ window.location.href="index.html"; },1500);
  });

  const qrContainer = document.getElementById("qrContainer");
  let qrZoom = false;
  qrContainer.addEventListener("click",()=>{
    if(!qrZoom){
      qrContainer.style.transform = "scale(2)";
      qrZoom = true;
      setTimeout(()=>{
        qrContainer.style.transform = "scale(1)";
        qrZoom = false;
      },20000);
    }else{
      qrContainer.style.transform = "scale(1)";
      qrZoom = false;
    }
  });
});
