const Splitter = artifacts.require('Splitter.sol');

module.exports = function(deployer, network, accounts) {

  const [ alice, bob, carol ] = accounts;
  deployer.deploy(Splitter, bob, carol);
};
