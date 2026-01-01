-- =================================================================================
--                    HRM MANAGEMENT SYSTEM - DATABASE DDL
-- =================================================================================
-- Tổng quan: Hệ thống quản lý nhân sự (HRM) với các module chính
-- - Quản lý nhân sự (Users, Employees, Departments, Positions)
-- - Chấm công và nghỉ phép (Attendance, Leave Requests, Overtime)
-- - Tính lương (Payroll, Payslips)
-- - Hợp đồng lao động (Contracts, Contract Types)
-- - Báo cáo và audit (Audit Logs)
-- =================================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================================
--                                1. ROLES TABLE
-- =================================================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE CHECK (name IN ('admin', 'hr', 'manager', 'employee')),
    description TEXT,
    permissions TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
--                                2. USERS TABLE
-- =================================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    "lastLoginAt" TIMESTAMP,
    "refreshToken" VARCHAR(500),
    "refreshTokenExpiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "roleId" UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =================================================================================
--                                3. DEPARTMENTS TABLE
-- =================================================================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    "managerId" UUID,
    "parentId" UUID REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
--                                4. POSITIONS TABLE
-- =================================================================================
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    "minSalary" DECIMAL(10,2),
    "maxSalary" DECIMAL(10,2),
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "departmentId" UUID REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =================================================================================
--                                5. WORK_LOCATIONS TABLE
-- =================================================================================
CREATE TABLE work_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    address VARCHAR(255),
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    radius INTEGER DEFAULT 100,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
--                                6. SHIFTS TABLE
-- =================================================================================
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    "startTime" VARCHAR(5) NOT NULL,
    "endTime" VARCHAR(5) NOT NULL,
    "lunchBreakStart" VARCHAR(5),
    "lunchBreakEnd" VARCHAR(5),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
--                                7. EMPLOYEES TABLE
-- =================================================================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeCode" VARCHAR(20) NOT NULL UNIQUE,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address VARCHAR(255),
    "permanentAddress" VARCHAR(255),
    "currentAddress" VARCHAR(255),
    "dateOfBirth" DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    "nationalId" VARCHAR(50),
    "citizenId" VARCHAR(50),
    "taxId" VARCHAR(50),
    "bankAccount" VARCHAR(50),
    "bankName" VARCHAR(100),
    ethnicity VARCHAR(50),
    religion VARCHAR(50),
    "basicSalary" DECIMAL(10,2),
    allowance DECIMAL(10,2),
    "hireDate" DATE,
    "terminationDate" DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    avatar VARCHAR(255),
    "emergencyContact" VARCHAR(100),
    "emergencyPhone" VARCHAR(20),
    "annualLeaveBalance" DECIMAL(5,2) DEFAULT 12.00,
    "sickLeaveBalance" DECIMAL(5,2) DEFAULT 6.00,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "departmentId" UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "positionId" UUID NOT NULL REFERENCES positions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "workLocationId" UUID REFERENCES work_locations(id) ON DELETE SET NULL ON UPDATE CASCADE,
    "shiftId" UUID REFERENCES shifts(id) ON DELETE SET NULL ON UPDATE CASCADE,
    "userId" UUID REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =================================================================================
--                                8. ATTENDANCES TABLE
-- =================================================================================
CREATE TABLE attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    date DATE NOT NULL,
    "checkIn" TIMESTAMP,
    "checkOut" TIMESTAMP,
    "breakStart" TIMESTAMP,
    "breakEnd" TIMESTAMP,
    "workingHours" DECIMAL(5,2) DEFAULT 0.00,
    "overtimeHours" DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'early_leave')),
    notes VARCHAR(500),
    "approvedBy" VARCHAR(100),
    "approvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UQ_attendance_employee_date" UNIQUE ("employeeId", date)
);

-- =================================================================================
--                                9. LEAVE_REQUESTS TABLE
-- =================================================================================
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid')),
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    days DECIMAL(5,2) NOT NULL,
    reason VARCHAR(500),
    notes VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    "approvedBy" VARCHAR(100),
    "approvedAt" TIMESTAMP,
    "rejectionReason" VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
