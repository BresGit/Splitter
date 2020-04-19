pragma solidity ^0.5.0;
import "./SplitterVer2.sol";

contract Withdrawer
{

    address public owner;

    event LogReceived(address sender,  uint256 amount);
    event LogCollected(address CollectSender, uint256 collectd);

    constructor () public
    {
        owner = msg.sender;
    }

    function withdrawFrom(address _splitter) public
    {
        SplitterVer2 splitter = SplitterVer2(_splitter);
        splitter.withdraw();

    }

    function () external payable
    {

        emit LogReceived(msg.sender, msg.value);

    }

    function collectEther() external
    {
        require(msg.sender == owner,"sender is not the owner");
        require(address(this).balance > 0, "collected balance is 0");
        (bool success, ) = msg.sender.call.value(address(this).balance)("");
        require(success, "Transfer failed.");

        emit LogCollected(msg.sender,address(this).balance);

    }
}
