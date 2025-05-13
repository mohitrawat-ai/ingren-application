export type OutreachFormData = {
    messageTone: string;
    selectedCta: string;
    ctaOptions: Array<{
      id: string;
      label: string;
    }>;
    personalizationSources: Array<{
      id: string;
      label: string;
      enabled: boolean;
    }>;
  }