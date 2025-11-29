/* global QUnit, sinon */
sap.ui.define([
  "app/controller/Manager.controller"
], function (ManagerController) {
  "use strict";

  QUnit.module("Manager.controller (unit)", {
    beforeEach: function () {
      // Ensure MessageBox/Toast exist and stub the methods used
      if (!sap.m.MessageBox) sap.m.MessageBox = {};
      if (!sap.m.MessageBox.Action) sap.m.MessageBox.Action = { OK: "OK" };

      this.msgErrorStub = sinon.stub(sap.m.MessageBox, "error");
      this.msgSuccessStub = sinon.stub(sap.m.MessageBox, "success");
      this.msgConfirmStub = sinon.stub(sap.m.MessageBox, "confirm");
      this.toastStub = sinon.stub(sap.m.MessageToast, "show");

      // Prepare service module references so tests can stub them
      this.leaveSvc = sap.ui.require("app/service/LeaveRequestService");
      this.apprSvc = sap.ui.require("app/service/ApprovalRequestService");
      this.rejSvc  = sap.ui.require("app/service/RejectionRequestService");
    },
    afterEach: function () {
      sinon.restore();
    }
  });

  const proto = ManagerController.prototype;

  QUnit.test("onClearPress clears inputs, hides summary and removes list items", function (assert) {
    assert.expect(4);

    // fake controls with spies
    const fakeInputs = {
      managerIdInput: { setValue: sinon.spy() },
      resultSummary: { setVisible: sinon.stub().returnsThis(), setText: sinon.spy() },
      managerList: { removeAllItems: sinon.spy() }
    };

    // IMPORTANT: controller calls this.byId(), so provide byId on the fake this
    const fakeThis = {
      byId: function (id) {
        return fakeInputs[id];
      }
    };

    // call the controller method with correct fake 'this'
    proto.onClearPress.call(fakeThis);

    assert.ok(fakeInputs.managerIdInput.setValue.calledOnce, "managerIdInput.setValue called");
    assert.ok(fakeInputs.resultSummary.setVisible.calledOnce, "resultSummary.setVisible called");
    assert.ok(fakeInputs.resultSummary.setText.calledOnce, "resultSummary.setText called");
    assert.ok(fakeInputs.managerList.removeAllItems.calledOnce, "managerList.removeAllItems called");
  });

  QUnit.test("onSearchPress - missing manager id shows error", async function (assert) {
    assert.expect(1);

    // Provide a fake this that has byId (since controller uses this.byId("managerIdInput"))
    const fakeThis = {
      byId: function (id) {
        if (id === "managerIdInput") {
          return { getValue: function () { return "   "; } }; // whitespace -> trimmed empty
        }
        return null;
      },
      getView: function () { return { getModel: function () { return { setProperty: sinon.spy() }; } }; }
    };

    await proto.onSearchPress.call(fakeThis);
    assert.ok(sap.m.MessageBox.error.calledOnce, "MessageBox.error called for missing manager id");
  });

  QUnit.test("onSearchPress - successful load sets model items and updates summary", async function (assert) {
    assert.expect(4);

    const sampleData = {
      value: [
        { LeaveID: "L1", EmployeeID: "E1", FromDate: "2025-11-10", ToDate: "2025-11-11", Reason: "r", Status: "Pending" },
        { LeaveID: "L2", EmployeeID: "E2", FromDate: "2025-11-09", ToDate: "2025-11-09", Reason: "r2", Status: "Pending" }
      ]
    };

    // stub service to return sampleData
    sinon.stub(this.leaveSvc, "getLeavesByManager").resolves(sampleData);

    // fake summary control and managerList (we only need summary)
    const resultSummary = {
      setVisible: sinon.stub().returnsThis(),
      setText: sinon.spy()
    };

    // fake model capture
    const modelData = { items: [] };
    const fakeModel = {
      setProperty: function (path, val) {
        if (path === "/items") modelData.items = val;
      }
    };

    // Provide fake this with both byId (to get managerIdInput & resultSummary) and getView (to get model)
    const fakeThis = {
      byId: function (id) {
        if (id === "managerIdInput") return { getValue: () => "MGR1" };
        if (id === "resultSummary") return resultSummary;
        return null;
      },
      getView: function () { return { getModel: function (name) { return fakeModel; } }; }
    };

    await proto.onSearchPress.call(fakeThis);

    assert.strictEqual(modelData.items.length, 2, "Model set with 2 items");
    assert.ok(resultSummary.setVisible.calledOnce, "Summary.visible called");
    assert.ok(resultSummary.setText.calledOnce, "Summary text set");
    assert.ok(this.leaveSvc.getLeavesByManager.calledOnceWithExactly("MGR1"), "getLeavesByManager called");
  });

  QUnit.test("onRejectPress - missing context shows error", async function (assert) {
    assert.expect(1);

    // controller uses this.getView().getModel(...) in onRejectPress so provide getView
    const fakeThis = {
      getView: function () { return { getModel: function () { return {}; } }; }
    };

    const fakeBtn = { getBindingContext: function () { return null; } };
    const fakeEvt = { getSource: function () { return fakeBtn; } };

    await proto.onRejectPress.call(fakeThis, fakeEvt);

    assert.ok(sap.m.MessageBox.error.calledOnce, "MessageBox.error called for missing context");
  });

  QUnit.test("onRejectPress - confirm OK calls rejection service, removes item and shows success", async function (assert) {
    assert.expect(6);

    // prepare model with two items, one will be removed
    const item = { LeaveID: "R-1", rejectComment: "reason" };
    const modelState = { items: [item, { LeaveID: "R-2" }] };
    const fakeModel = {
      getProperty: function (path) { if (path === "/items") return modelState.items; },
      setProperty: function (path, val) { if (path === "/items") modelState.items = val; }
    };

    const fakeThis = {
      getView: function () { return { getModel: function () { return fakeModel; } }; }
    };

    const fakeContext = { getObject: function () { return item; } };
    const fakeBtn = { getBindingContext: function () { return fakeContext; } };
    const fakeEvt = { getSource: function () { return fakeBtn; } };

    // Make confirm immediately call onClose with OK
    this.msgConfirmStub.callsFake(function (text, opts) {
      if (opts && typeof opts.onClose === "function") opts.onClose(sap.m.MessageBox.Action.OK);
    });

    // stub rejection service on real module
    const svc = this.rejSvc;
    sinon.stub(svc, "rejectionRequestService").resolves(true);

    await proto.onRejectPress.call(fakeThis, fakeEvt);

    assert.ok(svc.rejectionRequestService.calledOnce, "rejectionRequestService called");
    assert.ok(svc.rejectionRequestService.calledWith(sinon.match({ LeaveID: "R-1" })), "called with correct payload");
    assert.strictEqual(modelState.items.length, 1, "one item left in model");
    assert.strictEqual(modelState.items[0].LeaveID, "R-2", "remaining item is R-2");
    assert.ok(sap.m.MessageBox.success.calledOnce, "MessageBox.success shown");
    assert.ok(sap.m.MessageBox.success.calledWith("Request rejected successfully"), "success message correct");
  });

  QUnit.test("onAcceptPress - confirm OK calls approval service, removes item and shows success", async function (assert) {
    assert.expect(6);

    const item = { LeaveID: "A-1", acceptComment: "ok" };
    const modelState = { items: [item, { LeaveID: "A-2" }] };
    const fakeModel = {
      getProperty: function (path) { if (path === "/items") return modelState.items; },
      setProperty: function (path, val) { if (path === "/items") modelState.items = val; }
    };

    const fakeThis = {
      getView: function () { return { getModel: function () { return fakeModel; } }; }
    };

    const fakeContext = { getObject: function () { return item; } };
    const fakeBtn = { getBindingContext: function () { return fakeContext; } };
    const fakeEvt = { getSource: function () { return fakeBtn; } };

    this.msgConfirmStub.callsFake(function (text, opts) {
      if (opts && typeof opts.onClose === "function") opts.onClose(sap.m.MessageBox.Action.OK);
    });

    const svcA = this.apprSvc;
    sinon.stub(svcA, "approvalRequestService").resolves(true);

    await proto.onAcceptPress.call(fakeThis, fakeEvt);

    assert.ok(svcA.approvalRequestService.calledOnce, "approvalRequestService called");
    assert.ok(svcA.approvalRequestService.calledWith(sinon.match({ LeaveID: "A-1" })), "called with correct payload");
    assert.strictEqual(modelState.items.length, 1, "one item left in model");
    assert.strictEqual(modelState.items[0].LeaveID, "A-2", "remaining item is A-2");
    assert.ok(sap.m.MessageBox.success.calledOnce, "MessageBox.success shown");
    assert.ok(sap.m.MessageBox.success.calledWith("Accepted successfully"), "success message correct");
  });

});
