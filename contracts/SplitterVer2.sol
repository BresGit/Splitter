
pragma solidity ^0.5.0;
import "@openzeppelin/contracts/math/SafeMath.sol";

contract SplitterVer2
{
// this contract will show balances of 3 people:
// when sender sends ether it will be split in half to person2  and person3
// when sender sends an odd value the remainder will be returned to sender
    using SafeMath for uint256;

    event WithdrawLog(address indexed sender,  uint256 amount);
    event SplitterLog(address sender, address person2, address person3);

    mapping (address => uint ) public accounts;

    constructor () public
    {

    }

    function split(address person2, address person3) public payable
    {

        require(msg.value > 0, "Value must be greater > 0");
        require(person2 != address(0), 'Adress cant be zero');
        require(person3 != address(0), 'Adress cant be zero');

        accounts[person2] = accounts[person2].add(msg.value/2);
        accounts[person3] = accounts[person3].add(msg.value/2);

        // for odd value received return back to  sender
        if (msg.value % 2 > 0)
        {
            accounts[msg.sender] = accounts[msg.sender].add(msg.value % 2);
        }

        emit SplitterLog(msg.sender, person2, person3);

    }

    function withdraw() public
    {
        uint value = accounts[msg.sender];
        require(value > 0, "Withdrawing balance > 0");
        accounts[msg.sender] = 0;
        emit WithdrawLog(msg.sender, value);
        (bool success, ) = msg.sender.call.value(value)(""); //the value is transfered/call to the sender/Withdrawer
        require(success, "Transfer failed.");
    }
}
