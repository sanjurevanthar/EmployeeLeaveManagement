/* global QUnit, sinon */
sap.ui.define([
  "app/service/LeaveRequestService"
], function (LeaveRequestService) {
  "use strict";

  QUnit.module("LeaveRequestService", {
    beforeEach: function () {
      this.fetchStub = sinon.stub(window, "fetch");
    },
    afterEach: function () {
      if (this.fetchStub && this.fetchStub.restore) {
        this.fetchStub.restore();
      }
    }
  });

  QUnit.test("createLeaveRequest - success returns parsed json", async function (assert) {
    assert.expect(1);
    const payload = { EmployeeID: "E1", FromDate: "2025-01-01" };
    const serverResp = { id: 123, ...payload };

    this.fetchStub.resolves(new Response(JSON.stringify(serverResp), { status: 201, headers: { "Content-Type": "application/json" } }));

    const res = await LeaveRequestService.createLeaveRequest(payload);
    assert.deepEqual(res, serverResp, "createLeaveRequest returns parsed JSON on success");
  });

  QUnit.test("createLeaveRequest - non-ok rejects", async function (assert) {
    assert.expect(1);
    this.fetchStub.resolves(new Response("Bad", { status: 500 }));
    await assert.rejects(
      LeaveRequestService.createLeaveRequest({}),
      /Server error/,
      "Rejected on non-OK response"
    );
  });

  QUnit.test("getLeavesByManager - no manager returns empty value array", async function (assert) {
    assert.expect(1);
    const res = await LeaveRequestService.getLeavesByManager(null);
    assert.deepEqual(res, { value: [] }, "returns empty value object when no managerId");
  });

  QUnit.test("getLeavesByManager - success returns json", async function (assert) {
    assert.expect(2);
    const payload = { value: [{ LeaveID: 1 }] };
    const fakeResp = new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } });
    this.fetchStub.resolves(fakeResp);

    const res = await LeaveRequestService.getLeavesByManager("M1");
    assert.deepEqual(res, payload, "returns object with value array");
    // ensure correct URL was used
    assert.ok(this.fetchStub.calledOnce && this.fetchStub.getCall(0).args[0].includes("$filter"), "fetch called with filter query");
  });

  QUnit.test("getLeavesByManager - non-ok rejects with text", async function (assert) {
    assert.expect(1);
    this.fetchStub.resolves(new Response("Not Found", { status: 404 }));
    await assert.rejects(
      LeaveRequestService.getLeavesByManager("M1"),
      /Not Found|HTTP 404/,
      "Rejects on non-ok with server text"
    );
  });

  QUnit.test("getLeavesByEmployee - no employee returns empty value array", async function (assert) {
    assert.expect(1);
    const res = await LeaveRequestService.getLeavesByEmployee("");
    assert.deepEqual(res, { value: [] }, "returns empty value object when no employeeId");
  });

  QUnit.test("getLeavesByEmployee - success returns json and order param present", async function (assert) {
    assert.expect(2);
    const payload = { value: [{ LeaveID: 2 }] };
    this.fetchStub.resolves(new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } }));

    const res = await LeaveRequestService.getLeavesByEmployee("E1");
    assert.deepEqual(res, payload, "returns parsed json for employee");
    assert.ok(this.fetchStub.calledOnce && this.fetchStub.getCall(0).args[0].includes("$orderby=FromDate"), "URL includes orderby");
  });

  QUnit.test("getLeavesByEmployee - non-ok rejects", async function (assert) {
    assert.expect(1);
    this.fetchStub.resolves(new Response("Server", { status: 500 }));
    await assert.rejects(
      LeaveRequestService.getLeavesByEmployee("E1"),
      /Server|HTTP 500/,
      "Rejects on non-ok"
    );
  });
});
