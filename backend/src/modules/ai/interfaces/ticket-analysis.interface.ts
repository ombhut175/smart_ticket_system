export interface TicketAnalysis {
  summary: string;
  priority: 'low' | 'medium' | 'high';
  helpfulNotes: string;
  relatedSkills: string[];
} 