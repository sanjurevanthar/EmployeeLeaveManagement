sap.ui.define([], function () {

"use strict";

const BASE_URL = "http://localhost:8080/odata/v4/employeeleaveservice";
const ACTION_URL = `${BASE_URL}/rejectLeave`; 
//const LEAVE_URL = `${BASE_URL}/LeaveRequests`;


//Function for Formating the LeaveId Key:
function formatLeaveId(leaveId){
    return `LeaveID=${leaveId}`;
}


//Function for Parse Action Response:
async function parseActionResponse(res){
   
    try{
        const json = await res.json();
        if(typeof json === "boolean"){
            return json;
        }
        if (json && typeof json === "object") {
            if("value" in json){
                return json.value;
            }
            for(const key in json){
                if(typeof json[key] === "boolean"){
                    return json[key];
                }
                return json[key];
            }
        }
        return json;
    }
    catch(err){
        return null;
    }
}


//Function to Fetch or Throw for URL:
async function fetchOrthrow(url, option = {}){

    const res = await fetch(url, option);
    if(!res.ok){
        throw new Error(await res.text());
    }
    return res;
}


//Manin Function for Approval Request Service:

async function cancelRequestService(payload){
    
    if(!payload || !payload.LeaveID ){
        throw new Error("Missing LeaveID");
    }

    try{

        //Action Call: cancel Request
        const postRes = await fetchOrthrow(ACTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const cancelReq = await parseActionResponse(postRes);
        
        // //Patch Call: LeaveRequests
        // const patchurl = `${LEAVE_URL}(${formatLeaveId(payload.LeaveID)})`;
        // const patchBody = {
        //     Status: "Rejected",
        //     Comments: "" || payload.Comments
        // };
        // await fetchOrthrow(patchurl, {
        //     method: "PATCH",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify(patchBody)
        // });


        return {cancelReq: cancelReq== undefined ? null : cancelReq};

    }
    catch(err){
        throw err;
    }
    
}

return {
    cancelRequestService
};

    
});