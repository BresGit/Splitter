
pragma solidity ^0.5.0;
import "@openzeppelin/contracts/math/SafeMath.sol";

contract SplitterVer2
{
// this contract will show balances of 3 people:
// when sender sends ether it will be split in half to person2  and person3
// when sender sends an odd value the remainder will be returned to sender
    using SafeMath for uint256;

    event Withdrawn(address indexed sender,  uint256 amount);
    event SplitterLog(uint256 amount,address sender,address person2, address person3);

    mapping (address => uint ) public accounts;

    constructor () public
    {

    }

    function split(address _person2, address _person3) public payable
    {

        require(msg.value > 0, "Value must be greater > 0");
        require(_person2 != address(0), 'Adress cant be zero');
        require(_person3 != address(0), 'Adress cant be zero');

        accounts[_person2] = accounts[_person2].add(msg.value/2);
        accounts[_person3] = accounts[_person3].add(msg.value/2);

        // for odd value received return back to  sender
        if (msg.value % 2 > 0)
        {
            accounts[msg.sender] = accounts[msg.sender].add(msg.value % 2);
        }

        emit SplitterLog(msg.value,msg.sender,_person2,_person3);

    }

    function withdraw() public
    {
        uint value = accounts[msg.sender];
        require(value > 0, "Sender Address is Available");
        accounts[msg.sender] = 0;
        msg.sender.transfer(value);
        emit Withdrawn(msg.sender, value);
    }
}
