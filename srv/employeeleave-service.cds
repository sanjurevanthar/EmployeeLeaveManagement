
using { employee.leave as db } from '../db/schema';

service employeeleaveservice @odata {

    //GET /Employees — Read-only, used for employee lookup and manager info.
    entity Employees as projection on db.Employees;

    //GET /LeaveTypes — Read-only, used to populate leave type dropdowns.
    entity LeaveTypes as projection on db.LeaveTypes;

    //GET /LeaveRequests — Returns leave requests: / POST: Create a new leave request (employee). / PATCH:  Update existing leave request (limited rules: only pending requests, or manager updates
    entity LeaveRequests as projection on db.LeaveRequests;

    //Actions:
    action approvalLeave(LeaveID:UUID, Comments: String(100)) returns Boolean;

    action rejectLeave(LeaveID: UUID, Comments: String(100)) returns Boolean;

    action cancelLeave(LeaveID: UUID) returns Boolean;

}
