export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_by: string;
  assigned_to?: string;
  summary?: string;
  helpful_notes?: string;
  related_skills?: string[];
  created_at: Date;
  updated_at: Date;
} 