export interface AIChatQueryRequestDTO {
  projectId: string;
  message: string;
  userContext?: {
    name: string;
    company: string;
    role: string;
  };
}

export interface AIChatResponseDTO {
  id: string;
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: string;
  breakdown?: {
    title: string;
    total: number;
    items: Array<{
      label: string;
      amount: number;
      source: string;
      actor: string;
    }>;
  };
  provenanceLineage?: Array<{
    document: string;
    enteredBy: string;
    approvedBy: string;
    status: string;
  }>;
}
