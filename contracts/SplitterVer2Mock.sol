pragma solidity ^0.5.0;
import "./SplitterVer2.sol";
contract SplitterVer2Mock
{

event LogReceived(address sender,  uint256 amount);

function withdraw(address _splitter) public
{
    SplitterVer2 splitter = SplitterVer2(_splitter);
    splitter.withdraw();

}


function () external payable
{

    emit LogReceived(msg.sender, msg.value);

}
}
