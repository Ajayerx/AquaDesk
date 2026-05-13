-- Update ContractCategories to have proper status field with MC/NOT-MC/SUSPENDED
-- Run this migration to add the new status column

-- Add new status column
ALTER TABLE ContractCategories ADD ContractStatus NVARCHAR(20) DEFAULT 'MC';

-- Update existing records to use the new status
UPDATE ContractCategories SET ContractStatus = 'MC' WHERE Status = 1;

-- Drop the old boolean status column (optional, can keep for backward compatibility)
-- ALTER TABLE ContractCategories DROP COLUMN Status;
