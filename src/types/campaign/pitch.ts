export type PitchFormData = {
  url: string;
  description: string;
  features: Array<{
    id: number;
    problem: string;
    solution: string;
  }>;
}
