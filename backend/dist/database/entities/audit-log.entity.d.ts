export declare enum AuditAction {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    LOGIN = "login",
    LOGOUT = "logout",
    EXPORT = "export",
    IMPORT = "import"
}
export declare class AuditLog {
    id: string;
    userId: string;
    userEmail: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    oldValues: any;
    newValues: any;
    ipAddress: string;
    userAgent: string;
    description: string;
    createdAt: Date;
}
