-- Admin Audit Logs Table Migration
-- Creates the admin_audit_logs table for tracking admin actions

-- Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_user_id ON admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity_type ON admin_audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- Add RLS policy
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Only authenticated users can insert audit logs (system level)
CREATE POLICY "System can create audit logs" ON admin_audit_logs
    FOR INSERT WITH CHECK (true);

-- Add table comment
COMMENT ON TABLE admin_audit_logs IS 'Audit trail for all admin actions in the system';

-- Add column comments
COMMENT ON COLUMN admin_audit_logs.admin_user_id IS 'ID of the admin user who performed the action';
COMMENT ON COLUMN admin_audit_logs.action IS 'Type of action performed (e.g., user_created, order_updated)';
COMMENT ON COLUMN admin_audit_logs.entity_type IS 'Type of entity affected (e.g., user, order, product)';
COMMENT ON COLUMN admin_audit_logs.entity_id IS 'ID of the specific entity affected';
COMMENT ON COLUMN admin_audit_logs.changes IS 'JSON object containing the changes made';
COMMENT ON COLUMN admin_audit_logs.ip_address IS 'IP address of the admin user';
COMMENT ON COLUMN admin_audit_logs.user_agent IS 'User agent string of the admin user browser';