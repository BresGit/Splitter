const Promise = require("bluebird");
const { constants,
  expectRevert, // Assertions for transactions that should fail
} = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const Splitter = artifacts.require("SplitterVer2");
const  Withdrawer = artifacts.require("Withdrawer");

const { toBN } = web3.utils;

contract("Splitter", accounts => {

    const [person2, person3, sender] = accounts;
    let splitter;

    async function calcTransCost(txObj)
    {
        const gasUsed = toBN(txObj.receipt.gasUsed);
        const transDetails = await web3.eth.getTransaction(txObj.tx);
        const gasPrice = transDetails.gasPrice;

        return gasUsed.mul(toBN(gasPrice));
    }

    beforeEach("should deploy Splitter", async function()
    {

        splitter = await Splitter.new({ from: sender });

    });

    it("should check the initial Balance for person2, person3 and senderPerson is 0 ", async function()
    {

        const p2 = await splitter.accounts(person2);
        assert.strictEqual(p2.toString(10), '0', "p2  is not 0");
        const p3 = await splitter.accounts(person3);
        assert.strictEqual(p3.toString(10), '0', "p3  is not 0");
        const senderPerson = await splitter.accounts(sender);
        assert.strictEqual(senderPerson.toString(10), '0', "senderPerson  is not 0");

    });

    it("should be able to run splitter with even numbers", async function()
    {

        const txObj = await splitter.split(person2,person3, { from: sender, value: 9000 });
        assert.strictEqual(txObj.receipt.logs.length, 1);
        assert.strictEqual(txObj.logs.length, 1);
        const splitterLog = txObj.logs[0];
        assert.strictEqual(splitterLog.event, "SplitterLog");
        assert.strictEqual(splitterLog.args.person2, person2);
        assert.strictEqual(splitterLog.args.person3, person3);
        assert.strictEqual(splitterLog.args.sender, sender);
        const p2Balance = await splitter.accounts(person2);
        assert.strictEqual(p2Balance.toString(10), '4500', "p2Balance is not 4500");
        const p3Balance = await splitter.accounts(person3);
        assert.strictEqual(p3Balance.toString(10), '4500', "p3Balance is not 4500");
        const senderBalance = await splitter.accounts(sender);
        assert.strictEqual(senderBalance.toString(10), '0', "senderBalance is not 0");
        const balance = await web3.eth.getBalance(splitter.address);
        assert.strictEqual(balance, '9000', "balance is not 9000");

    });

    it("should be able to run  splitter with odd numbers", async function()
    {

        const txObj = await splitter.split(person2,person3, { from: sender, value: 9001 });
        assert.strictEqual(txObj.receipt.logs.length, 1);
        assert.strictEqual(txObj.logs.length, 1);
        const splitterLog = txObj.logs[0];
        assert.strictEqual(splitterLog.event, "SplitterLog");
        const p2Balance = await splitter.accounts(person2);
        assert.strictEqual(p2Balance.toString(10), '4500', "p2Balance is not 4500");
        const p3Balance = await splitter.accounts(person3);
        assert.strictEqual(p3Balance.toString(10), '4500', "p3Balance is not 4500");
        const senderBalance = await splitter.accounts(sender);
        assert.strictEqual(senderBalance.toString(10), '1', "senderBalance is not 1");
        const balance = await web3.eth.getBalance(splitter.address);
        assert.strictEqual(balance, '9001', "balance  is not 9001");

    });

    it("should not be able to deploy splitter, if address is zero", async function() {

        await expectRevert(splitter.split(ZERO_ADDRESS, person2, { from: sender, value: 9000 }),'Adress cant be zero');
        await expectRevert(splitter.split(person3, ZERO_ADDRESS,  { from: sender , value: 9000}),'Adress cant be zero');
        await expectRevert(splitter.split(ZERO_ADDRESS,ZERO_ADDRESS, { from: sender, value: 9000 }),'Adress cant be zero');

    });

    it("should person2 able to withdraw", async function()
    {

        await splitter.split(person2, person3, { from: sender, value: 9000 });
        let p2Balance = await splitter.accounts(person2);

        assert.strictEqual(p2Balance.toString(10), '4500', "p2Balance is not 4500");
        const p2InitBalance = await web3.eth.getBalance(person2);
        const txObj = await splitter.withdraw({from: person2});
        assert.strictEqual(txObj.receipt.logs.length, 1);
        assert.strictEqual(txObj.logs.length, 1);
        const logWithdraw = txObj.logs[0];
        assert.strictEqual(logWithdraw.event, "WithdrawLog");
        assert.strictEqual(logWithdraw.args.sender, person2);
        assert.strictEqual(logWithdraw.args.amount.toString(10), '4500');

        const p2AfterWithdrawBalance = toBN(await web3.eth.getBalance(person2));

        p2Balance = await splitter.accounts(person2);
        assert.strictEqual(p2Balance.toString(10), '0', "p2Balance is not 0");

        const p2InitBN  = toBN(p2InitBalance);
        const trCost = await calcTransCost(txObj);
        const p2ExpectedBalance  = p2InitBN.sub(trCost).add(toBN(4500));

        assert.strictEqual(p2ExpectedBalance.toString(10), p2AfterWithdrawBalance.toString(10),
        "Expected balance not equal After Withdraw Balance");

    });

    it("should person3 be able to withdraw", async function()
    {

        await splitter.split(person2, person3, { from: sender, value: 9000 });

        let p3Balance = await splitter.accounts(person3);

        assert.strictEqual(p3Balance.toString(10), '4500', "p3Balance is not 4500");
        const p3InitBalance = toBN(await web3.eth.getBalance(person3));
        const txObj = await splitter.withdraw({from: person3});
        assert.strictEqual(txObj.receipt.logs.length, 1);
        assert.strictEqual(txObj.logs.length, 1);
        const logWithdraw = txObj.logs[0];
        assert.strictEqual(logWithdraw.event, "WithdrawLog");
        assert.strictEqual(logWithdraw.args.sender, person3);
        assert.strictEqual(logWithdraw.args.amount.toString(10), '4500');
        const p3AfterWithdrawBalance = toBN(await web3.eth.getBalance(person3));
        p3Balance = await splitter.accounts(person3);
        assert.strictEqual(p3Balance.toString(10), '0', "p3Balance is not 0");

        const trCost = await calcTransCost(txObj);
        const p3ExpectedBalance  = p3InitBalance.sub(trCost).add(toBN(4500));

        assert.strictEqual(p3ExpectedBalance.toString(10), p3AfterWithdrawBalance.toString(10),
        "Expected balance not equal After Withdraw Balance");

    });


    it("should person2 withdraw after 2 splits", async function()
    {

        await splitter.split(person2, person3, { from: sender, value: 9000 });
        await splitter.split(person2, person3, { from: sender, value: 2000});
        const p2InitBalance = await web3.eth.getBalance(person2);
        const txObj = await splitter.withdraw({from: person2});

        assert.strictEqual(txObj.receipt.logs.length, 1);
        assert.strictEqual(txObj.logs.length, 1);
        const logWithdraw = txObj.logs[0];
        assert.strictEqual(logWithdraw.event, "WithdrawLog");
        assert.strictEqual(logWithdraw.args.sender, person2);
        assert.strictEqual(logWithdraw.args.amount.toString(10), '5500');

        let p2AfterWithdrawBalance = await web3.eth.getBalance(person2);
        p2AfterWithdrawBalance = toBN(p2AfterWithdrawBalance);
        p2Balance = await splitter.accounts(person2);
        assert.strictEqual(p2Balance.toString(10), '0', "p2Balance is not 0");

        const p2InitBN  = toBN(p2InitBalance);
        const trCost = await calcTransCost(txObj);
        const p2ExpectedBalance  = p2InitBN.sub(trCost).add(toBN(5500));

        assert.strictEqual(p2ExpectedBalance.toString(10), p2AfterWithdrawBalance.toString(10), "Expected balance not equal After Withdraw Balance");

    });


    it("should sender be able to complete 2 splits", async function()
    {

        await splitter.split(person2, person3, { from: sender, value: 9000 });
        let p2Balance = await splitter.accounts(person2);

        assert.strictEqual(p2Balance.toString(10), '4500', "p2Balance is not 4500");
        await splitter.split(person2, person3, { from: sender, value: 2000});
        p2Balance = await splitter.accounts(person2);
        assert.strictEqual(p2Balance.toString(10), '5500', "p2Balance is not 5500");
    });

    it("should withdraw via Withdrawer/Recepient   Contract", async function()
    {

        const withdrawer = await Withdrawer.new({from:sender});
        await splitter.split(person2,withdrawer.address, {from: sender, value: 9000});

        const txObj = await withdrawer.withdrawFrom(splitter.address,{from:sender});
        assert.strictEqual(txObj.logs.length,1);
        const logReceived = txObj.logs[0];
        assert.strictEqual(logReceived.event,"LogReceived");
        assert.strictEqual(txObj.receipt.rawLogs.length,2,"not 2 rawLogs Objects");
        assert.strictEqual(txObj.receipt.rawLogs[0].topics[0], web3.utils.keccak256("WithdrawLog(address,uint256)"),"WithdrawLog hash Not Equal");
        assert.strictEqual(txObj.receipt.rawLogs[1].topics[0], web3.utils.keccak256("LogReceived(address,uint256)"),"LogReceived hash Not Equal");

        const collectedBalance = await web3.eth.getBalance(withdrawer.address);
        assert.strictEqual(collectedBalance.toString(10),'4500',"collectedBalance not 4500");

    })

});
