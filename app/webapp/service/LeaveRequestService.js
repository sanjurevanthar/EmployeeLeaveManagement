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


    //     //GET call -> Filtering By ManagerId and Status as pending:
    //     getLeavesByManager: function (managerId) {
            
    //         if(!managerId){
    //             return Promise.resolve([]);
    //         }

    //         const safeManagerId = String(managerId).trim().replace(/'/g, "''");

    //         //Build the odata filter
    //         const filterExprcn = `Manager_EmployeeID eq '${safeManagerId}'  and Status eq 'Pending'` ;  
            
    //         const filter = "$filter=" + encodeURIComponent(filterExprcn);

    //         //construct the complete URL
    //         const url = BASE_URL + "?" + filter + "&$orderby=FromDate desc";

    //         return fetch(url, {
    //             method: "GET",
    //             headers: {
    //                 "Content-Type": "application/json"
    //             }
    //         })
    //         .then(response => {
    //             if (!response.ok) {
    //                 throw new Error("Server error: " + response.status);
    //             }
    //             try {
    //                 return response.json(); 
    //             } catch (e) {
    //                 return {}; 
    //             }
    //         })
    //         .catch(err => {
    //             throw err;
    //         });
    //     }


    // }

getLeavesByManager: function (managerId) {
    if (!managerId) return Promise.resolve({ value: [] });

    // Build combined OData filter
    const filterExpr = `Manager_EmployeeID eq '${managerId}' and Status eq 'Pending'`;

   //const filterExpr = `Manager_EmployeeID eq '${safeManagerId}' and Status eq 'Pending'`;

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
}



// getLeavesByManager: async function (managerId) {
//   if (!managerId) {
//     return Promise.resolve([]); // caller already handles array vs .value
//   }

//   // sanitize & escape single quotes per OData rules (double them)
//   const safeManagerId = String(managerId).trim().replace(/'/g, "''");

//   // Build the OData filter (no extra spaces inside quotes)
//   const filterExpr = `Manager_EmployeeID eq '${safeManagerId}' and Status eq 'Pending'`;
//   const filter = "$filter=" + encodeURIComponent(filterExpr);

//   // construct the complete URL
//   const url = `${BASE_URL}?${filter}&$orderby=FromDate desc`;

//   try {
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "Accept": "application/json"
//         // do not set Content-Type for GET
//       }
//       // optionally: , signal: abortController.signal to allow timeouts
//     });

//     if (!response.ok) {
//       throw new Error("Server error: " + response.status);
//     }

//     // parse JSON safely
//     const text = await response.text();
//     if (!text) return {}; // empty body -> return empty object
//     try {
//       return JSON.parse(text);
//     } catch (parseErr) {
//       // malformed JSON
//       console.error("Failed to parse JSON from", url, parseErr);
//       return {}; // or throw parseErr if you want caller to handle
//     }

//   } catch (err) {
//     console.error("getLeavesByManager failed for", managerId, err);
//     throw err;
//   }
// }


}






});