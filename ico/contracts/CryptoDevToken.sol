 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
 
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevs.sol";

constract CryptoDevToken is ERC20, Ownable {
    // Price of one Crypto token 
    uint256 public constant tokenPrice = 0.001 ether;
    // Each NFT would give the user 10 tokens;


;
    ;
}