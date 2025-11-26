namespace employee.leave;

using { managed } from `@sap/cds/common`;

entity Employees : managed{
    key EmployeeID: String(10);
    Name: String(100);
    Email: String(100);
    Role: String(10);

    Manager: Association to Employees; // self associtions
}

entity LeaveRequests : managed{

    key LeaveID: UUID;
    EmployeeID: String(10);
    LeaveTypeID: Association to LeaveTypes;
    FromDate: Date;
    ToDate : Date;
    Status: String(10);
    Reason: String(100);
    Manager:  Association to Employees;
    Comments: String(100)

}

entity LeaveTypes : managed{

    key LeaveTypeID : String(10);
    Code : String(10);
    Description : String(100);
    MaxDays : Integer;
    
}


