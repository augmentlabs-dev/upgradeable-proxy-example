const SimpleDB = artifacts.require("SimpleDB");
const SimpleDBV2 = artifacts.require("SimpleDBV2");
const Proxy = artifacts.require("Proxy");
const chai = require("chai");
chai.should();

contract("ProxyOfSimpleDB", ([admin]) => {
  describe("Contract proxied already", async () => {
    let simpleDBContract;
    let code;
    let proxyContract;

    beforeEach(async () => {
      simpleDBContract = await SimpleDB.new();
      proxyContract = await Proxy.new();
      await proxyContract.upgradeTo(simpleDBContract.address);
      code = await SimpleDB.at(proxyContract.address);
      await code.initialize(admin);
    });

    describe("switch to V2", async () => {
      it("should change the version number", async () => {
        const response1 = await code.set(2);
        const result1 = response1.logs[0];
        result1.args.version.toNumber().should.equal(1);

        const simpleDBV2Contract = await SimpleDBV2.new();
        await proxyContract.upgradeTo(simpleDBV2Contract.address);

        const response2 = await code.set(2);
        const result2 = response2.logs[0];
        result2.args.version.toNumber().should.equal(2);
      });
    });

    describe("proxy storage vs contract storage", async () => {
      describe("calling set via the proxy", async () => {
        it("should store the assigned integer in the proxy storage and not the contracts storage", async () => {
          await code.set(2);

          const codeGetResponse = await code.get();
          const simpleDBGetResponse = await simpleDBContract.get();

          codeGetResponse.toNumber().should.not.be.equal(simpleDBGetResponse.toNumber());
          codeGetResponse.toNumber().should.be.equal(2);
          simpleDBGetResponse.toNumber().should.be.equal(0);
        });
      });
    });

    describe("set", async () => {
      describe("no previously stored value", async () => {
        it("should store the assigned integer, oldValue is zero", async () => {
          const response = await code.set(2);
          const result = response.logs[0];

          result.event.should.equal("StoredValue");
          result.args.newData.toNumber().should.equal(2);
          result.args.oldData.toNumber().should.equal(0);
          result.args.version.toNumber().should.equal(1);

        });
      });

      describe("has a previously stored value", async () => {
        beforeEach(async () => {
          await code.set(3);
        });

        it("should store the assigned integer, oldValue is the previous value", async () => {
          const response = await code.set(7);
          const result = response.logs[0];

          result.event.should.equal("StoredValue");
          result.args.newData.toNumber().should.equal(7);
          result.args.oldData.toNumber().should.equal(3);
          result.args.version.toNumber().should.equal(1);
        });
      });
    });

    describe("get", async () => {
      describe("no previously stored value", async () => {
        it("should return 0 as the stored value", async () => {
          const storedValue = await code.get();

          storedValue.toNumber().should.equal(0);
        });
      });

      describe("has a previously stored value", async () => {
        beforeEach(async () => {
          await code.set(3);
        });

        it("should return this stored value", async () => {
          const storedValue = await code.get();

          storedValue.toNumber().should.equal(3);
        });
      });
    });
  });
});
