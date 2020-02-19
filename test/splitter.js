const Promise = require("bluebird");
const { constants,
  expectRevert, // Assertions for transactions that should fail
} = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const Splitter = artifacts.require("Splitter");
const { toBN } = web3.utils;

contract("Splitter", accounts => {

    const [bob, carol, alice] = accounts;
    let splitter;

    beforeEach("should deploy Splitter", async function()
    {

        splitter = await Splitter.new(bob, carol, { from: alice });

    });

    it("should check the initial Balance for bob, carol and alice is 0", async function()  {

        let bobBalance = await splitter.accounts(bob);
        assert.strictEqual(bobBalance.toString(10),'0', "bobBalance  is not 0");

        let carolBalance = await splitter.accounts(carol);
        assert.strictEqual(carolBalance.toString(10), '0', "carolBalance  is not 0");

        const aliceBalance = await splitter.accounts(alice);
        assert.strictEqual(aliceBalance.toString(10), '0', "alicelBalance  is not 0");

    });


    it("should be able to run splitter with even numbers", async function()  {

        const txObj = await splitter.split({ from: alice, value: 9000 });
        assert.strictEqual(txObj.receipt.logs.length, 1);
        assert.strictEqual(txObj.logs.length, 1);
        const SplitterLog = txObj.logs[0];
        assert.strictEqual(SplitterLog.event, "SplitterLog");
        assert.strictEqual(SplitterLog.args.addr1, bob);
        assert.strictEqual(SplitterLog.args.addr2, carol);
        assert.strictEqual(SplitterLog.args.amountReceived.toNumber(), 4500);
        assert.strictEqual(SplitterLog.args.remainder.toNumber(), 0);

        const bobBalance = await splitter.accounts(bob);
        assert.strictEqual(bobBalance.toString(10), '4500', "bobBalance  is not 4500");
        const carolBalance = await splitter.accounts(carol);
        assert.strictEqual(carolBalance.toString(10), '4500', "carolBalance  is not 4500");
        const aliceBalance = await splitter.accounts(alice);
        assert.strictEqual(aliceBalance.toString(10), '0', "alicelBalance  is not 0");
        const balance = await web3.eth.getBalance(splitter.address);
        assert.strictEqual(balance, '9000', "balance is not 9000");

    });

    it("should be able to run  splitter with odd numbers", async function()  {

        const txObj = await splitter.split({ from: alice, value: 9001 });
        assert.strictEqual(txObj.receipt.logs.length, 1);
        assert.strictEqual(txObj.logs.length, 1);
        const SplitterLog = txObj.logs[0];
        assert.strictEqual(SplitterLog.event, "SplitterLog");
        assert.strictEqual(SplitterLog.args.addr1, bob);
        assert.strictEqual(SplitterLog.args.addr2, carol);
        assert.strictEqual(SplitterLog.args.amountReceived.toNumber(), 4500);
        assert.strictEqual(SplitterLog.args.remainder.toNumber(), 1);

        const bobBalance = await splitter.accounts(bob);
        assert.strictEqual(bobBalance.toString(10), '4500', "bobBalance  is not 4500");
        const carolBalance = await splitter.accounts(carol);
        assert.strictEqual(carolBalance.toString(10), '4500', "carolBalance  is not 4500");
        const aliceBalance = await splitter.accounts(alice);
        assert.strictEqual(aliceBalance.toString(10), '1', "aliceBalance  is not 1");
        const balance = await web3.eth.getBalance(splitter.address);
        assert.strictEqual(balance, '9001', "balance  is not 9001");

    });

    it("should not be able run to splitter, if not Allice", async function() {

        await expectRevert(splitter.split({ from: bob, value: 9000 }), 'Sender must be Alice');
    });

    it("should not be able to deploy splitter, if address is zero", async function() {

        await expectRevert(Splitter.new(ZERO_ADDRESS, carol, { from: alice }),'Adress cant be zero');
        await expectRevert(Splitter.new(bob, ZERO_ADDRESS,  { from: alice }),'Adress cant be zero');
        await expectRevert(Splitter.new(ZERO_ADDRESS,ZERO_ADDRESS, { from: alice }),'Adress cant be zero');

    });

    it("should Bobbe able to withdraw", async function() {


        await splitter.split({ from: alice, value: 9000 });
        let bobBalance = await splitter.accounts(bob);

        assert.strictEqual(bobBalance.toString(10), '4500', "bobBalance  is not 4500");
        const bobInitBalance = await web3.eth.getBalance(bob);

        const txObj = await splitter.withdraw({from: bob });
        assert.strictEqual(txObj.receipt.logs.length, 1);
        assert.strictEqual(txObj.logs.length, 1);
        const logWithdraw = txObj.logs[0];
        assert.strictEqual(logWithdraw.event, "Withdrawn");
        assert.strictEqual(logWithdraw.args.sender, bob);
        assert.strictEqual(logWithdraw.args.amount.toNumber(), 4500);

        let bobAfterWithdrawBalance = await web3.eth.getBalance(bob);
        bobAfterWithdrawBalance = toBN(bobAfterWithdrawBalance);
        bobBalance = await splitter.accounts(bob);
        assert.strictEqual(bobBalance.toString(10), '0', "bobBalance  is not 0");

        const gasUsed = toBN(txObj.receipt.gasUsed);
        const transDetails = await web3.eth.getTransaction(txObj.tx);
        const gasPrice = transDetails.gasPrice;

        const bobInitBN  = toBN(bobInitBalance);

        const vm = gasUsed.mul(toBN(gasPrice))
        const bobExpectedBalance  = bobInitBN.sub(vm).add(toBN(4500));

        assert.strictEqual(bobExpectedBalance.toString(10), bobAfterWithdrawBalance.toString(10), "Expected balance not equal After Withdraw Balance");

    });


    it("should Carol be able to withdraw", async function() {


        await splitter.split({ from: alice, value: 9000 });
        let carolBalance = await splitter.accounts(carol);

        assert.strictEqual(carolBalance.toString(10), '4500', "carolBalance  is not 4500");
        const carolInitBalance = await web3.eth.getBalance(carol);

        const txObj = await splitter.withdraw({from: carol});
        assert.strictEqual(txObj.receipt.logs.length, 1);
        assert.strictEqual(txObj.logs.length, 1);
        const logWithdraw = txObj.logs[0];
        assert.strictEqual(logWithdraw.event, "Withdrawn");
        assert.strictEqual(logWithdraw.args.sender, carol);
        assert.strictEqual(logWithdraw.args.amount.toNumber(), 4500);

        let carolAfterWithdrawBalance = await web3.eth.getBalance(carol);
        carolAfterWithdrawBalance = toBN(carolAfterWithdrawBalance);
        carolBalance = await splitter.accounts(carol);
        assert.strictEqual(carolBalance.toString(10), '0', "carolBalance  is not 0");

        const gasUsed = toBN(txObj.receipt.gasUsed);
        const transDetails = await web3.eth.getTransaction(txObj.tx);
        const gasPrice = transDetails.gasPrice;

        const carolInitBN  = toBN(carolInitBalance);

        const vm = gasUsed.mul(toBN(gasPrice))
        const carolExpectedBalance  = carolInitBN.sub(vm).add(toBN(4500));

        assert.strictEqual(carolExpectedBalance.toString(10), carolAfterWithdrawBalance.toString(10), "Expected balance not equal After Withdraw Balance");

    });


    it("should Bob withdraw after 2 splits", async function() {

        await splitter.split({ from: alice, value: 9000 });
        let bobBalance = await splitter.accounts(bob);

        assert.strictEqual(bobBalance.toString(10), '4500', "bobBalance  is not 4500");
        await splitter.split({ from: alice, value: 2000});
        bobBalance = await splitter.accounts(bob);
        assert.strictEqual(bobBalance.toString(10), '5500', "bobBalance  is not 5500");

        const bobInitBalance = await web3.eth.getBalance(bob);

        const txObj = await splitter.withdraw({from: bob });
        assert.strictEqual(txObj.receipt.logs.length, 1);
        assert.strictEqual(txObj.logs.length, 1);
        const logWithdraw = txObj.logs[0];
        assert.strictEqual(logWithdraw.event, "Withdrawn");
        assert.strictEqual(logWithdraw.args.sender, bob);
        assert.strictEqual(logWithdraw.args.amount.toNumber(), 5500);

        let bobAfterWithdrawBalance = await web3.eth.getBalance(bob);
        bobAfterWithdrawBalance = toBN(bobAfterWithdrawBalance);
        bobBalance = await splitter.accounts(bob);
        assert.strictEqual(bobBalance.toString(10), '0', "bobBalance  is not 0");

        const gasUsed = toBN(txObj.receipt.gasUsed);
        const transDetails = await web3.eth.getTransaction(txObj.tx);
        const gasPrice = transDetails.gasPrice;

        const bobInitBN  = toBN(bobInitBalance);

        const vm = gasUsed.mul(toBN(gasPrice))
        const bobExpectedBalance  = bobInitBN.sub(vm).add(toBN(5500));

        assert.strictEqual(bobExpectedBalance.toString(10), bobAfterWithdrawBalance.toString(10), "Expected balance not equal After Withdraw Balance");

    });

});
