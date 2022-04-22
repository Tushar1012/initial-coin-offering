// SPDX-License-Identifier:MIT
pragma solidity ^0.8.4;

interface ICryptoDevs {
    function tokenOfOwnerByIndex(address owner,uint256 index) external view  returns (uint256 tokenId);

    //Returns the number of tokens in ``owner``'s account
    function balanceOf(address owner) external view  returns (uint256 balance); 
}