--                                10. OVERTIME_REQUESTS TABLE
-- =================================================================================
CREATE TABLE overtime_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    date DATE NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    hours DECIMAL(5,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    "approverId" VARCHAR(100),
    "approvedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
--                                11. CONTRACT_TYPES TABLE
-- =================================================================================
CREATE TABLE contract_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    "standardTermMonths" INTEGER,
    "probationMonths" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
--                                12. CONTRACTS TABLE
-- =================================================================================
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "contractCode" VARCHAR(50) NOT NULL UNIQUE,
    "employeeId" UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "typeId" UUID REFERENCES contract_types(id) ON DELETE SET NULL ON UPDATE CASCADE,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
    "baseSalary" DECIMAL(12,2) NOT NULL,
    allowance DECIMAL(12,2) DEFAULT 0.00,
    bonus DECIMAL(12,2) DEFAULT 0.00,
    benefits JSONB,
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
--                                13. CONTRACT_TEMPLATES TABLE
-- =================================================================================
CREATE TABLE contract_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    "typeId" UUID REFERENCES contract_types(id) ON DELETE SET NULL ON UPDATE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
--                                14. PAYROLLS TABLE
-- =================================================================================
CREATE TABLE payrolls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    period VARCHAR(7) NOT NULL CHECK (period ~ '^[0-9]{4}-[0-9]{2}$'),
    "basicSalary" DECIMAL(10,2) NOT NULL,
    allowance DECIMAL(10,2) DEFAULT 0.00,
    "overtimePay" DECIMAL(10,2) DEFAULT 0.00,
    bonus DECIMAL(10,2) DEFAULT 0.00,
    "grossSalary" DECIMAL(10,2) DEFAULT 0.00,
    tax DECIMAL(10,2) DEFAULT 0.00,
    "socialInsurance" DECIMAL(10,2) DEFAULT 0.00,
    "healthInsurance" DECIMAL(10,2) DEFAULT 0.00,
    "unemploymentInsurance" DECIMAL(10,2) DEFAULT 0.00,
    "totalDeductions" DECIMAL(10,2) DEFAULT 0.00,
    "netSalary" DECIMAL(10,2) NOT NULL,
    "workingDays" DECIMAL(5,2) NOT NULL,
    "actualWorkingDays" DECIMAL(5,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'approved', 'paid')),
    notes VARCHAR(500),
    "approvedBy" VARCHAR(100),
    "approvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UQ_payroll_employee_period" UNIQUE ("employeeId", period)
);

-- =================================================================================
--                                15. PAYSLIPS TABLE
-- =================================================================================
CREATE TABLE payslips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    period VARCHAR(7) NOT NULL CHECK (period ~ '^[0-9]{4}-[0-9]{2}$'),
    "payrollId" UUID REFERENCES payrolls(id) ON DELETE SET NULL ON UPDATE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'issued' CHECK (status IN ('issued', 'paid', 'cancelled')),
    "issuedBy" VARCHAR(100),
    "paidAt" TIMESTAMP,
    notes VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UQ_payslip_employee_period" UNIQUE ("employeeId", period)
);

-- =================================================================================
--                                16. RESIGNATION_REQUESTS TABLE
-- =================================================================================
CREATE TABLE resignation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "employeeId" UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "requestedById" UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "effectiveDate" DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
    "approvedById" UUID REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    "approvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
--                                17. AUDIT_LOGS TABLE
-- =================================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" VARCHAR(100),
    "userEmail" VARCHAR(255),
    action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'login', 'logout', 'export', 'import')),
    "entityType" VARCHAR(100),
    "entityId" VARCHAR(100),
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    description VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
--                                INDEXES
-- =================================================================================

-- Audit logs indexes
CREATE INDEX "IDX_audit_logs_entity" ON audit_logs ("entityType", "entityId");
CREATE INDEX "IDX_audit_logs_user" ON audit_logs ("userId");
CREATE INDEX "IDX_audit_logs_created_at" ON audit_logs ("createdAt");

-- Performance indexes
CREATE INDEX "IDX_employees_department" ON employees ("departmentId");
CREATE INDEX "IDX_employees_position" ON employees ("positionId");
CREATE INDEX "IDX_employees_status" ON employees (status);
CREATE INDEX "IDX_users_role" ON users ("roleId");
CREATE INDEX "IDX_users_email" ON users (email);
CREATE INDEX "IDX_attendances_date" ON attendances (date);
CREATE INDEX "IDX_leave_requests_status" ON leave_requests (status);
CREATE INDEX "IDX_overtime_requests_status" ON overtime_requests (status);
CREATE INDEX "IDX_contracts_status" ON contracts (status);
CREATE INDEX "IDX_payrolls_period" ON payrolls (period);
CREATE INDEX "IDX_payslips_period" ON payslips (period);

