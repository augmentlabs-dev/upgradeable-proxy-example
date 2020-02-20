const SimpleDB = artifacts.require("SimpleDB");
const Proxy = artifacts.require("Proxy");
const chai = require("chai");
chai.should();

contract("Proxy", ([admin, otherUser]) => {
  let proxyContract;

  beforeEach(async () => {
    proxyContract = await Proxy.new();
  });

  describe("Proxy contract process", async () => {
    describe("upgradeTo", async () => {
      describe("no existing contract", async () => {
        it("should emit the old address as the null address", async () => {
          const simpleDBContractI = await SimpleDB.new(1);
          const tx = await proxyContract.upgradeTo(simpleDBContractI.address);

          tx.logs[0].event.should.equal("Upgraded");
          tx.logs[0].args.oldCodeAddr.should.equal(
            "0x0000000000000000000000000000000000000000"
          );
          tx.logs[0].args.newCodeAddr.should.equal(simpleDBContractI.address);
        });

        it("should output the new address when calling implementation", async () => {
          const simpleDBContractI = await SimpleDB.new(1);
          const tx = await proxyContract.upgradeTo(simpleDBContractI.address);
          const newAddress = await proxyContract.implementation();

          newAddress.should.equal(simpleDBContractI.address);
        });
      });
    });

    describe("proxyType", async () => {
      it("should be 2", async () => {
        const simpleDBContractI = await SimpleDB.new(1);
        const tx = await proxyContract.upgradeTo(simpleDBContractI.address);
        const proxyType = await proxyContract.proxyType();

        proxyType.toNumber().should.equal(2);
      });
    });
  });
});
