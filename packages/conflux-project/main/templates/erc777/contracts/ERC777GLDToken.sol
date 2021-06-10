// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC777.sol";

contract ERC777GLDToken is ERC777 {
  constructor(uint256 initialSupply, address[] memory defaultOperators)
    ERC777("Gold", "GLD", defaultOperators)
  {
    _mint(msg.sender, initialSupply, "", "");
  }
}
