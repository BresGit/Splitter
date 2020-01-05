const Promise = require("bluebird");
const { constants,
  expectRevert, // Assertions for transactions that should fail
} = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;


const Splitter = artifacts.require("Splitter");

contract("Splitter", accounts => {

    const [bob, carol, alice] = accounts;
    let spliter;

    beforeEach(async function()
    {

        spliter = await Splitter.new(alice, bob, carol, { from: alice });

    });

    it("should be able to run splitter with even numbers", async function()  {


        let bobBalance = await spliter.accounts(bob);
        assert.strictEqual(bobBalance.toString(10),'0', "bobBalance  is 0");

        let carolBalance = await spliter.accounts(carol);
        assert.strictEqual(carolBalance.toString(10), '0', "carolBalance  is 0");

        let aliceBalance = await spliter.accounts(alice);
        assert.strictEqual(aliceBalance.toString(10), '0', "alicelBalance  is 0");

        await spliter.splitt({ from: alice, value: 9000 });

        bobBalance = await spliter.accounts(bob);
        assert.strictEqual(bobBalance.toString(10), '4500', "bobBalance  is 4500");
        carolBalance = await spliter.accounts(carol);
        assert.strictEqual(carolBalance.toString(10), '4500', "carolBalance  is 4500");
        aliceBalance = await spliter.accounts(alice);

        let balance = await web3.eth.getBalance(spliter.address);

    });

    it("should be able to run  splitter with odd numbers", async function()  {

        await spliter.splitt({ from: alice, value: 9001 });
        bobBalance = await spliter.accounts(bob);
        assert.strictEqual(bobBalance.toString(10), '4500', "bobBalance  is 4500");
        carolBalance = await spliter.accounts(carol);
        assert.strictEqual(carolBalance.toString(10), '4500', "carolBalance  is 4500");
        aliceBalance = await spliter.accounts(alice);
        assert.strictEqual(aliceBalance.toString(10), '1', "aliceBalance  is 1");
        aliceBalance = await spliter.accounts(alice);

        let balance = await web3.eth.getBalance(spliter.address);


    });

    it("should not be able to run  splitter, if not allice", async function() {

        await expectRevert(spliter.splitt({ from: bob, value: 9000 }), 'Sender must be Alice');
    });

    it("should not be able to run  splitter, if address is zero", async function() {
        //catching error using zeplin library

        await expectRevert(Splitter.new(ZERO_ADDRESS, bob, carol, { from: alice }),'Adress cant be zero');

    });

    it("should Bob and Carol be able to withdraw", async function() {

        await spliter.splitt({ from: alice, value: 9000 });
        bobBalance = await spliter.accounts(bob);
        await spliter.withdraw({from: bob });
        bobBalance = await spliter.accounts(bob);

    });

});
