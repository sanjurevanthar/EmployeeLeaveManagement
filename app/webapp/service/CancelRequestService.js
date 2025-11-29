sap.ui.define([], function () {

"use strict";

const BASE_URL = "http://localhost:8080/odata/v4/employeeleaveservice";


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
    if (!payload || !payload.LeaveID) {
        throw new Error("Missing LeaveID");
    }

    const ACTION_URL = `${BASE_URL}/cancelLeave`;

    try{
        const postRes = await fetchOrthrow(ACTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        });

        // Try to parse JSON safely; if empty body return true
        let parsed = null;
        try {
            const text = await postRes.text();
            parsed = text ? JSON.parse(text) : null;
        } catch (e) {
            // not JSON or empty body
            parsed = null;
        }

        console.log("cancelRequestService response parsed:", parsed);
        return { cancelReq: parsed === undefined ? null : parsed };

    } catch(err){
        console.error("cancelRequestService error:", err);
        throw err;
    }
}

return {
    cancelRequestService
};


    
});