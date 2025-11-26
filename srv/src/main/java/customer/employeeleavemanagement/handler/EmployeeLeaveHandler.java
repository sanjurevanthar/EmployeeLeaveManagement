package customer.employeeleavemanagement.handler;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.sap.cds.ql.Delete;
import com.sap.cds.ql.Update;
import com.sap.cds.ql.cqn.CqnDelete;
import com.sap.cds.ql.cqn.CqnUpdate;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;

import cds.gen.employee.leave.LeaveRequests;
import cds.gen.employee.leave.LeaveRequests_;
import cds.gen.employeeleaveservice.ApprovalLeaveContext;
import cds.gen.employeeleaveservice.CancelLeaveContext;
import cds.gen.employeeleaveservice.Employeeleaveservice_;
import cds.gen.employeeleaveservice.RejectLeaveContext;

@Component
@ServiceName(Employeeleaveservice_.CDS_NAME)
public class EmployeeLeaveHandler implements EventHandler{

    private static final Logger logger = LoggerFactory.getLogger(EmployeeLeaveHandler.class);


    @Autowired
    PersistenceService db;
    
    @On(event = "approvalLeave")
    public void onApproval(ApprovalLeaveContext context) {
        //we build logic for Approval
       try {
        logger.info("Executing Approval Leave");
        String leaveId = context.getLeaveID();
        String comments = context.getComments();
        if (comments == null) comments = "";    // safe default

        CqnUpdate update = Update.entity(LeaveRequests_.class)
                .byId(leaveId)
                .data(LeaveRequests.COMMENTS, comments);

        
        db.run(update);


        update = Update.entity(LeaveRequests_.class)
                .byId(leaveId)
                .data(LeaveRequests.STATUS, "Approved");

        db.run(update);

        logger.info("Successfully Approved leave with LeaveID: {}", leaveId);
        context.setResult(true);
    } catch (Exception e) {
        logger.info("Failed to Approve leave: {}", e.getMessage());
        context.setResult(false);
    }
    }


    @On(event = "rejectLeave")
    public void onrejectLeave(RejectLeaveContext context) {
        //we build logic for Rejection
        try {
        logger.info("Executing Rejecting Leave");

        String leaveId = context.getLeaveID();
        String comments = context.getComments();
        if (comments == null) comments = "";    // safe default

        CqnUpdate update = Update.entity(LeaveRequests_.class)
                .byId(leaveId)
                .data(LeaveRequests.COMMENTS, comments);

        db.run(update);

        update = Update.entity(LeaveRequests_.class)
                .byId(leaveId)
                .data(LeaveRequests.STATUS, "Rejected");

        db.run(update);

        logger.info("Successfully Rejected leave: {}", leaveId);

        context.setResult(true);
    } catch (Exception e) {
        logger.info("Failed to Reject leave: {}", e.getMessage());

        context.setResult(false);
    }
    }


    @On(event = "cancelLeave")
    public void oncancel(CancelLeaveContext context) {
        //we build logic for cancel
       try {
        logger.info("Executing Cancel Leave");

        String leaveId = context.getLeaveID();

        //db.run(Delete.from(LeaveRequests_.class).byId(leaveId));
        CqnDelete delete = Delete.from(LeaveRequests_.class).byId(leaveId);
            db.run(delete);

        logger.info("Successfully Cancelled leave: {}", leaveId);


        context.setResult(true);
    } catch (Exception e) {
        logger.info("Failed to Reject leave {}", e.getMessage());

        context.setResult(false);
    }

    } 


}
