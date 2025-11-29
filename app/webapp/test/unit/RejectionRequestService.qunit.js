/* global QUnit, sinon */
sap.ui.define([
  "app/service/RejectionRequestService"
], function (RejectionRequestService) {
  "use strict";

  QUnit.module("RejectionRequestService", {
    beforeEach: function () {
      this.fetchStub = sinon.stub(window, "fetch");
    },
    afterEach: function () {
      if (this.fetchStub && this.fetchStub.restore) {
        this.fetchStub.restore();
      }
    }
  });

  QUnit.test("rejectionRequestService - missing LeaveID rejects", async function (assert) {
    assert.expect(1);
    await assert.rejects(
      RejectionRequestService.rejectionRequestService({}),
      /Missing LeaveID/,
      "Rejects when payload or LeaveID missing"
    );
  });

  QUnit.test("rejectionRequestService - action returns boolean false and patch succeeds", async function (assert) {
    assert.expect(3);
    const payload = { LeaveID: "1111-2222", Comments: "Not allowed" };

    // First fetch (action) returns boolean false as JSON
    const actionResp = new Response("false", { status: 200, headers: { "Content-Type": "application/json" } });
    // Second fetch (patch) returns 204 with NULL body
    const patchResp = new Response(null, { status: 204 });

    this.fetchStub.onCall(0).resolves(actionResp);
    this.fetchStub.onCall(1).resolves(patchResp);

    const res = await RejectionRequestService.rejectionRequestService(payload);
    assert.ok(res && typeof res === "object", "returns object");
    assert.strictEqual(res.patch, true, "patch true");
    assert.strictEqual(res.rejected, false, "rejected boolean false returned");
  });

  QUnit.test("rejectionRequestService - action returns object with value array", async function (assert) {
    assert.expect(2);
    const payload = { LeaveID: "2222-3333" };

    const actionPayload = { value: [{ rejectedBy: "mgr" }] };
    const actionResp = new Response(JSON.stringify(actionPayload), { status: 200, headers: { "Content-Type": "application/json" } });
    const patchResp = new Response(null, { status: 204 });

    this.fetchStub.onCall(0).resolves(actionResp);
    this.fetchStub.onCall(1).resolves(patchResp);

    const res = await RejectionRequestService.rejectionRequestService(payload);
    assert.strictEqual(res.patch, true, "patch true");
    assert.deepEqual(res.rejected, actionPayload.value, "rejected equals returned value array");
  });

  QUnit.test("rejectionRequestService - action non-ok rejects", async function (assert) {
    assert.expect(1);
    const payload = { LeaveID: "3333-4444" };
    this.fetchStub.onCall(0).resolves(new Response("Action Failed", { status: 500 }));
    await assert.rejects(
      RejectionRequestService.rejectionRequestService(payload),
      /Action Failed|Error/,
      "Rejects when action call fails"
    );
  });

  QUnit.test("rejectionRequestService - patch fails after action succeeds -> rejects", async function (assert) {
    assert.expect(1);
    const payload = { LeaveID: "4444-5555" };

    const actionResp = new Response("true", { status: 200, headers: { "Content-Type": "application/json" } });
    const patchFail = new Response("Patch Fail", { status: 500 });

    this.fetchStub.onCall(0).resolves(actionResp);
    this.fetchStub.onCall(1).resolves(patchFail);

    await assert.rejects(
      RejectionRequestService.rejectionRequestService(payload),
      /Patch Fail|Error/,
      "Rejects when patch fails after action"
    );
  });

  QUnit.test("rejectionRequestService - ensures correct URLs and methods used", async function (assert) {
    assert.expect(5);
    const payload = { LeaveID: "7777-8888" };

    const actionResp = new Response("true", { status: 200, headers: { "Content-Type": "application/json" } });
    const patchResp = new Response(null, { status: 204 });

    this.fetchStub.onCall(0).resolves(actionResp);
    this.fetchStub.onCall(1).resolves(patchResp);

    await RejectionRequestService.rejectionRequestService(payload);

    assert.ok(this.fetchStub.calledTwice, "fetch called twice");
    const call0 = this.fetchStub.getCall(0);
    const call1 = this.fetchStub.getCall(1);

    assert.strictEqual(call0.args[1].method, "POST", "first call is POST");
    assert.ok(call0.args[0].includes("/rejectLeave") || call0.args[0].includes("rejectLeave"), "first URL is action endpoint");

    assert.strictEqual(call1.args[1].method, "PATCH", "second call is PATCH");
    assert.ok(call1.args[0].includes("LeaveRequests") && call1.args[0].includes("LeaveID"), "patch URL includes LeaveRequests and LeaveID");
  });
});