-- =================================================================================
--                                TRIGGERS FOR UPDATED_AT
-- =================================================================================

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for all tables with updatedAt column
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_locations_updated_at BEFORE UPDATE ON work_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendances_updated_at BEFORE UPDATE ON attendances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_overtime_requests_updated_at BEFORE UPDATE ON overtime_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_types_updated_at BEFORE UPDATE ON contract_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_templates_updated_at BEFORE UPDATE ON contract_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payrolls_updated_at BEFORE UPDATE ON payrolls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payslips_updated_at BEFORE UPDATE ON payslips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resignation_requests_updated_at BEFORE UPDATE ON resignation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================================
--                                COMMENTS
-- =================================================================================

-- Table comments
COMMENT ON TABLE roles IS 'Bảng vai trò người dùng trong hệ thống';
COMMENT ON TABLE users IS 'Bảng người dùng hệ thống';
COMMENT ON TABLE departments IS 'Bảng phòng ban';
COMMENT ON TABLE positions IS 'Bảng vị trí công việc';
COMMENT ON TABLE work_locations IS 'Bảng địa điểm làm việc';
COMMENT ON TABLE shifts IS 'Bảng ca làm việc';
COMMENT ON TABLE employees IS 'Bảng nhân viên';
COMMENT ON TABLE attendances IS 'Bảng chấm công';
COMMENT ON TABLE leave_requests IS 'Bảng đăng ký nghỉ phép';
COMMENT ON TABLE overtime_requests IS 'Bảng đăng ký làm thêm giờ';
COMMENT ON TABLE contract_types IS 'Bảng loại hợp đồng';
COMMENT ON TABLE contracts IS 'Bảng hợp đồng lao động';
COMMENT ON TABLE contract_templates IS 'Bảng mẫu hợp đồng';
COMMENT ON TABLE payrolls IS 'Bảng tính lương';
COMMENT ON TABLE payslips IS 'Bảng phiếu lương';
COMMENT ON TABLE resignation_requests IS 'Bảng đăng ký nghỉ việc';
COMMENT ON TABLE audit_logs IS 'Bảng nhật ký audit';

-- =================================================================================
--                                CONSTRAINTS SUMMARY
-- =================================================================================

/*
UNIQUE CONSTRAINTS:
- roles.name
- users.email
- employees.employeeCode
- employees.email
- departments.code
- positions.code
- work_locations.name
- shifts.name
- contracts.contractCode
- contract_types.name
- attendances(employeeId, date)
- payrolls(employeeId, period)
- payslips(employeeId, period)

CHECK CONSTRAINTS:
- roles.name IN ('admin', 'hr', 'manager', 'employee')
- users.status IN ('active', 'inactive', 'suspended')
- employees.gender IN ('male', 'female', 'other')
- employees.status IN ('active', 'inactive', 'terminated')
- attendances.status IN ('present', 'absent', 'late', 'half_day', 'early_leave')
- leave_requests.type IN ('annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid')
- leave_requests.status IN ('pending', 'approved', 'rejected', 'cancelled')
- overtime_requests.status IN ('pending', 'approved', 'rejected')
- contracts.status IN ('active', 'expired', 'terminated', 'pending')
- payrolls.status IN ('draft', 'generated', 'approved', 'paid')
- payslips.status IN ('issued', 'paid', 'cancelled')
- resignation_requests.status IN ('pending', 'approved', 'rejected', 'processed')
- audit_logs.action IN ('create', 'update', 'delete', 'login', 'logout', 'export', 'import')
- payrolls.period ~ '^[0-9]{4}-[0-9]{2}$'
- payslips.period ~ '^[0-9]{4}-[0-9]{2}$'

FOREIGN KEY CONSTRAINTS:
- users.roleId -> roles.id
- employees.departmentId -> departments.id
- employees.positionId -> positions.id
- employees.workLocationId -> work_locations.id
- employees.shiftId -> shifts.id
- employees.userId -> users.id
- attendances.employeeId -> employees.id
- leave_requests.employeeId -> employees.id
- overtime_requests.employeeId -> employees.id
- contracts.employeeId -> employees.id
- contracts.typeId -> contract_types.id
- contract_templates.typeId -> contract_types.id
- payrolls.employeeId -> employees.id
- payslips.employeeId -> employees.id
- payslips.payrollId -> payrolls.id
- resignation_requests.employeeId -> employees.id
- resignation_requests.requestedById -> users.id
- resignation_requests.approvedById -> users.id
- departments.parentId -> departments.id (self-reference)
- positions.departmentId -> departments.id
*/

-- =================================================================================
--                                END OF DDL SCRIPT
-- =================================================================================
-- Export Date: 2025-01-25
-- System: HRM Management System
-- Version: 1.0.0
-- Database: PostgreSQL 15+
-- =================================================================================

