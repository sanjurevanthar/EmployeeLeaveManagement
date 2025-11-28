sap.ui.define(["sap/ui/core/mvc/Controller"], 
    
    function (Controller) {
    
        "use strict";

        return Controller.extend("app.controller.App",
        {
            //from object event get the object
            onGoPress: function(oEvent){

                var oview = this.getView();
                //onject event -> get specific view instance
                var oselect = oview.byId("roleSelect");

                if (!oselect) {
                    console.log("Role Select option Not Found");
                }

                //read from the XML and find by key and fetch the value
                var oSelectedKey = oselect.getSelectedKey();

                //call the navigationVariable function
                if(window.navigationVariable){
                    window.navigationVariable(oSelectedKey);
                }
                // window.navigationVariable(oSelectedKey);
                else{
                    console.log("Navigation Variable Not Found");
                }
            }



            
        });
})