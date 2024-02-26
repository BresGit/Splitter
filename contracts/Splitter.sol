
pragma solidity ^0.5.0;
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Splitter
{
// this contract will show balances of 3 people: Alice, Bob and Carol
// when Alice sends ether it will be split in half to Bob and Carol
// when Alice sends an odd value the remainder will be returned to Alice
    using SafeMath for uint256;

    address public alice;
    address public bob;
    address public carol;
    address public carolll;


    event Withdrawn(address indexed sender,  uint256 amount);
    event SplitterLog(uint256 amount);
    mapping (address => uint ) public accounts;

    constructor (address _bob, address _carol) public
    {

        require(_bob != address(0) && _carol != address(0), "Adress cant be zero");

        alice = msg.sender;
        bob = _bob;
        carol = _carol;
    }

    function split() public payable
    {
        require(msg.sender == alice, "Sender must be Alice");
        require(msg.value > 0, "Value must be greater > 0");
        accounts[bob] = accounts[bob].add(msg.value/2);
        accounts[carol] = accounts[carol].add(msg.value/2);


        // for odd received values return back to Alice sender
        if (msg.value % 2 > 0)
        {
            accounts[alice] = accounts[alice].add(msg.value % 2);
        }

        emit SplitterLog(msg.value);

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
