const SimpleDB = artifacts.require("SimpleDB");
const Proxy = artifacts.require("Proxy");

module.exports = async deployer => {
  await deployer.deploy(Proxy);
  const proxyInstance = await Proxy.deployed();

  await deployer.deploy(SimpleDB, 1);
  const simpleDBInstance = await SimpleDB.deployed();

  await proxyInstance.upgradeTo(simpleDBInstance.address);
};
