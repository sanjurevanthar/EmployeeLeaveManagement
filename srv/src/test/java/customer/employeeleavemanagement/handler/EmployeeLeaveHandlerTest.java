package customer.employeeleavemanagement.handler;

import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.sap.cds.ql.cqn.CqnDelete;
import com.sap.cds.ql.cqn.CqnUpdate;
import com.sap.cds.services.persistence.PersistenceService;

import cds.gen.employeeleaveservice.ApprovalLeaveContext;
import cds.gen.employeeleaveservice.CancelLeaveContext;
import cds.gen.employeeleaveservice.RejectLeaveContext;

public class EmployeeLeaveHandlerTest {


    @Mock
    private PersistenceService db;

    @Mock
    private ApprovalLeaveContext approvalLeaveContext;

    @Mock
    private RejectLeaveContext rejectLeaveContext;

    @Mock
    private CancelLeaveContext cancelLeaveContext;

    @InjectMocks
    private EmployeeLeaveHandler employeeLeaveHandler;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }
    
    @Test
    void testOnApproval() {
        when(approvalLeaveContext.getLeaveID()).thenReturn("550e8400-e29b-41d4-a716-446655440000");
        when(approvalLeaveContext.getComments()).thenReturn("Approved");

        employeeLeaveHandler.onApproval(approvalLeaveContext);
    }


    @Test
    void testOnApprovalException() {
        when(approvalLeaveContext.getLeaveID()).thenReturn("null");
        when(approvalLeaveContext.getComments()).thenReturn("Approved");
        
        doThrow(new RuntimeException("DB error")).when(db).run(any(CqnUpdate.class));

        employeeLeaveHandler.onApproval(approvalLeaveContext);
    }
    @Test
    void testOncancel() {

        when(rejectLeaveContext.getLeaveID()).thenReturn("550e8400-e29b-41d4-a716-446655440000");
        when(rejectLeaveContext.getComments()).thenReturn("Rejected");

        employeeLeaveHandler.onrejectLeave(rejectLeaveContext);

    }

        @Test
    void testOnRejectException() {
        when(rejectLeaveContext.getLeaveID()).thenReturn("null");
        when(rejectLeaveContext.getComments()).thenReturn("Rejected");
        
        doThrow(new RuntimeException("DB error")).when(db).run(any(CqnUpdate.class));

        employeeLeaveHandler.onrejectLeave(rejectLeaveContext);
    }

    @Test
    void testOnrejectLeave() {
        when(cancelLeaveContext.getLeaveID()).thenReturn("550e8400-e29b-41d4-a716-446655440000");

        employeeLeaveHandler.oncancel(cancelLeaveContext);

    }

    @Test
    void testOnCancelException() {
        when(cancelLeaveContext.getLeaveID()).thenReturn("null");
        
        // Make db.run() throw exception → triggers catch block
        when(db.run(any(CqnDelete.class)))
            .thenThrow(new RuntimeException("DB error"));

        employeeLeaveHandler.onApproval(approvalLeaveContext);
    }
}
