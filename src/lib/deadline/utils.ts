export interface DeadlineItem {
  id: string;
  title: string;
  deadline: Date;
  type: 'project' | 'milestone' | 'invoice';
  status?: string;
  projectTitle?: string;
  urgent?: boolean;
}

export interface DeadlineUrgency {
  level: 'overdue' | 'urgent' | 'upcoming' | 'normal';
  daysRemaining: number;
  color: string;
  message: string;
}

/**
 * Calculate how many days until a deadline
 */
export function getDaysUntilDeadline(deadline: Date): number {
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Determine deadline urgency level
 */
export function getDeadlineUrgency(deadline: Date): DeadlineUrgency {
  const daysRemaining = getDaysUntilDeadline(deadline);
  
  if (daysRemaining < 0) {
    return {
      level: 'overdue',
      daysRemaining,
      color: '#FF3EA5',
      message: `${Math.abs(daysRemaining)} days overdue`
    };
  } else if (daysRemaining <= 1) {
    return {
      level: 'urgent',
      daysRemaining,
      color: '#FF6B6B',
      message: daysRemaining === 0 ? 'Due today' : 'Due tomorrow'
    };
  } else if (daysRemaining <= 7) {
    return {
      level: 'upcoming',
      daysRemaining,
      color: '#FFC700',
      message: `${daysRemaining} days left`
    };
  } else {
    return {
      level: 'normal',
      daysRemaining,
      color: '#00FFFF',
      message: `${daysRemaining} days left`
    };
  }
}

/**
 * Format deadline date for display
 */
export function formatDeadlineDate(deadline: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  // Check if it's today
  if (deadlineDate.getTime() === today.getTime()) {
    return 'Today';
  }
  
  // Check if it's tomorrow
  if (deadlineDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }
  
  // Check if it's this year
  if (deadline.getFullYear() === now.getFullYear()) {
    return deadline.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
  
  // Different year
  return deadline.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Sort deadlines by urgency (overdue first, then by date)
 */
export function sortDeadlinesByUrgency(deadlines: DeadlineItem[]): DeadlineItem[] {
  return deadlines.sort((a, b) => {
    const urgencyA = getDeadlineUrgency(a.deadline);
    const urgencyB = getDeadlineUrgency(b.deadline);
    
    // Overdue items first
    if (urgencyA.level === 'overdue' && urgencyB.level !== 'overdue') return -1;
    if (urgencyB.level === 'overdue' && urgencyA.level !== 'overdue') return 1;
    
    // Then by deadline date (earliest first)
    return a.deadline.getTime() - b.deadline.getTime();
  });
}

/**
 * Filter deadlines by urgency level
 */
export function filterDeadlinesByUrgency(
  deadlines: DeadlineItem[], 
  level: DeadlineUrgency['level']
): DeadlineItem[] {
  return deadlines.filter(deadline => {
    const urgency = getDeadlineUrgency(deadline.deadline);
    return urgency.level === level;
  });
}

/**
 * Get deadline statistics
 */
export function getDeadlineStats(deadlines: DeadlineItem[]) {
  const overdue = filterDeadlinesByUrgency(deadlines, 'overdue');
  const urgent = filterDeadlinesByUrgency(deadlines, 'urgent');
  const upcoming = filterDeadlinesByUrgency(deadlines, 'upcoming');
  const normal = filterDeadlinesByUrgency(deadlines, 'normal');
  
  return {
    total: deadlines.length,
    overdue: overdue.length,
    urgent: urgent.length,
    upcoming: upcoming.length,
    normal: normal.length,
  };
}

/**
 * Get relative time string (e.g., "in 3 days", "2 days ago")
 */
export function getRelativeTimeString(deadline: Date): string {
  const daysRemaining = getDaysUntilDeadline(deadline);
  
  if (daysRemaining < 0) {
    const daysOverdue = Math.abs(daysRemaining);
    if (daysOverdue === 1) return '1 day ago';
    return `${daysOverdue} days ago`;
  } else if (daysRemaining === 0) {
    return 'Today';
  } else if (daysRemaining === 1) {
    return 'Tomorrow';
  } else {
    return `In ${daysRemaining} days`;
  }
}

/**
 * Check if a deadline is approaching (within 7 days)
 */
export function isDeadlineApproaching(deadline: Date): boolean {
  const urgency = getDeadlineUrgency(deadline);
  return urgency.level === 'urgent' || urgency.level === 'upcoming';
}

/**
 * Check if a deadline is overdue
 */
export function isDeadlineOverdue(deadline: Date): boolean {
  return getDaysUntilDeadline(deadline) < 0;
}

/**
 * Get deadline emoji based on urgency
 */
export function getDeadlineEmoji(deadline: Date): string {
  const urgency = getDeadlineUrgency(deadline);
  
  switch (urgency.level) {
    case 'overdue':
      return '🚨';
    case 'urgent':
      return '⚠️';
    case 'upcoming':
      return '📅';
    default:
      return '📋';
  }
}
