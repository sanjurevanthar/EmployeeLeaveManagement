/* global QUnit, sinon */
sap.ui.define([
  "app/controller/Employee.controller"
], function (EmployeeController) {
  "use strict";

  QUnit.module("Employee.controller", {
    beforeEach: function () {
      // preserve any existing globals
      this.origToast = (sap && sap.m && sap.m.MessageToast) ? sap.m.MessageToast.show : undefined;
      this.origBoxError = (sap && sap.m && sap.m.MessageBox) ? sap.m.MessageBox.error : undefined;
      this.origBoxConfirm = (sap && sap.m && sap.m.MessageBox) ? sap.m.MessageBox.confirm : undefined;
      this.origBoxAction = (sap && sap.m && sap.m.MessageBox) ? sap.m.MessageBox.Action : undefined;

      // stubs
      this.toastStub = sinon.stub(sap.m.MessageToast, "show");
      // make sure MessageBox exists
      if (!sap.m.MessageBox) sap.m.MessageBox = {};
      this.msgErrorStub = sinon.stub(sap.m.MessageBox, "error");
      // provide Action constant if missing
      if (!sap.m.MessageBox.Action) sap.m.MessageBox.Action = { OK: "OK" };
      this.msgConfirmStub = sinon.stub(sap.m.MessageBox, "confirm");

      // service stubs - we replace methods on the service modules themselves
      this.leaveSrvStub = sinon.stub();
      this.cancelSrvStub = sinon.stub();

      // create default fake services object to attach to window to be safer
      // but tests will monkeypatch actual modules by altering functions on the module objects below when needed
    },
    afterEach: function () {
      // restore stubs
      if (this.toastStub && this.toastStub.restore) this.toastStub.restore();
      if (this.msgErrorStub && this.msgErrorStub.restore) this.msgErrorStub.restore();
      if (this.msgConfirmStub && this.msgConfirmStub.restore) this.msgConfirmStub.restore();

      // restore MessageBox.Action if replaced
      if (this.origBoxAction !== undefined) {
        sap.m.MessageBox.Action = this.origBoxAction;
      }

      // restore any leftover sinon stubs created on service modules in individual tests
      sinon.restore();
    }
  });

  // Helper: get controller prototype reference
  const ctrlProto = EmployeeController.prototype;

  // inside your QUnit module for EmployeeController

QUnit.test("onCreateConfirm - success closes dialog and shows toast", async function (assert) {
  assert.expect(3);

  // fake inputs (view.byId)
  const fakeInputs = {
    inpEmployeeID: { getValue: () => "E1" },
    inpLeaveType: { getValue: () => "LT1" },
    inpFromDate: { getValue: () => "2025-11-01" },
    inpToDate: { getValue: () => "2025-11-02" },
    inpReason: { getValue: () => "Test" },
    inpManagerID: { getValue: () => "M1" },
    inpComments: { getValue: () => "none" },
    createLeaveDialog: { close: sinon.spy() } // view.byId("createLeaveDialog")
  };

  const fakeView = {
    byId: function (id) {
      return fakeInputs[id];
    }
  };

  // IMPORTANT: controller uses this.byId(...) to close the dialog,
  // so provide a fake 'this' that has both getView() and byId()
  const fakeThis = {
    getView: function () { return fakeView; },
    byId: function (id) { return fakeInputs[id]; }
  };

  // stub the service to resolve
  const svc = sap.ui.require("app/service/LeaveRequestService");
  sinon.stub(svc, "createLeaveRequest").resolves({ id: 1 });

  // call controller method with the fake this
  await EmployeeController.prototype.onCreateConfirm.call(fakeThis);

  assert.ok(svc.createLeaveRequest.calledOnce, "createLeaveRequest called");
  assert.ok(fakeInputs.createLeaveDialog.close.calledOnce, "dialog closed");
  assert.ok(sap.m.MessageToast.show.calledOnce, "MessageToast shown");
});



  QUnit.test("onCancelPress - confirms, calls cancel service, removes item from model and shows toast", async function (assert) {
    assert.expect(6);

    // fake button with binding context pointing to model item
    const fakeItem = { LeaveID: "L-1", Reason: "abc" };
    const fakeContext = {
      getObject: function () { return fakeItem; }
    };
    const fakeBtn = {
      getBindingContext: function (modelName) { return fakeContext; },
      setEnabled: sinon.spy()
    };

    // fake event
    const fakeEvent = { getSource: function () { return fakeBtn; } };

    // stub MessageBox.confirm to immediately call onClose(Action.OK)
    this.msgConfirmStub.callsFake(function (text, options) {
      // call the onClose handler synchronously with OK action
      if (options && typeof options.onClose === "function") {
        options.onClose(sap.m.MessageBox.Action.OK);
      }
    });

    // stub CancelRequestService.cancelRequestService to resolve
    const cancelSrv = sap.ui.require("app/service/CancelRequestService");
    sinon.stub(cancelSrv, "cancelRequestService").resolves(true);

    // fake model on the view
    const modelData = { items: [fakeItem, { LeaveID: "L-2" }] };
    const fakeModel = {
      getProperty: function (path) {
        if (path === "/items") return modelData.items;
      },
      setProperty: function (path, val) {
        // verify path and set for later assertion
        if (path === "/items") {
          modelData.items = val;
        }
      }
    };

    const fakeView = {
      getModel: function (name) { return fakeModel; }
    };

    // call controller method with fake this
    await ctrlProto.onCancelPress.call({ getView: () => fakeView }, fakeEvent);

    // assertions
    assert.ok(sap.m.MessageBox.confirm.calledOnce, "confirm shown");
    assert.ok(cancelSrv.cancelRequestService.calledOnce, "cancel service called");
    assert.ok(cancelSrv.cancelRequestService.calledWith(sinon.match({ LeaveID: "L-1" })), "cancel called with LeaveID");

    // model item removed
    assert.strictEqual(modelData.items.length, 1, "one item left");
    assert.strictEqual(modelData.items[0].LeaveID, "L-2", "remaining item is L-2");

    // toast shown
    assert.ok(sap.m.MessageToast.show.calledOnce, "MessageToast after removal");
  });

  QUnit.test("loadRequests - missing employee id shows toast", async function (assert) {
    assert.expect(1);

    // fake view with no inputs
    const fakeView = {
      byId: function (id) { return undefined; },
      getModel: function () { return { setProperty: sinon.spy() }; }
    };

    // call loadRequests without param
    await ctrlProto.loadRequests.call({ getView: () => fakeView });

    assert.ok(sap.m.MessageToast.show.calledOnce, "MessageToast asked to enter Employee ID");
  });

  QUnit.test("loadRequests - success loads items into model and shows toast", async function (assert) {
    assert.expect(3);

    // stub LeaveRequestService.getLeavesByEmployee to return a value array
    const leaveSrv = sap.ui.require("app/service/LeaveRequestService");
    const returned = { value: [
      { LeaveID: "L1", FromDate: "2025-11-10", ToDate: "2025-11-11", Reason: "x", Status: "Pending", EmployeeID: "E1" },
      { LeaveID: "L2", FromDate: "2025-10-01", ToDate: "2025-10-02", Reason: "y", Status: "Approved", EmployeeID: "E1" }
    ]};
    sinon.stub(leaveSrv, "getLeavesByEmployee").resolves(returned);

    // fake model to capture setProperty
    const modelData = { items: [] };
    const fakeModel = {
      setProperty: function (path, val) {
        if (path === "/items") modelData.items = val;
      }
    };

    const fakeView = {
      getModel: function (name) { return fakeModel; }
    };

    // call with explicit employee id
    await ctrlProto.loadRequests.call({ getView: () => fakeView }, "E1");

    // check model updated and toast shown
    assert.strictEqual(modelData.items.length, 2, "2 items loaded");
    // check first item has LeaveID L1
    assert.strictEqual(modelData.items[0].LeaveID, "L1", "first item present");
    assert.ok(sap.m.MessageToast.show.calledOnce, "MessageToast called to announce load");
  });

});
