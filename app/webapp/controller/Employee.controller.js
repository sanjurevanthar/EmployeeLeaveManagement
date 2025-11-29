sap.ui.define(["sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "app/service/LeaveRequestService"   // ensure this path is correct
], 
    
    function (Controller, MessageToast, MessageBox, LeaveRequestService) {
    
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
        }


            
        });
})