// v1.28 脚本文件：只支持币安链 BSC (ChainID 56)，钱包地址部分隐藏显示

// 显示 Toast 提示
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // 3 秒后移除
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// 裁剪钱包地址：0x123456...abcd
function shortenAddress(address) {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
}

document.getElementById('connectWalletBtn').addEventListener('click', async function() {
    const btn = document.getElementById('connectWalletBtn');
    const statusDiv = document.getElementById('walletStatus');

    if (!window.ethereum) {
        showToast('未检测到钱包，请安装 MetaMask 或支持 BSC 的钱包', 'error');
        return;
    }

    try {
        // 修改按钮状态
        btn.innerHTML = '<div class="loader"></div> 正在连接...';
        btn.disabled = true;
        statusDiv.textContent = '钱包连接中...';

        // 请求账户权限
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        const shortAccount = shortenAddress(account);

        // 检查当前网络
        let chainId = await ethereum.request({ method: 'eth_chainId' });

        if (chainId !== '0x38') {
            try {
                // 请求切换到 BSC
                await ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x38' }],
                });
                chainId = '0x38';
                showToast('已切换到 BSC 网络', 'success');
            } catch (switchError) {
                if (switchError.code === 4902) {
                    try {
                        await ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x38',
                                chainName: 'Binance Smart Chain',
                                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                                blockExplorerUrls: ['https://bscscan.com'],
                                nativeCurrency: {
                                    name: 'BNB',
                                    symbol: 'BNB',
                                    decimals: 18
                                }
                            }]
                        });
                        chainId = '0x38';
                        showToast('已添加并切换到 BSC 网络', 'success');
                    } catch (addError) {
                        console.error('添加 BSC 网络失败', addError);
                        showToast('请手动添加并切换到 BSC 网络', 'warning');
                        btn.textContent = '连接钱包';
                        btn.disabled = false;
                        return;
                    }
                } else {
                    console.error('切换网络失败', switchError);
                    showToast('请切换到 BSC 网络', 'warning');
                    btn.textContent = '连接钱包';
                    btn.disabled = false;
                    return;
                }
            }
        }

        // 成功连接 BSC
        if (chainId === '0x38') {
            statusDiv.textContent = '钱包连接成功：' + shortAccount;
            showToast('钱包连接成功：' + shortAccount, 'success');
            btn.textContent = '连接钱包';
            btn.disabled = false;

            btn.classList.add('success-flash');
            setTimeout(() => btn.classList.remove('success-flash'), 1000);
        }

    } catch (error) {
        console.error(error);
        showToast('连接失败，请重试', 'error');
        statusDiv.textContent = '连接失败，请重试';
        btn.textContent = '连接钱包';
        btn.disabled = false;
    }
});
