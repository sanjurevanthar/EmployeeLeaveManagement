sap.ui.define([], function(){

    const BASE_URL = "http://localhost:8080/odata/v4/employeeleaveservice/LeaveRequests";

    return{
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
        }, 


        getLeavesByManager: function (managerId) {
            if (!managerId) return Promise.resolve({ value: [] });

            // Build combined OData filter
            const filterExpr = `Manager_EmployeeID eq '${managerId}' and Status eq 'Pending'`;

            const filter = "$filter=" + encodeURIComponent(filterExpr);

            const url = BASE_URL + "?" + filter + "&$orderby=FromDate desc";

            return fetch(url, {
                method: "GET",
                headers: { "Accept": "application/json" }
            })
            .then(async (res) => {
                if (!res.ok) {
                    const t = await res.text();
                    throw new Error(t || ("HTTP " + res.status));
                }
                return res.json();
            });
        },


        getLeavesByEmployee: function (employeeId) {
            if (!employeeId) return Promise.resolve({ value: [] });

            // Build OData filter for EmployeeID
            const filterExpr = `EmployeeID eq '${employeeId}'`;
            const filter = "$filter=" + encodeURIComponent(filterExpr);

            // Order by FromDate descending (latest first)
            const url = BASE_URL + "?" + filter + "&$orderby=FromDate desc";

            return fetch(url, {
                method: "GET",
                headers: { "Accept": "application/json" }
            })
            .then(async (res) => {
                if (!res.ok) {
                    const t = await res.text();
                    throw new Error(t || ("HTTP " + res.status));
                }
                return res.json();     // returns { value: [...] }
            });
        }


}

});