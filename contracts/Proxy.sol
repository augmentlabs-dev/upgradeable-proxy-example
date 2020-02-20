pragma solidity ^0.5.12;

import "./IERC897.sol";

// heavily based on OpenZeppelin's SDK Implementation of this: https://github.com/OpenZeppelin/openzeppelin-sdk/blob/master/packages/lib/contracts/upgradeability/Proxy.sol
contract Proxy is IERC897 {
    bytes32 private constant implementationPosition = keccak256(
        "com.example.implementation.address"
    );

    bytes32 private constant proxyOwnerPosition = keccak256(
        "com.example.proxy.owner"
    );

    event Upgraded(address oldCodeAddr, address newCodeAddr);

    constructor() public {
        _setUpgradeabilityOwner(msg.sender);
    }

    function proxyOwner() public view returns (address owner) {
        bytes32 position = proxyOwnerPosition;
        assembly {
            owner := sload(position)
        }
    }

    modifier onlyProxyOwner() {
        require(
            msg.sender == proxyOwner(),
            "Proxy: Only the proxy owner is permitted to do this action"
        );
        _;
    }

    function transferProxyOwnership(address _newOwner) public onlyProxyOwner {
        require(
            _newOwner != address(0),
            "Proxy: NewOwner cannot be the null address"
        );
        _setUpgradeabilityOwner(_newOwner);
    }

    function _setUpgradeabilityOwner(address _newProxyOwner) internal {
        bytes32 position = proxyOwnerPosition;
        assembly {
            sstore(position, _newProxyOwner)
        }
    }

    function upgradeTo(address _implementation) public onlyProxyOwner {
        _upgradeTo(_implementation);
    }

    function _upgradeTo(address _newImplementation) internal {
        address currentImplementation = implementation();
        require(
            currentImplementation != _newImplementation,
            "Proxy: The new implementation is the same as the current one"
        );
        require(
            _newImplementation != address(0),
            "Proxy: The new implementation cannot be the null address"
        );
        _setImplementation(_newImplementation);
        emit Upgraded(currentImplementation, _newImplementation);
    }

    function _setImplementation(address _newImplementation) internal {
        bytes32 position = implementationPosition;
        assembly {
            sstore(position, _newImplementation)
        }
    }

    function() external payable {
        _fallback();
    }

    function _delegate(address implementation) internal {
        assembly {
            calldatacopy(0, 0, calldatasize)

            let result := delegatecall(
                gas,
                implementation,
                0,
                calldatasize,
                0,
                0
            )

            returndatacopy(0, 0, returndatasize)

            switch result
                case 0 {
                    revert(0, returndatasize)
                }
                default {
                    return(0, returndatasize)
                }
        }
    }

    function _willFallback() internal {}

    function _fallback() internal {
        _willFallback();
        _delegate(implementation());
    }

    function implementation() public view returns (address impl) {
        bytes32 position = implementationPosition;
        assembly {
            impl := sload(position)
        }
    }

    function proxyType() public pure returns (uint256) {
        return 2;
    }
}
