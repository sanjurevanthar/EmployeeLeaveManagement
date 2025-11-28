sap.ui.define([], function(){

    const BASE_URL = "http://localhost:8080/odata/v4/employeeleaveservice/LeaveRequests";

    return{

        // createLeaveRequest: function(payload){
        //     return fetch(BASE_URL, {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json"
        //         },
        //         body: JSON.stringify(payload)
        //     }).then(response => response.json());
        // }



        //Create a POST Call:
        createLeaveRequest: function (payload) {
            return fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Server error: " + response.status);
                }
                try {
                    return response.json(); 
                } catch (e) {
                    return {}; 
                }
            })
            .catch(err => {
                throw err;
            });
        }

    }





});