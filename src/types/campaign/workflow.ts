export type WorkflowFormData = {
    enableFollowUp: boolean;
    followUpConfig: {
      waitDays: number;
      emailSubject?: string;
      emailBody?: string;
    };
  }