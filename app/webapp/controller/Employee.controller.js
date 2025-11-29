sap.ui.define(["sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "app/service/LeaveRequestService",   
  "app/service/CancelRequestService"
], 
    
    function (Controller, MessageToast, MessageBox, LeaveRequestService, CancelRequestService) {
    
        "use strict";

        return Controller.extend("app.controller.Employee",
        {
                //New Request button
                onCreatePress: function(){
                    this.byId("createLeaveDialog").open();
                },

                //Cancel Button
                onCreateCancel: function(){
                    this.byId("createLeaveDialog").close();
                },


                //create New Request
                onCreateConfirm: function(){


                    const oview = this.getView();

                    const payload = {
                       
                                EmployeeID: oview.byId("inpEmployeeID").getValue(),
                                LeaveTypeID_LeaveTypeID: oview.byId("inpLeaveType").getValue(),
                                FromDate: oview.byId("inpFromDate").getValue(),
                                ToDate: oview.byId("inpToDate").getValue(),
                                Status: "Pending",
                                Reason: oview.byId("inpReason").getValue(),
                                Manager_EmployeeID: oview.byId("inpManagerID").getValue(),
                                Comments: oview.byId("inpComments").getValue()

                    };

                //call the service calss for the ODATA call
                LeaveRequestService.createLeaveRequest(payload)
                    .then(() => {
                        MessageToast.show("Leave Request Created Successfully");
                        this.byId("createLeaveDialog").close();
                    })
                    .catch(error =>{
                        MessageBox.error("Failed to create leave request "+ error.message);
                    });


                },

                // Back button in header — simple & correct for your XMLView.create flow
                onBackPress: function () {
                    if (window.navigationVariable) {
                        window.navigationVariable("App"); // recreate the App view (go back)
                    } else {
                        console.error("window.navigationVariable is not defined");
                    }
                },

                onInit: function () {
                // create model that XML is bound to
                this.getView().setModel(new sap.ui.model.json.JSONModel({ items: [] }), "employeeRequests");
                },

//New Code
            onCancelPress: function (oEvent) {
            var oBtn = oEvent.getSource();
            var oCtx = oBtn.getBindingContext("employeeRequests");
            if (!oCtx) {
                sap.m.MessageBox.error("Unable to determine selected request.");
                return;
            }
            var oItem = oCtx.getObject();
            var sLeaveID = oItem && (oItem.LeaveID || oItem.leaveId || oItem.ID || oItem.Id);
            if (!sLeaveID) {
                sap.m.MessageBox.error("Selected item has no LeaveID.");
                return;
            }

            var that = this;
            sap.m.MessageBox.confirm("Are you sure you want to cancel (remove) this leave request?", {
                onClose: function (action) {
                if (action !== sap.m.MessageBox.Action.OK) return;

                // disable button to prevent duplicate clicks
                oBtn.setEnabled(false);

                (async function () {
                    try {
                    if (CancelRequestService && typeof CancelRequestService.cancelRequestService === "function") {
                        await CancelRequestService.cancelRequestService({ LeaveID: sLeaveID });
                    } else if (CancelRequestService && typeof CancelRequestService.cancelLeave === "function") {
                        await CancelRequestService.cancelLeave({ LeaveID: sLeaveID });
                    } else if (CancelRequestService && typeof CancelRequestService.cancel === "function") {
                        await CancelRequestService.cancel(sLeaveID);
                    } else {
                        throw new Error("No cancel method found on CancelRequestService");
                    }

                    // Remove the item from the local model so it disappears immediately
                    var oModel = that.getView().getModel("employeeRequests");
                    var aItems = oModel.getProperty("/items") || [];
                    aItems = aItems.filter(function (it) {
                        var id = it.LeaveID || it.leaveId || it.ID || it.Id;
                        return id !== sLeaveID;
                    });
                    oModel.setProperty("/items", aItems);

                    sap.m.MessageToast.show("Leave request removed.");

                    } catch (err) {
                    sap.m.MessageBox.error("Failed to cancel request: " + (err && err.message ? err.message : err));
                    console.error(err);
                    } finally {
                    // re-enable the button
                    oBtn.setEnabled(true);
                    }
                })();
                }
            });
            },

            // XML Refresh button calls this
            onRefreshRequests: function () {
            this.loadRequests();
            },

           loadRequests: async function (sEmployeeId) {
                var oView = this.getView();
                var oModel = oView.getModel("employeeRequests");

                // resolve employee id from param or inputs
                sEmployeeId = sEmployeeId
                    || (oView.byId("viewEmployeeID") && oView.byId("viewEmployeeID").getValue().trim())
                    || (oView.byId("inpEmployeeID") && oView.byId("inpEmployeeID").getValue().trim());

                if (!sEmployeeId) {
                    sap.m.MessageToast.show("Enter Employee ID to load requests");
                    return;
                }

                try {
                    const data = await LeaveRequestService.getLeavesByEmployee(sEmployeeId);
                    const rows = Array.isArray(data) ? data : (data && data.value) ? data.value : [];

                    const items = rows.map(r => ({
                        LeaveID: r.LeaveID || r.ID || r.Id || null,
                        FromDate: r.FromDate || "",
                        ToDate: r.ToDate || "",
                        Reason: r.Reason || "",
                        Status: r.Status || "Pending",
                        employeeName: r.EmployeeID || sEmployeeId
                    }));

                    const order = { Pending: 0, Approved: 1, Rejected: 2 };
                    items.sort((a, b) => {
                        const orderA = order[a.Status] ?? 3;
                        const orderB = order[b.Status] ?? 3;

                        // First sort by status
                        if (orderA !== orderB) return orderA - orderB;

                        // Then inside same status sort by FromDate (newest first)
                        const dateA = Date.parse(a.FromDate) || 0;
                        const dateB = Date.parse(b.FromDate) || 0;

                        return dateB - dateA; // newest first
                    });

                    oModel.setProperty("/items", items);

                    sap.m.MessageToast.show("Loaded " + items.length + " requests for " + sEmployeeId);
                } catch (err) {
                    sap.m.MessageBox.error("Failed to load requests: " + (err && err.message ? err.message : err));
                    console.error(err);
                }
            }

         
        });
})