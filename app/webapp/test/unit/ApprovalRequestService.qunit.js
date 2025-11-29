/* global QUnit, sinon */
sap.ui.define([
  "app/service/ApprovalRequestService"
], function (ApprovalRequestService) {
  "use strict";

  QUnit.module("ApprovalRequestService", {
    beforeEach: function () {
      this.fetchStub = sinon.stub(window, "fetch");
    },
    afterEach: function () {
      if (this.fetchStub && this.fetchStub.restore) {
        this.fetchStub.restore();
      }
    }
  });

  QUnit.test("approvalRequestService - missing LeaveID rejects", async function (assert) {
    assert.expect(1);
    await assert.rejects(
      ApprovalRequestService.approvalRequestService({}),
      /Missing LeaveID/,
      "Rejects when payload or LeaveID missing"
    );
  });

  QUnit.test("approvalRequestService - action returns boolean true and patch succeeds", async function (assert) {
    assert.expect(3);
    const payload = { LeaveID: 11, Comments: "Ok" };

    // First fetch (action) returns boolean true as JSON
    const actionResp = new Response("true", { status: 200, headers: { "Content-Type": "application/json" } });
    // Second fetch (patch) returns 204 with NULL body (must be null for 204)
    const patchResp = new Response(null, { status: 204 });

    // Make stub resolve sequentially
    this.fetchStub.onCall(0).resolves(actionResp);
    this.fetchStub.onCall(1).resolves(patchResp);

    const res = await ApprovalRequestService.approvalRequestService(payload);
    assert.ok(res && typeof res === "object", "returns object");
    assert.strictEqual(res.patch, true, "patch true");
    assert.strictEqual(res.approved, true, "approved boolean true returned");
  });

  QUnit.test("approvalRequestService - action returns object with value array", async function (assert) {
    assert.expect(2);
    const payload = { LeaveID: 22 };

    const actionPayload = { value: [{ approved: true }] };
    const actionResp = new Response(JSON.stringify(actionPayload), { status: 200, headers: { "Content-Type": "application/json" } });
    const patchResp = new Response(null, { status: 204 });

    this.fetchStub.onCall(0).resolves(actionResp);
    this.fetchStub.onCall(1).resolves(patchResp);

    const res = await ApprovalRequestService.approvalRequestService(payload);
    assert.strictEqual(res.patch, true, "patch true");
    assert.deepEqual(res.approved, actionPayload.value, "approved equals returned value array");
  });

  QUnit.test("approvalRequestService - action non-ok rejects", async function (assert) {
    assert.expect(1);
    const payload = { LeaveID: 33 };
    this.fetchStub.onCall(0).resolves(new Response("Action Failed", { status: 500 }));
    await assert.rejects(
      ApprovalRequestService.approvalRequestService(payload),
      /Action Failed|Error/,
      "Rejects when action call fails"
    );
  });

  QUnit.test("approvalRequestService - patch fails after action succeeds -> rejects", async function (assert) {
    assert.expect(1);
    const payload = { LeaveID: 44 };

    const actionResp = new Response("true", { status: 200, headers: { "Content-Type": "application/json" } });
    const patchFail = new Response("Patch Fail", { status: 500 });

    this.fetchStub.onCall(0).resolves(actionResp);
    this.fetchStub.onCall(1).resolves(patchFail);

    await assert.rejects(
      ApprovalRequestService.approvalRequestService(payload),
      /Patch Fail|Error/,
      "Rejects when patch fails after action"
    );
  });

  QUnit.test("approvalRequestService - ensures correct URLs and methods used", async function (assert) {
    assert.expect(5);
    const payload = { LeaveID: 77 };

    const actionResp = new Response("true", { status: 200, headers: { "Content-Type": "application/json" } });
    const patchResp = new Response(null, { status: 204 });

    this.fetchStub.onCall(0).resolves(actionResp);
    this.fetchStub.onCall(1).resolves(patchResp);

    await ApprovalRequestService.approvalRequestService(payload);

    assert.ok(this.fetchStub.calledTwice, "fetch called twice");
    const call0 = this.fetchStub.getCall(0);
    const call1 = this.fetchStub.getCall(1);

    assert.strictEqual(call0.args[1].method, "POST", "first call is POST");
    assert.ok(call0.args[0].includes("/approvalLeave") || call0.args[0].includes("approvalLeave"), "first URL is action endpoint");

    assert.strictEqual(call1.args[1].method, "PATCH", "second call is PATCH");
    // check patch URL contains LeaveID
    assert.ok(call1.args[0].includes("LeaveRequests") && call1.args[0].includes("LeaveID"), "patch URL includes LeaveRequests and LeaveID");
  });
});
