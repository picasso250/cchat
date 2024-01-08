// Connect to an Ethereum node using Web3.js
const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

// 获取当前页面的URL
var currentURL = window.location.href;

// 解析URL中的查询参数
var urlParams = new URLSearchParams(currentURL);

// 获取contractAddress参数的值
var contractAddressParam = urlParams.get('contractAddress');

var contractAddress;

// 检查是否指定了contractAddress
if (contractAddressParam) {
    // 使用指定的contractAddress
    contractAddress = contractAddressParam;
    console.log("指定的contractAddress是：" + contractAddress);
} else {
    // 使用默认的contractAddress
    const defaultContractAddress = "0xffED8f99318F558fc360602cA091bB1011E4dAb8";
    contractAddress = defaultContractAddress;
    console.log("未指定contractAddress，使用默认值：" + defaultContractAddress);
}

const contractABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "message",
                "type": "string"
            }
        ],
        "name": "MessageStored",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getLastMessage",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getNickname",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "message",
                "type": "string"
            }
        ],
        "name": "sendMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "nickname",
                "type": "string"
            }
        ],
        "name": "setNickname",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Get the contract instance
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Get the account from MetaMask
let userAccount;

// Prompt user to connect their MetaMask wallet
async function connectWallet() {
    if (window.ethereum) {
        try {
            await window.ethereum.enable();
            userAccount = (await web3.eth.getAccounts())[0];
            console.log("Connected:", userAccount);
        } catch (error) {
            console.error("Error connecting:", error);
        }
    } else {
        console.error("MetaMask not found.");
    }
}

// 添加设置昵称按钮的点击事件监听器
document.getElementById("setNicknameButton").addEventListener("click", async () => {
    const nicknameInput = document.getElementById("nickname").value;

    if (!userAccount) {
        await connectWallet();
    }

    try {
        // 调用智能合约的 setNickname 方法
        await contract.methods.setNickname(nicknameInput).send({ from: userAccount });
        console.log("Nickname set successfully:", nicknameInput);
    } catch (error) {
        console.error("Error setting nickname:", error);
    }
});

// 更新发送消息按钮的点击事件监听器
document.getElementById("sendMessageButton").addEventListener("click", async () => {
    const input = document.getElementById("input").value;

    if (!userAccount) {
        await connectWallet();
    }

    try {
        // 调用智能合约的 sendMessage 方法
        await contract.methods.sendMessage(input).send({ from: userAccount });
    } catch (error) {
        console.error("Error storing string:", error);
    }
});

function createListItem(userName, sender, userString) {
    const listItem = document.createElement("li");

    const userNameSpan = document.createElement("span");
    userNameSpan.textContent = userName;
    userNameSpan.className = "user-name";

    const senderSpan = document.createElement("span");
    senderSpan.textContent = `(${sender}) `;
    senderSpan.className = "sender";

    const brElement = document.createElement("br");

    const userStringSpan = document.createElement("span");
    userStringSpan.textContent = userString;
    userStringSpan.className = "user-string";

    listItem.appendChild(userNameSpan);
    listItem.appendChild(senderSpan);
    listItem.appendChild(brElement);
    listItem.appendChild(userStringSpan);

    return listItem;
}

let options = {
    fromBlock: "genesis",
    toBlock: 'latest'
};

// Listen for new events
contract.events.MessageStored({
    fromBlock: "genesis"
}, async function (error, event) {
    if (error) {
        console.error(error);
    } else {
        const senderAddress = event.returnValues.sender;
        const message = event.returnValues.message;

        // Get the nickname for the sender
        const senderNickname = await contract.methods.getNickname(senderAddress).call();

        // Create and prepend the new list item
        const messageList = document.getElementById("messageList");
        const listItem = createListItem(senderNickname, senderAddress, message);
        messageList.insertBefore(listItem, messageList.firstChild);
    }
});
