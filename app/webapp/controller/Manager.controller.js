sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/StandardListItem",
  "app/service/LeaveRequestService",
  "sap/ui/model/json/JSONModel",
   "app/service/ApprovalRequestService",
   "app/service/RejectionRequestService"


], function (Controller, MessageToast, MessageBox, StandardListItem, LeaveRequestService, JSONModel,ApprovalRequestService,RejectionRequestService) {
  "use strict";

  return Controller.extend("app.controller.Manager", {

    onClearPress: function(){
      this.byId("managerIdInput").setValue("");
      this.byId("resultSummary").setVisible(false).setText("");
      this.byId("managerList").removeAllItems();
    },

//Failed to reject the request: rejectionRequestService is not defined


    onInit: function () {
        // CREATE THE MODEL!!!!
        this.getView().setModel(new JSONModel({
            items: []
        }), "requests");
    },



    onSearchPress: async function () {
        var sManagerId = this.byId("managerIdInput").getValue().trim();
        var oSummary = this.byId("resultSummary");
        var oModel = this.getView().getModel("requests");

        if (!sManagerId) {
            MessageBox.error("Please enter a Manager ID");
            return;
        }

        try {
            console.log("Odata Call 1 started");
            const data = await LeaveRequestService.getLeavesByManager(sManagerId);
            console.log("Odata Call 1 ended");

            const dataValue = Array.isArray(data) ? data : (data && data.value) ? data.value : [];

            if (!dataValue.length) {
            oModel.setProperty("/items", []);   // clear model
            oSummary.setVisible(false);
            MessageBox.error("No leave requests found");
            return;
            }

            // Adapt OData result → UI model structure expected by XML
            const items = dataValue.map(o => {
            return {
                LeaveID: o.LeaveID || o.leaveId || o.ID || o.Id || o.RequestID || o.requestId || null,
                id: o.EmployeeID || "",
                employeeName: o.EmployeeID || "",
                from: o.FromDate || "",
                to: o.ToDate || "",
                type: o.Reason || "",
                status: o.Status || "",
                acceptComment: "",
                rejectComment: ""
            };
            });

            oModel.setProperty("/items", items);

            oSummary.setVisible(true)
                    .setText(`You have ${items.length} pending requests`);

        } catch (error) {
            MessageBox.error("Failed to fetch leave requests: " + (error.message || error));
        }
        },




        onRejectPress: async function (oEvent) {

            //Find what item is clicked from the context
            //const oModel= "requests";
            const oModel = this.getView().getModel("requests");

            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext("requests");




            const oItem = oContext.getObject();

            if (!oContext) {
                MessageBox.error("Failed to get item context.");
                console.error("Context is null.");
                return;
            }


            //Read the Iteam from context Data -> To Build the payload && Building the payload


            const payload = {
                LeaveID: oItem.LeaveID,
                Comments: oItem.rejectComment || ""
            };


            try{
                //Confirmation Box
                const confirm = await new Promise((resolve, reject) => {
                    MessageBox.confirm("Are you sure you want to reject this request?", {
                        onClose: resolve
                    });
                });

                if (confirm !== MessageBox.Action.OK) {
                    return;
                    }

                //Call the service to reject the request
                console.log(payload);
                await RejectionRequestService.rejectionRequestService(payload);


                //Call is Successful -> Update the UI
                let aItems = oModel.getProperty("/items") || [];
                aItems = aItems.filter(o => o.LeaveID !== oItem.LeaveID);
                oModel.setProperty("/items", aItems);
                MessageBox.success("Request rejected successfully");


            }

            catch(error){
            MessageBox.error("Failed to reject the request: " + (error.message || error));
        }

        },


            onAcceptPress: async function (oEvent) {

            //Find what item is clicked from the context
            //const oModel= "requests";
            const oModel = this.getView().getModel("requests");

            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext("requests");




            const oItem = oContext.getObject();

            if (!oContext) {
                MessageBox.error("Failed to get item context.");
                console.error("Context is null.");
                return;
            }


            //Read the Iteam from context Data -> To Build the payload && Building the payload


            const payload = {
                LeaveID: oItem.LeaveID,
                Comments: oItem.acceptComment || ""
            };


            try{
                //Confirmation Box
                const confirm = await new Promise((resolve, reject) => {
                    MessageBox.confirm("Are you sure you want to Approve this request?", {
                        onClose: resolve
                    });
                });

                if (confirm !== MessageBox.Action.OK) {
                    return;
                    }

                //Call the service to reject the request
                console.log(payload);
                await ApprovalRequestService.approvalRequestService(payload);


                //Call is Successful -> Update the UI
                let aItems = oModel.getProperty("/items") || [];
                aItems = aItems.filter(o => o.LeaveID !== oItem.LeaveID);
                oModel.setProperty("/items", aItems);
                MessageBox.success("Accepted successfully");


            }

            catch(error){
            MessageBox.error("Failed to accept the request: " + (error.message || error));
        }

        },



           // Back button in header — simple & correct for your XMLView.create flow
            onBackPress: function () {
                if (window.navigationVariable) {
                    window.navigationVariable("App"); // recreate the App view (go back)
                } else {
                    console.error("window.navigationVariable is not defined");
                }
            }

        
            





  });
});
