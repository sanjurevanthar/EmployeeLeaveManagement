/* global QUnit, sinon */
sap.ui.define([
  "app/controller/App.controller"
], function (AppController) {
  "use strict";

  QUnit.module("App.controller - onGoPress", {
    beforeEach: function () {
      // ensure clean global nav var and console stubs
      this.origNav = window.navigationVariable;
      this.consoleLogStub = sinon.stub(console, "log");
    },
    afterEach: function () {
      // restore
      window.navigationVariable = this.origNav;
      if (this.consoleLogStub && this.consoleLogStub.restore) {
        this.consoleLogStub.restore();
      }
    }
  });

  QUnit.test("calls navigationVariable with selected key when select present", async function (assert) {
    assert.expect(2);

    // prepare a fake view with roleSelect control
    const fakeSelect = {
      getSelectedKey: function () {
        return "ADMIN";
      }
    };
    const fakeView = {
      byId: function (id) {
        // ensure code requested the right id (optional)
        assert.strictEqual(id, "roleSelect", "asked for roleSelect id");
        return fakeSelect;
      }
    };

    // make a sinon spy on global nav function
    const navSpy = sinon.spy();
    window.navigationVariable = navSpy;

    // call the controller method using the controller prototype (no full UI5 controller instance needed)
    const ctrlProto = AppController.prototype;
    // call with fake 'this' that has getView()
    await ctrlProto.onGoPress.call({ getView: function () { return fakeView; } }, /* oEvent */ {});

    assert.ok(navSpy.calledOnceWithExactly("ADMIN"), "navigationVariable called once with selected key");
  });

  QUnit.test("logs when navigationVariable missing", async function (assert) {
    assert.expect(2);

    const fakeSelect = {
      getSelectedKey: function () {
        return "USER";
      }
    };
    const fakeView = {
      byId: function (id) {
        assert.strictEqual(id, "roleSelect", "asked for roleSelect id");
        return fakeSelect;
      }
    };

    // ensure global nav var undefined
    window.navigationVariable = undefined;

    const ctrlProto = AppController.prototype;
    // call method
    await ctrlProto.onGoPress.call({ getView: function () { return fakeView; } }, {});
    // code path logs "Navigation Variable Not Found"
    assert.ok(this.consoleLogStub.calledWith("Navigation Variable Not Found"), "logged missing navigation variable");
  });

  QUnit.test("logs role-select missing and throws when select is absent", function (assert) {
    assert.expect(3);

    // fake view returns undefined for byId
    const fakeView = {
      byId: function (id) {
        assert.strictEqual(id, "roleSelect", "asked for roleSelect id");
        return undefined; // select missing
      }
    };

    // call method and capture exception (because code incorrectly proceeds to call getSelectedKey)
    const ctrlProto = AppController.prototype;
    try {
      ctrlProto.onGoPress.call({ getView: function () { return fakeView; } }, {});
      assert.ok(false, "Expected method to throw when select missing (but it didn't)");
    } catch (err) {
      // method logs first then throws; verify log happened
      assert.ok(this.consoleLogStub.calledWith("Role Select option Not Found"), "logged missing role select");
      // we expect an error (TypeError) because code does oselect.getSelectedKey() after the null check
      assert.ok(err instanceof Error || err instanceof TypeError, "method threw due to missing select");
    }
  });
});
