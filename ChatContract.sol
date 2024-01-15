// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract ChatContract {
    event MessageStored(address indexed sender, string message);

    mapping(address => string) private lastMessages;
    mapping(address => string) private nicknames;

    function getLastMessage(address user) external view returns (string memory) {
        return lastMessages[user];
    }

    function getNickname(address user) external view returns (string memory) {
        return nicknames[user];
    }

    function setNickname(string memory nickname) external {
        address user = msg.sender;
        nicknames[user] = nickname;
    }

    function sendMessage(string memory message) external {
        address sender = msg.sender;
        lastMessages[sender] = message;
        emit MessageStored(sender, message);
    }
}
