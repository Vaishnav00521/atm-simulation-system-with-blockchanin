// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GlobalATM {
    
    mapping(address => uint256) public balances;

    // The deposit function must be payable to receive ETH
    // In your EthereumService, this is called with no arguments but includes transaction value
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    // The withdraw function
    function withdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw");
        
        balances[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed.");
    }
    
    // Fallback to accept direct transfers
    receive() external payable {
        balances[msg.sender] += msg.value;
    }
}
