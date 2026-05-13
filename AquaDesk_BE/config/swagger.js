const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Qsystech Service Management System API',
      version: '1.0.0',
      description: 'API documentation for Qsystech Service Management System',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin' },
            password: { type: 'string', example: 'admin123' },
            rememberMe: { type: 'boolean', example: false },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                userId: { type: 'integer' },
                username: { type: 'string' },
                fullName: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                companyId: { type: 'integer' },
              },
            },
            accessRights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  FormName: { type: 'string' },
                  CanView: { type: 'boolean' },
                  CanAdd: { type: 'boolean' },
                  CanEdit: { type: 'boolean' },
                  CanDelete: { type: 'boolean' },
                  CanSearch: { type: 'boolean' },
                  CanPrint: { type: 'boolean' },
                },
              },
            },
          },
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 6 },
          },
        },
        Company: {
          type: 'object',
          properties: {
            CompanyID: { type: 'integer' },
            CompanyCode: { type: 'string' },
            CompanyName: { type: 'string' },
            Address: { type: 'string' },
            City: { type: 'string' },
            State: { type: 'string' },
            Country: { type: 'string' },
            Phone: { type: 'string' },
            Email: { type: 'string' },
            Website: { type: 'string' },
            GSTIN: { type: 'string' },
            Status: { type: 'boolean' },
            CreatedAt: { type: 'string', format: 'date-time' },
            UpdatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CompanyInput: {
          type: 'object',
          required: ['companyCode', 'companyName'],
          properties: {
            companyCode: { type: 'string' },
            companyName: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            country: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            website: { type: 'string' },
            gstin: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            UserID: { type: 'integer' },
            Username: { type: 'string' },
            FullName: { type: 'string' },
            Email: { type: 'string' },
            Phone: { type: 'string' },
            Role: { type: 'string' },
            Status: { type: 'boolean' },
            LastLogin: { type: 'string', format: 'date-time' },
            CompanyID: { type: 'integer' },
            CompanyName: { type: 'string' },
          },
        },
        UserInput: {
          type: 'object',
          required: ['username', 'password', 'fullName'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string', minLength: 6 },
            fullName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', example: 'User' },
            companyId: { type: 'integer' },
            accessRights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  formName: { type: 'string' },
                  canView: { type: 'boolean' },
                  canAdd: { type: 'boolean' },
                  canEdit: { type: 'boolean' },
                  canDelete: { type: 'boolean' },
                  canSearch: { type: 'boolean' },
                  canPrint: { type: 'boolean' },
                },
              },
            },
          },
        },
        UserUpdate: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string' },
            companyId: { type: 'integer' },
            status: { type: 'boolean' },
            accessRights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  formName: { type: 'string' },
                  canView: { type: 'boolean' },
                  canAdd: { type: 'boolean' },
                  canEdit: { type: 'boolean' },
                  canDelete: { type: 'boolean' },
                  canSearch: { type: 'boolean' },
                  canPrint: { type: 'boolean' },
                },
              },
            },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            CustomerID: { type: 'integer' },
            CustomerCode: { type: 'string' },
            CustomerName: { type: 'string' },
            Flat: { type: 'string' },
            Block: { type: 'string' },
            Road: { type: 'string' },
            City: { type: 'string' },
            State: { type: 'string' },
            Country: { type: 'string' },
            Mobile: { type: 'string' },
            Email: { type: 'string' },
            Telephone: { type: 'string' },
            Fax: { type: 'string' },
            AreaCodeID: { type: 'integer' },
            CompanyID: { type: 'integer' },
            Status: { type: 'boolean' },
            Description: { type: 'string' },
          },
        },
        CustomerInput: {
          type: 'object',
          required: ['customerCode', 'customerName'],
          properties: {
            customerCode: { type: 'string' },
            customerName: { type: 'string' },
            flat: { type: 'string' },
            block: { type: 'string' },
            road: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            country: { type: 'string' },
            mobile: { type: 'string' },
            email: { type: 'string' },
            telephone: { type: 'string' },
            fax: { type: 'string' },
            areaCodeId: { type: 'integer' },
            description: { type: 'string' },
            status: { type: 'boolean' },
          },
        },
        CustomerSystemInput: {
          type: 'object',
          required: ['systemId'],
          properties: {
            systemId: { type: 'integer' },
            systemType: { type: 'string' },
            serialNumber: { type: 'string' },
            installDate: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
          },
        },
        CustomerContractInput: {
          type: 'object',
          required: ['categoryId', 'startDate'],
          properties: {
            customerSystemId: { type: 'integer' },
            categoryId: { type: 'integer' },
            contractPeriod: { type: 'integer' },
            frequency: { type: 'integer' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
          },
        },
        Contract: {
          type: 'object',
          properties: {
            ContractID: { type: 'integer' },
            CustomerID: { type: 'integer' },
            CustomerSystemID: { type: 'integer' },
            CategoryID: { type: 'integer' },
            ContractPeriod: { type: 'integer' },
            Frequency: { type: 'integer' },
            StartDate: { type: 'string', format: 'date-time' },
            EndDate: { type: 'string', format: 'date-time' },
            Status: { type: 'boolean' },
            Notes: { type: 'string' },
          },
        },
        ContractInput: {
          type: 'object',
          required: ['customerId', 'categoryId', 'startDate'],
          properties: {
            customerId: { type: 'integer' },
            customerSystemId: { type: 'integer' },
            categoryId: { type: 'integer' },
            contractPeriod: { type: 'integer' },
            frequency: { type: 'integer' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
          },
        },
        ContractUpdate: {
          type: 'object',
          properties: {
            customerSystemId: { type: 'integer' },
            categoryId: { type: 'integer' },
            contractPeriod: { type: 'integer' },
            frequency: { type: 'integer' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
            status: { type: 'boolean' },
          },
        },
        RenewContractInput: {
          type: 'object',
          required: ['newEndDate'],
          properties: {
            newEndDate: { type: 'string', format: 'date-time' },
            newContractPeriod: { type: 'integer' },
            newFrequency: { type: 'integer' },
            notes: { type: 'string' },
          },
        },
        SalesMasterInput: {
          type: 'object',
          required: ['customerId', 'categoryId'],
          properties: {
            customerId: { type: 'integer' },
            categoryId: { type: 'integer' },
            contractTypeId: { type: 'integer' },
            serviceIntervalId: { type: 'integer' },
            contractIntervalId: { type: 'integer' },
            contractStartDate: { type: 'string', format: 'date-time' },
            planType: { type: 'string', enum: ['Plan', 'Complaint'], default: 'Plan' },
            description: { type: 'string' },
            notes: { type: 'string' },
            systems: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  systemId: { type: 'integer' },
                  quantity: { type: 'integer', default: 1 },
                  cost: { type: 'number', default: 0 },
                },
              },
            },
            services: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  serviceId: { type: 'integer' },
                  quantity: { type: 'integer', default: 1 },
                  cost: { type: 'number', default: 0 },
                  serviceTime: { type: 'integer', default: 0 },
                },
              },
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  itemId: { type: 'integer' },
                  quantity: { type: 'integer', default: 1 },
                  cost: { type: 'number', default: 0 },
                },
              },
            },
          },
        },
        ConfirmScheduleInput: {
          type: 'object',
          properties: {
            engineerId: { type: 'integer' },
            serviceTime: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        RescheduleInput: {
          type: 'object',
          required: ['scheduleDate'],
          properties: {
            scheduleDate: { type: 'string', format: 'date-time' },
            serviceInterval: { type: 'integer' },
            notes: { type: 'string' },
          },
        },
        MarkCompletedInput: {
          type: 'object',
          required: ['scheduleIds'],
          properties: {
            scheduleIds: {
              type: 'array',
              items: { type: 'integer' },
            },
          },
        },
        ManualScheduleInput: {
          type: 'object',
          required: ['salesNo', 'scheduleDate'],
          properties: {
            salesNo: { type: 'integer' },
            scheduleDate: { type: 'string', format: 'date-time' },
            serviceTime: { type: 'string' },
          },
        },
        EngineerInput: {
          type: 'object',
          required: ['engineerName'],
          properties: {
            engineerName: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            teamId: { type: 'integer' },
          },
        },
        EngineerUpdate: {
          type: 'object',
          properties: {
            engineerName: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            teamId: { type: 'integer' },
            status: { type: 'boolean' },
          },
        },
        TeamInput: {
          type: 'object',
          required: ['teamName'],
          properties: {
            teamName: { type: 'string' },
            description: { type: 'string' },
          },
        },
        TeamUpdate: {
          type: 'object',
          properties: {
            teamName: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'boolean' },
          },
        },
        SystemInput: {
          type: 'object',
          required: ['systemCode', 'systemName'],
          properties: {
            systemCode: { type: 'string' },
            systemName: { type: 'string' },
            description: { type: 'string' },
          },
        },
        SystemUpdate: {
          type: 'object',
          properties: {
            systemCode: { type: 'string' },
            systemName: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'boolean' },
          },
        },
        ServiceInput: {
          type: 'object',
          required: ['serviceCode', 'serviceName'],
          properties: {
            serviceCode: { type: 'string' },
            serviceName: { type: 'string' },
            description: { type: 'string' },
          },
        },
        ServiceUpdate: {
          type: 'object',
          properties: {
            serviceCode: { type: 'string' },
            serviceName: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'boolean' },
          },
        },
        ItemInput: {
          type: 'object',
          required: ['itemCode', 'itemName'],
          properties: {
            itemCode: { type: 'string' },
            itemName: { type: 'string' },
            description: { type: 'string' },
            unit: { type: 'string' },
          },
        },
        ItemUpdate: {
          type: 'object',
          properties: {
            itemCode: { type: 'string' },
            itemName: { type: 'string' },
            description: { type: 'string' },
            unit: { type: 'string' },
            status: { type: 'boolean' },
          },
        },
        ItemStockUpdate: {
          type: 'object',
          required: ['itemId'],
          properties: {
            itemId: { type: 'integer' },
            quantity: { type: 'number', default: 0 },
            reorderLevel: { type: 'number', default: 0 },
          },
        },
        AreaCodeInput: {
          type: 'object',
          required: ['areaCode'],
          properties: {
            areaCode: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'integer', default: 0 },
          },
        },
        AreaCodeUpdate: {
          type: 'object',
          properties: {
            areaCode: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'integer' },
            status: { type: 'boolean' },
          },
        },
        ContractCategoryInput: {
          type: 'object',
          required: ['categoryCode', 'categoryName'],
          properties: {
            categoryCode: { type: 'string' },
            categoryName: { type: 'string' },
            description: { type: 'string' },
          },
        },
        ContractCategoryUpdate: {
          type: 'object',
          properties: {
            categoryCode: { type: 'string' },
            categoryName: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'boolean' },
          },
        },
        ContractIntervalInput: {
          type: 'object',
          required: ['intervalDays', 'intervalName'],
          properties: {
            intervalDays: { type: 'integer' },
            intervalName: { type: 'string' },
            description: { type: 'string' },
          },
        },
        ContractIntervalUpdate: {
          type: 'object',
          properties: {
            intervalDays: { type: 'integer' },
            intervalName: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'boolean' },
          },
        },
        ServiceIntervalInput: {
          type: 'object',
          required: ['intervalDays', 'intervalName'],
          properties: {
            intervalDays: { type: 'integer' },
            intervalName: { type: 'string' },
            description: { type: 'string' },
          },
        },
        ServiceIntervalUpdate: {
          type: 'object',
          properties: {
            intervalDays: { type: 'integer' },
            intervalName: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'boolean' },
          },
        },
        ServiceCostUpdate: {
          type: 'object',
          required: ['categoryId', 'serviceId'],
          properties: {
            categoryId: { type: 'integer' },
            serviceId: { type: 'integer' },
            cost: { type: 'number', default: 0 },
            serviceTime: { type: 'integer', default: 0 },
          },
        },
        SystemCostUpdate: {
          type: 'object',
          required: ['categoryId', 'systemId'],
          properties: {
            categoryId: { type: 'integer' },
            systemId: { type: 'integer' },
            cost: { type: 'number', default: 0 },
          },
        },
        ItemCostUpdate: {
          type: 'object',
          required: ['categoryId', 'itemId'],
          properties: {
            categoryId: { type: 'integer' },
            itemId: { type: 'integer' },
            cost: { type: 'number', default: 0 },
          },
        },
        ResetPasswordInput: {
          type: 'object',
          required: ['newPassword'],
          properties: {
            newPassword: { type: 'string', minLength: 6 },
          },
        },
        SalesMasterPlan: {
          type: 'object',
          properties: {
            PlanID: { type: 'integer' },
            CustomerID: { type: 'integer' },
            CustomerCode: { type: 'string' },
            CustomerName: { type: 'string' },
            PlanType: { type: 'string', enum: ['Plan', 'Complaint'] },
            Frequency: { type: 'string', enum: ['Weekly', 'Monthly', 'Quarterly', 'Yearly'] },
            Notes: { type: 'string' },
            CreatedBy: { type: 'integer' },
            UpdatedBy: { type: 'integer' },
            Status: { type: 'boolean' },
            Mobile: { type: 'string' },
            City: { type: 'string' },
            AreaCode: { type: 'string' },
            CreatedAt: { type: 'string', format: 'date-time' },
            UpdatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SalesMasterPlanInput: {
          type: 'object',
          required: ['customerInfo', 'frequency'],
          properties: {
            customerInfo: {
              type: 'object',
              required: ['customerId'],
              properties: {
                customerId: { type: 'integer' },
              },
            },
            planType: { type: 'string', enum: ['Plan', 'Complaint'], default: 'Plan' },
            frequency: { type: 'string', enum: ['Weekly', 'Monthly', 'Quarterly', 'Yearly'] },
            notes: { type: 'string' },
            systems: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  systemId: { type: 'integer' },
                  quantity: { type: 'integer', default: 1 },
                },
              },
            },
            services: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  serviceId: { type: 'integer' },
                  quantity: { type: 'integer', default: 1 },
                },
              },
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  itemId: { type: 'integer' },
                  quantity: { type: 'integer', default: 1 },
                },
              },
            },
          },
        },
      },
    },
    security: [],
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
