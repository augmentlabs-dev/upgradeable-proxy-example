pragma solidity ^0.5.12;

import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/lifecycle/Pausable.sol';

contract SimpleDB is Initializable, Pausable {
    uint internal storedData;
    event StoredValue(uint256 newData, uint256 oldData, uint256 version);

    function initialize(address sender) public initializer {
        Pausable.initialize(sender);
    }

    function set(uint256 x) public whenNotPaused {
        uint256 oldData = storedData;
        storedData = x;
        emit StoredValue(x, oldData, 1);
    }

    function get() public view whenNotPaused returns (uint256) {
        return storedData;
    }
}
