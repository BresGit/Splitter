const Promise = require("bluebird");
web3.eth = Promise.promisifyAll(web3.eth);
const { constants } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const { shouldFail } = require("openzeppelin-test-helpers");

//each require need a test

const Splitter = artifacts.require("Splitter"); //jason file

contract("Splitter", accounts => {

    const bob = accounts[0];
    const carol = accounts[1];
    const alice = accounts[2];
    let spliter; //variable that can be update

    beforeEach(async () => {

    spliter = await Splitter.new(alice, bob, carol, { from: alice });
    });


    it("should return a balance of 0", async () => {


        const smartContractBalance = await spliter.splitterSmartContractBalance.call();
        console.log('contract balance =' + smartContractBalance);

        assert.strictEqual(smartContractBalance.toNumber(), 0, "Contract Balance is not 0");
        //web3.eth.getGasPrice().then(console.log); ??? why gas price is not returning
    });

    //it.only -- run only one test
    it("should be able to run  splitter", async () => {

        //const smartContractBalance = await spliter.splitterSmartContractBalance();
        //read only call
        let bobbalance = await spliter.accounts.call(bob);
        //console.log('bobballance = '+ bobbalance);

        assert.strictEqual(bobbalance.toNumber(), 0, "bobbalance  is not 0");

        const contribution = web3.utils.toWei(web3.utils.toBN(2), 'ether');
        const contribution2 = web3.utils.toWei('2', 'ether');
        //console.log(contribution);
        //console.log('contribution2 =' + contribution2);
        //console.log(web3.utils.toBN('20000000000000000000000000000000'));
        //console.log(web3.utils.toBN('20000000000000000000000000000000').div(web3.utils.toBN('3')));
        //console.log(web3.utils.toBN('20000000000000000000000000000000'),'ether');
        // transaction that will require  gas
        //await spliter.splitt.sendTransaction({from: alice, value:  "2000000000000000000"})

        const tx = await spliter.splitt({ from: alice, value:  "2000000000000000000" });

        //simulating transaction not changing the
        const tx2 = await spliter.splitt.call({ from: alice, value:  "2000000000000000000" });
        console.log('gas price');
        console.log( await web3.eth.getGasPrice());
        console.log(tx);
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
        console.log(await web3.eth.getTransaction('0x4ea3615b910e220245dbbae72e2fa8a2e7a951b049a9c9ca44b3276a35467c5e'));

        //console.log(web3.utils.unitMap);

        bobbalance = await spliter.accounts(bob);
        console.log('bobballance after split in Wei = '+ bobbalance);

        // exploring web3
        // without wait you get just the promise, with the wait you will get the balance
        console.log('smart contract balance in Wei =' +await web3.eth.getBalance(spliter.address));
        //console.log(await web3.eth.getBalance(spliter.address));
        let balance = await web3.eth.getBalance(spliter.address);

        console.log('bobbalance in ether = '+ web3.utils.fromWei(balance,"ether"));
        console.log('bobbalance in finney = '+ web3.utils.fromWei(balance,"finney"));
        console.log('bobbalance in BigNumber =' + web3.utils.toBN(balance));

        //console.log(smartContractBalance);
        assert.strictEqual(bobbalance.toString(), '1000000000000000000', "bobbalance  is not 1000000000000000000");
    });

    it("should not be able to run  splitter, if not allice", async () => {
        //catching error using zeplin library

        //await shouldFail.reverting(spliter.splitt({ from: bob, value: 9000 }));

    });

    it("should not be able to run  splitter, if address is zero", async () => {
        //catching error using zeplin library

         //await shouldFail.reverting(Splitter.new(ZERO_ADDRESS, bob, carol, { from: alice }));

    });

});
