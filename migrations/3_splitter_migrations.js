const SplitterVer2 = artifacts.require('SplitterVer2.sol');

module.exports = function(deployer, network, accounts) {
  deployer.deploy(SplitterVer2);
};
