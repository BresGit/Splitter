const Promise = require("bluebird");
const { constants,
  expectRevert, // Assertions for transactions that should fail
} = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const Splitter = artifacts.require("Splitter");

contract("Splitter", accounts => {

    const [bob, carol, alice] = accounts;
    let spliter;

    beforeEach("should deploy Splitter", async function()
    {

        spliter = await Splitter.new(bob, carol, { from: alice });

    });

    it("should check the initial Balance for bob, carol and alice is 0", async function()  {

        let bobBalance = await spliter.accounts(bob);
        assert.strictEqual(bobBalance.toString(10),'0', "bobBalance  is not 0");

        let carolBalance = await spliter.accounts(carol);
        assert.strictEqual(carolBalance.toString(10), '0', "carolBalance  is not 0");

        const aliceBalance = await spliter.accounts(alice);
        assert.strictEqual(aliceBalance.toString(10), '0', "alicelBalance  is not 0");

    });


    it("should be able to run splitter with even numbers", async function()  {

        const tx = await spliter.splitt({ from: alice, value: 9000 });

        const bobBalance = await spliter.accounts(bob);
        assert.strictEqual(bobBalance.toString(10), '4500', "bobBalance  is not 4500");
        const carolBalance = await spliter.accounts(carol);
        assert.strictEqual(carolBalance.toString(10), '4500', "carolBalance  is not 4500");
        const aliceBalance = await spliter.accounts(alice);
        assert.strictEqual(aliceBalance.toString(10), '0', "alicelBalance  is not 0");

        const balance = await web3.eth.getBalance(spliter.address);
        assert.strictEqual(balance, '9000', "balance is not 9000");

        assert.strictEqual(tx.receipt.logs.length, 1);
        assert.strictEqual(tx.logs.length, 1);
        const SplitterLog = tx.logs[0];
        assert.strictEqual(SplitterLog.event, "SplitterLog");
        assert.strictEqual(SplitterLog.args._bob, bob);
        assert.strictEqual(SplitterLog.args._carol, carol);
        assert.strictEqual(SplitterLog.args.amountReceived.toNumber(), 4500);

    });

    it("should be able to run  splitter with odd numbers", async function()  {

        await spliter.splitt({ from: alice, value: 9001 });
        const bobBalance = await spliter.accounts(bob);
        assert.strictEqual(bobBalance.toString(10), '4500', "bobBalance  is not 4500");
        const carolBalance = await spliter.accounts(carol);
        assert.strictEqual(carolBalance.toString(10), '4500', "carolBalance  is not 4500");
        const aliceBalance = await spliter.accounts(alice);
        assert.strictEqual(aliceBalance.toString(10), '1', "aliceBalance  is not 1");

        const balance = await web3.eth.getBalance(spliter.address);
        assert.strictEqual(balance, '9001', "balance  is not 9001");

    });

    it("should not be able run to splitter, if not Allice", async function() {

        await expectRevert(spliter.splitt({ from: bob, value: 9000 }), 'Sender must be Alice');
    });

    it("should not be able to deploy splitter, if address is zero", async function() {

        await expectRevert(Splitter.new(ZERO_ADDRESS, carol, { from: alice }),'Adress cant be zero');
        await expectRevert(Splitter.new(bob, ZERO_ADDRESS,  { from: alice }),'Adress cant be zero');
        await expectRevert(Splitter.new(ZERO_ADDRESS,ZERO_ADDRESS, { from: alice }),'Adress cant be zero');

    });

    it("should Bob and Carol be able to withdraw", async function() {

        await spliter.splitt({ from: alice, value: 9000 });
        let bobBalance = await spliter.accounts(bob);

        assert.strictEqual(bobBalance.toString(10), '4500', "bobBalance  is not 4500");
        const bobInitBalance = await web3.eth.getBalance(bob);

        const tx = await spliter.withdraw({from: bob });
        let bobAfterWithdrawBalance = await web3.eth.getBalance(bob);
        bobAfterWithdrawBalance = web3.utils.toBN(bobAfterWithdrawBalance);
        bobBalance = await spliter.accounts(bob);
        assert.strictEqual(bobBalance.toString(10), '0', "bobBalance  is not 0");

        const gasUsed = web3.utils.toBN(tx.receipt.gasUsed);
        const transDetails = await web3.eth.getTransaction(tx.tx);
        const gasPrice = transDetails.gasPrice;

        let bobInitBN  = web3.utils.toBN(bobInitBalance);

        const vm = gasUsed.mul(web3.utils.toBN(gasPrice))
        let bobExpectedBalance  = bobInitBN.sub(vm).add(web3.utils.toBN(4500));

        assert.strictEqual(bobExpectedBalance.toString(10), bobAfterWithdrawBalance.toString(10), "Expected balance not equal After Withdraw Balance");

        assert.strictEqual(tx.receipt.logs.length, 1);
        assert.strictEqual(tx.logs.length, 1);
        const logWithdraw = tx.logs[0];
        assert.strictEqual(logWithdraw.event, "Withdrawn");
        assert.strictEqual(logWithdraw.args.sender, bob);
        assert.strictEqual(logWithdraw.args.amount.toNumber(), 4500);

    });

});
