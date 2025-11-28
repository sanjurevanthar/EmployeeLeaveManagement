sap.ui.define([ "sap/ui/core/mvc/XMLView"], 

    function(XMLView){
   
	"use strict";

    // XMLView.create({
    //     viewName:"app.view.App",  
    // }).then(function(oView){
    //     oView.placeAt("content");
    // });

    //Cretate a function -> i/p : viewName and o/p: Creating XML view for thet

    let oCurrentView = null;

    function createView(viewnameVal){

        return XMLView.create({
            viewName: viewnameVal,
        }).then(function(oView){
        if(oCurrentView){
            oCurrentView.destroy();
        }
        oCurrentView = oView;
        oView.placeAt("content");
        });
        }


    //GlobalVariable 
     window.navigationVariable = function(targetVal){
        if(targetVal == "Manager"){
            return createView("app.view.Manager");
        }
        else if(targetVal == "Employee"){
            return createView("app.view.Employee");
        }
        else{
            return createView("app.view.App");
        }
    }

    // window.navigationVariable = function (targetVal) {
    // var sViewName;
    // if (targetVal === "Manager") {
    //     sViewName = "app.view.Manager";
    // } else if (targetVal === "Employee") {
    //     sViewName = "app.view.Employee";
    // } else {
    //     sViewName = "app.view.App";
    // }
    // return window.createView(sViewName);
    // };

    createView("app.view.App");

});