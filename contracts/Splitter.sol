
pragma solidity ^0.5.0;
contract Splitter
{
// this contract will show balances of 3 people: Alice, Bob and Carol
// when Alice sends ether it will be split in half to Bob and carol
// when Alice send an odd value the remainder will be returned to Alice

	address public alice;
	address public bob;
	address public carol;

	event Withdrawn(address indexed sender,  uint256 amount);
	event SplitterLog(address receiver, uint256 amountReceived);

	mapping (address => uint ) public accounts;

	constructor (address _alice, address _bob, address _carol) public
	{

		require(_alice != address(0) && _bob != address(0) && _carol != address(0), "Adress cant be zero");

		alice = _alice;
		bob = _bob;
		carol = _carol;
	}

	function splitt() public payable
	{
		require(msg.sender==alice, "Sender must be Alice");
		require(msg.value > 0, "Value must be greater > 0");

	    accounts[bob] = add(accounts[bob], msg.value/2);
	    emit SplitterLog(bob,msg.value/2);

	    accounts[carol] = add(accounts[carol], msg.value/2);
	    emit SplitterLog(carol, msg.value/2);

		// for odd received values return back to Alice sender
		if (msg.value % 2 > 0)
		{
			accounts[alice] = add(accounts[alice], msg.value % 2);
		}
	}

	//copied from openzeplin overflow
	function add(uint256 a, uint256 b) internal pure returns (uint256)
 	{
	   uint256 c = a + b;
	   require(c >= a, "SafeMath: addition overflow");

	   return c;
    }

	function withdraw() public
	{
		require(accounts[msg.sender] > 0, "Sender Address is Available");
		uint value = accounts[msg.sender];
		accounts[msg.sender] = 0;
		msg.sender.transfer(value);
		emit Withdrawn(msg.sender, value);
	}
}
