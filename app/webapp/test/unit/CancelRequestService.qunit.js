/* global QUnit, sinon */
sap.ui.define([
    "app/service/CancelRequestService" // <-- correct module id
], function (CancelRequestService) {
    "use strict";

    QUnit.module("cancelRequestService - behavior tests", {
        beforeEach: function () {
            this.fetchStub = sinon.stub(window, "fetch");
        },
        afterEach: function () {
            if (this.fetchStub && this.fetchStub.restore) {
                this.fetchStub.restore();
            }
        }
    });

    QUnit.test("throws when payload missing or no LeaveID (use assert.rejects)", async function (assert) {
        assert.expect(2);
        try {
            await assert.rejects(
                CancelRequestService.cancelRequestService(null),
                /Missing LeaveID|Error/,
                "Throws when payload is null"
            );
            await assert.rejects(
                CancelRequestService.cancelRequestService({}),
                /Missing LeaveID|Error/,
                "Throws when LeaveID missing"
            );
        } catch (err) {
            console.error("Error in 'throws when payload' test:", err);
            throw err;
        }
    });

    QUnit.test("successful POST with empty body -> returns { cancelReq: null }", async function (assert) {
        assert.expect(1);
        try {
            const fakeResponse = new Response("", { status: 200, statusText: "OK" });
            this.fetchStub.resolves(fakeResponse);

            const result = await CancelRequestService.cancelRequestService({ LeaveID: 123 });
            assert.deepEqual(result, { cancelReq: null }, "Empty body parsed to null");
        } catch (err) {
            console.error("Error in 'empty body' test:", err);
            throw err;
        }
    });

    QUnit.test("successful POST with boolean response body -> returns that boolean", async function (assert) {
        assert.expect(1);
        try {
            const body = "true";
            const fakeResponse = new Response(body, {
                status: 200,
                statusText: "OK",
                headers: { "Content-Type": "application/json" }
            });
            this.fetchStub.resolves(fakeResponse);

            const result = await CancelRequestService.cancelRequestService({ LeaveID: 123 });
            assert.deepEqual(result, { cancelReq: true }, "boolean true parsed correctly");
        } catch (err) {
            console.error("Error in 'boolean body' test:", err);
            throw err;
        }
    });

    QUnit.test("successful POST with JSON { value: [...] } -> returns value", async function (assert) {
        assert.expect(1);
        try {
            const payload = { value: [{ id: 1 }] };
            const fakeResponse = new Response(JSON.stringify(payload), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
            this.fetchStub.resolves(fakeResponse);

            const result = await CancelRequestService.cancelRequestService({ LeaveID: 123 });
            assert.deepEqual(result, { cancelReq: payload }, "returns parsed JSON object (with value)");
        } catch (err) {
            console.error("Error in 'json body' test:", err);
            throw err;
        }
    });

    QUnit.test("POST but non-OK response -> rejects", async function (assert) {
        assert.expect(1);
        try {
            const fakeResponse = new Response("Server error", { status: 500, statusText: "Error" });
            this.fetchStub.resolves(fakeResponse);

            await assert.rejects(
                CancelRequestService.cancelRequestService({ LeaveID: 123 }),
                /Server error|Error/,
                "Should reject on non-OK response"
            );
        } catch (err) {
            console.error("Error in 'non-OK' test:", err);
            throw err;
        }
    });

    QUnit.test("ensures fetch called with correct URL and options", async function (assert) {
        assert.expect(3);
        try {
            const fakeResponse = new Response("", { status: 200 });
            this.fetchStub.resolves(fakeResponse);

            const payload = { LeaveID: 999, reason: "test" };
            await CancelRequestService.cancelRequestService(payload);

            assert.ok(this.fetchStub.calledOnce, "fetch called once");
            const callArgs = this.fetchStub.getCall(0).args;
            assert.ok(callArgs[0].includes("/cancelLeave") || callArgs[0].includes("cancelLeave"), "URL includes cancelLeave");
            const options = callArgs[1];
            assert.strictEqual(options.method, "POST", "method is POST");
        } catch (err) {
            console.error("Error in 'fetch called' test:", err);
            throw err;
        }
    });
});
