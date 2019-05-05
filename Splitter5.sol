
pragma solidity ^0.5.0;
contract Splitter5 {

// this contract will show balances of 3 people: Alice, Bob and Carol
// when Alice sends ether it will be split in half to Bob and Carol



	address public alice;
	address public bob;
	address public carol;
	event withdrawn(address indexed sender,  uint256 amount);
	event splitterLog(address receiver, uint256 amountReceived);

mapping (address => uint ) public accounts;


 constructor (address Alice,address Bob, address Carol) public{

	alice = Alice;
	bob = Bob;
	carol = Carol;


}


function splitt() public payable {
	//require (msg.sender == alice);
	require(msg.sender==alice, "Sender must be Alice");
	require(msg.value > 0,"Value must be greater > 0");

	//  consider odd value will loose digit
	// indent code as HW
	// add library from OpenZeppelin add library safeMath
          uint value = msg.value;

	  accounts[bob] = accounts[bob] + value/2;
	  emit splitterLog(bob,value/2);

	  accounts[carol] = accounts[carol] +  value/2;
	  emit splitterLog(bob,value/2);

}

function splitterSmartContractBalance() view public returns (uint256){
        return address(this).balance;}


// payable use only when receiving money
// allow to wihdraw money only for the specific users
function withdraw  () public {

	require(accounts[msg.sender] > 0,"Sender Address is Available");

	uint value = accounts[msg.sender];

// zero out the sender value
	accounts[msg.sender] = 0;
// transfer to user
	msg.sender.transfer(value);
	emit withdrawn(msg.sender, value);

//events are cheap to use, event allows to add a more readable  message

}

// since accouns I can get the balance
//function showBalance(address person) public view returns(uint) {

//	return accounts[person];
//}


}
