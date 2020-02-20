const SimpleDB = artifacts.require("SimpleDB");
const chai = require("chai");
const expect = chai.expect;
chai.should();

contract("SimpleDB", ([admin, otherUser]) => {
  let simpleDBContract;

  beforeEach(async () => {
    simpleDBContract = await SimpleDB.new(1);
  });

  describe("set", async () => {
    describe("no previously stored value", async () => {
      it("should store the assigned integer, oldValue is zero", async () => {
        const response = await simpleDBContract.set(2);
        const result = response.logs[0];

        result.event.should.equal("StoredValue");
        result.args.newData.toNumber().should.equal(2);
        result.args.oldData.toNumber().should.equal(0);
        result.args.version.toNumber().should.equal(1);
      });
    });
    describe("has a previously stored value", async () => {
      beforeEach(async () => {
        await simpleDBContract.set(3);
      });

      it("should store the assigned integer, oldValue is the previous value", async () => {
        const response = await simpleDBContract.set(7);
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
        const storedValue = await simpleDBContract.get();

        storedValue.toNumber().should.equal(0);
      });
    });
    describe("has a previously stored value", async () => {
      beforeEach(async () => {
        await simpleDBContract.set(3);
      });

      it("should return this stored value", async () => {
        const storedValue = await simpleDBContract.get();

        storedValue.toNumber().should.equal(3);
      });
    });
  });
});
