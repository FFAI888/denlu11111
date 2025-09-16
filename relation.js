// v1.36 确认关系页面 JS
let provider, signer, userAddress, inviterAddress;

const CRC_ADDRESS = "0x5b2fe2b06e714b7bea4fd35b428077d850c48087";
const CRC_ABI = ["function transfer(address to, uint256 amount) public returns (bool)"];
const BSC_HTTP = "https://bsc-dataseed.binance.org/";

// 显示 Toast 提示
function showToast(msg,type="info"){
  const container=document.getElementById("toastContainer");
  const t=document.createElement("div");
  t.className=`toast toast-${type}`;
  t.textContent=msg;
  container.appendChild(t);
  setTimeout(()=>t.remove(),2000);
}

// 初始化钱包
async function initWallet(){
  if(!window.ethereum){ alert("请安装 MetaMask 或支持 BSC 的钱包"); return; }
  provider=new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts",[]);
  signer=provider.getSigner();
  userAddress=await signer.getAddress();
  document.getElementById("walletInput").value=userAddress;
  document.getElementById("qrContainer").textContent="🔳";
}

// 轮询检测交易，3秒一次
async function pollTransactions(callback){
  const httpProvider=new ethers.providers.JsonRpcProvider(BSC_HTTP);
  let lastBlock=await httpProvider.getBlockNumber();
  setInterval(async()=>{
    try{
      const newBlock=await httpProvider.getBlockNumber();
      if(newBlock<=lastBlock) return;
      for(let i=lastBlock+1;i<=newBlock;i++){
        const block=await httpProvider.getBlockWithTransactions(i);
        for(let tx of block.transactions) callback(tx);
      }
      lastBlock=newBlock;
    }catch(e){ console.error("轮询出错:",e);}
  },3000);
}

document.addEventListener("DOMContentLoaded",async()=>{
  await initWallet();

  const btnReceive=document.getElementById("btnReceive");
  const btnSend=document.getElementById("btnSend");
  const btnBind=document.getElementById("btnBind");
  const inviterBox=document.getElementById("inviterBox");
  const inviterInput=document.getElementById("inviterInput");
  const sendBtn=document.getElementById("sendBtn");
  const tipsText=document.getElementById("tipsText");
  const crcContract=new ethers.Contract(CRC_ADDRESS,CRC_ABI,signer);

  function handleTx(tx){
    if(!btnReceive.disabled && tx.to && tx.to.toLowerCase()===userAddress.toLowerCase()){
      inviterAddress=tx.from;
      btnReceive.disabled=false;
      showToast("检测到邀请人转账，确认接收按钮已激活","success");
    }
    if(!btnSend.disabled && inviterAddress &&
       tx.from && tx.from.toLowerCase()===userAddress.toLowerCase() &&
       tx.to && tx.to.toLowerCase()===inviterAddress.toLowerCase()){
      btnSend.disabled=false;
      showToast("检测到 CRC 发送成功，确认发送按钮已激活","success");
    }
  }

  pollTransactions(handleTx);

  btnReceive.addEventListener("click",()=>{
    tipsText.style.display="none";
    btnReceive.disabled=true;
    btnSend.classList.remove("hidden");
    inviterBox.classList.remove("hidden");
    inviterInput.value=inviterAddress || "0x检测中...";
  });

  sendBtn.addEventListener("click",async()=>{
    if(!inviterAddress){ showToast("邀请人地址未检测到","error"); return; }
    try{
      const tx=await crcContract.transfer(inviterAddress,ethers.BigNumber.from("1"));
      showToast("CRC 转账已提交","info");
      sendBtn.disabled=true;
      await tx.wait();
      showToast("CRC 转账成功","success");
    }catch(err){
      showToast("CRC 转账失败: "+err.message,"error");
      sendBtn.disabled=false;
    }
  });

  btnSend.addEventListener("click",()=>{
    btnSend.disabled=true;
    btnBind.classList.remove("hidden");
  });

  btnBind.addEventListener("click",()=>{
    localStorage.setItem("inviterWallet",inviterAddress);
    showToast("确认关系成功，返回首页","success");
    setTimeout(()=>{ window.location.href="index.html"; },1500);
  });

  const qrContainer=document.getElementById("qrContainer");
  let qrZoom=false;
  qrContainer.addEventListener("click",()=>{
    if(!qrZoom){
      qrContainer.style.transform="scale(2)";
      qrZoom=true;
      setTimeout(()=>{
        qrContainer.style.transform="scale(1)";
        qrZoom=false;
      },20000);
    }else{
      qrContainer.style.transform="scale(1)";
      qrZoom=false;
    }
  });
});
