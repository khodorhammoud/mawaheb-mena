/**
 * EmployerTimesheet Component (Employer View)
 *
 * PURPOSE:
 * - Main timesheet interface for employers to review freelancer submissions
 * - Allows employers to accept/reject individual entries and approve entire weeks
 * - Handles the review workflow and decision management
 *
 * KEY FEATURES:
 * - Week navigation with bell notifications for new submissions
 * - Individual entry review with accept/reject decisions
 * - Week approval workflow
 * - Decision staging (changes saved until "Fix Entries" is clicked)
 * - Note management for rejected entries
 *
 * WORKFLOW:
 * 1. Employer views submitted timesheet entries
 * 2. Clicks on entries to review details and make decisions
 * 3. Decisions are staged (not sent immediately)
 * 4. "Fix Entries" button sends all decisions to freelancer
 * 5. "Approve Week" button approves entire week at once
 *
 * DECISION MANAGEMENT:
 * - Accept: Entry is approved (optional note)
 * - Reject: Entry needs fixing (required note)
 * - Already approved entries cannot be changed
 * - Decisions are staged until explicitly sent
 *
 * STATUS HANDLING:
 * - 'submitted': Week waiting for review
 * - 'approved': Week approved, entries locked
 * - 'rejected': Week rejected, freelancer notified to fix entries
 *
 * USED BY:
 * - Employers to review and manage timesheet submissions
 * - Main timesheet route for employer view
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams, useFetcher, useLocation } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Check,
  X,
  Send,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ListTodo,
  Clock,
  XCircle,
  FileWarning,
  ClipboardCheck,
  Calendar,
  FileText,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { useToast } from '~/components/hooks/use-toast';
import { cn } from '~/lib/utils';
import { startOfWeek, addWeeks, format } from 'date-fns';
import { NO_FOCUS_BTN } from '~/lib/tw';

type Entry = {
  id: number;
  date: string;
  hours: number;
  description: string;
  startHour?: number;
  startMeridiem?: 'AM' | 'PM';
  endHour?: number;
  endMeridiem?: 'AM' | 'PM';
  entryStatus?: string;
  note?: string;
};

type Props = {
  jobApplicationId: number;
  jobTitle: string;
  employerName: string;
  freelancerName: string;
  projectId: string;
  initialEntries: Entry[];
  submittedDates?: string[];
  hasPreviousWeekSubmissions?: boolean;
  hasNextWeekSubmissions?: boolean;
  weekId?: number | null;
  weekStatus?: string;
  weekSubmissionDate?: string | null;
};

const ymd = (d: Date) => format(d, 'yyyy-MM-dd');

export default function EmployerTimesheet({
  jobApplicationId,
  jobTitle,
  employerName,
  freelancerName,
  projectId,
  initialEntries,
  submittedDates,
  hasPreviousWeekSubmissions = false,
  hasNextWeekSubmissions = false,
  weekId = null,
  weekStatus = 'submitted',
  weekSubmissionDate = null,
}: Props) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [decisionState, setDecisionState] = useState<
    Record<number, { status?: 'accepted' | 'rejected'; note: string }>
  >({});
  const [isWeekApproved, setIsWeekApproved] = useState(weekStatus === 'approved');
  const approveWeekFetcher = useFetcher();
  const reviewWeekFetcher = useFetcher();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [forceLocked, setForceLocked] = useState(false);

  // Keep local approved state in sync with the current week's status when week changes
  useEffect(() => {
    setIsWeekApproved(weekStatus === 'approved');
  }, [weekStatus, weekId]);

  // Get current week from URL or default to current week
  const weekStartParam = searchParams.get('weekStart');
  const currentWeek = weekStartParam ? new Date(weekStartParam) : new Date();

  // Initialize decisions storage for all entries (auto-accept already approved entries)
  useEffect(() => {
    const initialState: Record<number, { status?: 'accepted' | 'rejected'; note: string }> = {};
    initialEntries.forEach(entry => {
      // If entry is already approved, automatically set it as accepted in decision state
      // This ensures approved entries are counted as "decided" without requiring re-acceptance
      const isAlreadyApproved = (entry as any).entryStatus === 'approved';
      initialState[entry.id] = {
        status: isAlreadyApproved ? 'accepted' : undefined,
        note: (entry as any).note || '', // Ensure note from database is preserved
      };
    });
    setDecisionState(initialState);
  }, [initialEntries]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const todayISO = ymd(new Date());
  const weekEndISO = ymd(weekEnd);

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  // Group entries by date
  const entriesByDate = initialEntries.reduce<Record<string, Entry[]>>((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  const totalWeekHours = initialEntries.reduce((total, entry) => total + entry.hours, 0);

  // Decision completeness
  const decidedCount = Object.values(decisionState).filter(d => d.status).length;
  const totalEntries = initialEntries.length;
  const areAllDecided = totalEntries > 0 && decidedCount === totalEntries;

  // Approve Week enabled unless any entry is rejected
  const hasAnyRejected = initialEntries.some(
    e => decisionState[e.id]?.status === 'rejected' || (e as any).entryStatus === 'rejected'
  );
  const canApproveWeek = !hasAnyRejected;

  const handleWeekNavigation = (direction: 'prev' | 'next') => {
    const newWeek = direction === 'prev' ? addWeeks(currentWeek, -1) : addWeeks(currentWeek, 1);
    const newWeekStart = ymd(startOfWeek(newWeek, { weekStartsOn: 1 }));

    // Update URL with new week
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('weekStart', newWeekStart);
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  const getCurrentWeekLabel = () => {
    return `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`;
  };

  const handleEntryClick = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsDialogOpen(true);
  };

  const setAccepted = (entryId: number) => {
    setDecisionState(prev => ({
      ...prev,
      [entryId]: { ...prev[entryId], status: 'accepted' },
    }));
    setIsDialogOpen(false);
  };

  const setRejected = (entryId: number) => {
    setDecisionState(prev => ({
      ...prev,
      [entryId]: { ...prev[entryId], status: 'rejected' },
    }));
    setIsDialogOpen(false);
  };

  const handleNoteChange = (entryId: number, note: string) => {
    setDecisionState(prev => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        note,
      },
    }));
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedEntry(null);
  };

  const handleApproveWeek = () => {
    setIsApproveDialogOpen(true);
  };

  const handleConfirmApproveWeek = () => {
    if (!weekId) {
      console.error('No week ID available');
      return;
    }

    const formData = new FormData();
    formData.append('weekId', weekId.toString());
    formData.append('jobApplicationId', jobApplicationId.toString());

    approveWeekFetcher.submit(formData, {
      method: 'POST',
      action: '/api/timesheet/approve-week',
    });

    setIsApproveDialogOpen(false);
  };

  // Handle approval success
  useEffect(() => {
    if ((approveWeekFetcher.data as any)?.success) {
      setIsWeekApproved(true);
    }
  }, [approveWeekFetcher.data]);

  // Handle review-week success: lock UI similar to approved state
  useEffect(() => {
    const d = reviewWeekFetcher.data as any;
    if (d?.success) {
      setForceLocked(true);
      toast({
        title: 'Sent for revision',
        description: 'The freelancer has been notified to review the week entries.',
      });
    } else if (d && d.success === false && d.error) {
      toast({ title: 'Error', description: d.error, variant: 'destructive' });
    }
  }, [reviewWeekFetcher.data, toast]);

  const acceptedCount = Object.values(decisionState).filter(s => s.status === 'accepted').length;
  const rejectedCount = Object.values(decisionState).filter(s => s.status === 'rejected').length;
  const hasDecisions = acceptedCount + rejectedCount > 0;

  // Check if current week is submitted
  const isCurrentWeekSubmitted = submittedDates && submittedDates.length > 0;

  // Check if we're viewing current week or future week
  const isCurrentOrFutureWeek = weekEndISO > todayISO;
  const isEmployerLocked = forceLocked || weekStatus === 'approved' || weekStatus === 'rejected';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm border border-blue-100">
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            className={cn('gap-2 h-8 px-4 shadow-sm hover:shadow-md transition-all', NO_FOCUS_BTN)}
          >
            <Link to="/timesheets">← Back to Jobs</Link>
          </Button>
          <div className="h-8 w-px bg-gray-300"></div>
          <div className="lg:text-sm text-xs text-gray-600 font-medium">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
          </div>
        </div>
        <div className="text-right flex items-center gap-2 justify-center">
          <div className="lg:text-2xl text-xl font-bold text-primaryColor">
            {totalWeekHours.toFixed(2)}h
          </div>
          <div className="lg:text-sm text-xs text-gray-600 font-medium mt-1">Total This Week</div>
        </div>
      </div>

      {/* Job Header Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primaryColor rounded-full flex items-center justify-center">
                <ListTodo className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm lg:text-base font-semibold text-gray-900 leading-tight">
                  {jobTitle}
                </h2>
                <p className="text-xs text-gray-600 font-medium">
                  {employerName} • {projectId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="font-medium">Freelancer:</span> {freelancerName}
            </div>
          </div>

          {/* Right Side */}
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium shadow-sm">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              Active Project
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {isCurrentOrFutureWeek ? (
        /* 🟠 Not Yet Available */
        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg py-2.5 px-4 shadow-sm">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="font-medium text-amber-800 text-xs lg:text-sm">
              Week Not Yet Available
            </div>
            <div className="text-[11px] lg:text-xs text-amber-700">
              Cannot be submitted until{' '}
              <span className="font-medium">{format(weekEnd, 'EEEE, MMMM dd')}</span>
            </div>
          </div>
        </div>
      ) : isWeekApproved ? (
        /* ✅ Approved */
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg py-2.5 px-4 shadow-sm">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="font-medium text-emerald-800 text-xs lg:text-sm">
              Timesheet Approved
            </div>
            <div className="text-[11px] lg:text-xs text-emerald-700">
              You approved this week. Entries are locked.
            </div>
          </div>
        </div>
      ) : weekStatus === 'rejected' ? (
        /* ❌ Rejected */
        <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg py-2.5 px-4 shadow-sm">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <div className="font-medium text-red-800 text-xs lg:text-sm">
              Waiting for Freelancer Fixes
            </div>
            <div className="text-[11px] lg:text-xs text-red-700">
              Employer rejected this week; waiting for corrected entries
            </div>
          </div>
        </div>
      ) : !isCurrentWeekSubmitted ? (
        /* ⚪ Not Submitted */
        <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg py-2.5 px-4 shadow-sm">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <FileWarning className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <div className="font-medium text-gray-800 text-xs lg:text-sm">Not Submitted</div>
            <div className="text-[11px] lg:text-xs text-gray-700">
              Freelancer has not submitted this week yet
            </div>
          </div>
        </div>
      ) : (
        /* 🔵 Review Required */
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg py-2.5 px-4 shadow-sm">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <ClipboardCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-blue-800 text-xs lg:text-sm">Review Required</div>
            <div className="text-[11px] lg:text-xs text-blue-700">
              Review and approve timesheet entries
            </div>
          </div>
        </div>
      )}

      {/* Week Navigation */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          {/* Previous Week Button */}
          <Button
            variant="outline"
            onClick={() => handleWeekNavigation('prev')}
            className={cn(
              'gap-2 h-8 px-4 shadow-sm hover:shadow-md transition-all font-medium text-sm',
              NO_FOCUS_BTN
            )}
          >
            <span className="text-base">←</span>
            Previous week
          </Button>

          {/* Week Label */}
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{getCurrentWeekLabel()}</div>
            <div className="text-xs text-gray-500 font-medium">Timesheet Period</div>
          </div>

          {/* Next Week Button */}
          <Button
            variant="outline"
            onClick={() => handleWeekNavigation('next')}
            className={cn(
              'gap-2 h-8 px-4 shadow-sm hover:shadow-md transition-all font-medium text-sm',
              NO_FOCUS_BTN
            )}
          >
            Next week
            <span className="text-base">→</span>
          </Button>
        </div>
      </div>

      {/* Timesheet Grid */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Daily Timesheet Entries</h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Click on entries to review and approve individual tasks
          </p>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map(date => {
              const dateYMD = ymd(date);
              const dayEntries = entriesByDate[dateYMD] || [];
              const isSubmitted = submittedDates?.includes(dateYMD) || false;
              const isFuture = dateYMD > todayISO;

              return (
                <div key={dateYMD} className="text-center">
                  {/* Day label */}
                  <div
                    className={cn(
                      'text-[11px] font-medium mb-1',
                      dateYMD === todayISO ? 'text-primaryColor font-bold' : 'text-gray-600'
                    )}
                  >
                    {format(date, 'EEE')}
                  </div>

                  {/* Day box */}
                  <div
                    className={cn(
                      'min-h-[110px] shadow-sm rounded-md bg-white',
                      dayEntries.length === 0 && 'border border-gray-200',
                      dateYMD === todayISO &&
                        'border-primaryColor/80 bg-gradient-to-b from-blue-50 to-blue-100 shadow-md'
                    )}
                  >
                    {dayEntries.length > 0 ? (
                      <div className="space-y-1">
                        {dayEntries.map(entry => (
                          <div
                            key={entry.id}
                            className={cn(
                              'p-2 rounded-md transition-all duration-200',
                              isEmployerLocked
                                ? 'bg-gradient-to-br from-gray-50 to-gray-100 shadow-none'
                                : (entry as any).entryStatus === 'approved'
                                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm cursor-not-allowed'
                                  : 'bg-white border shadow-sm hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md cursor-pointer transform hover:scale-[1.02]'
                            )}
                            onClick={
                              isEmployerLocked || (entry as any).entryStatus === 'approved'
                                ? () => {
                                    if ((entry as any).entryStatus === 'approved') {
                                      toast({
                                        title: 'Entry Already Approved',
                                        description:
                                          'This entry has already been approved and cannot be modified.',
                                        variant: 'destructive',
                                      });
                                    }
                                  }
                                : () => handleEntryClick(entry)
                            }
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-sm font-bold text-blue-600">{entry.hours}h</div>
                              {weekStatus === 'approved' && (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              )}
                            </div>

                            {entry.description && (
                              <div className="text-left">
                                <div className="text-gray-700 text-[11px] mb-1 line-clamp-2 font-semibold">
                                  Task: {entry.description}
                                </div>
                              </div>
                            )}

                            {/* Remove raw Submitted chip to avoid confusion during employer review */}

                            {/* Staged decision indicators */}
                            {decisionState[entry.id]?.status === 'accepted' &&
                              !isEmployerLocked &&
                              (entry as any).entryStatus !== 'approved' && (
                                <div className="text-emerald-400 text-[10px] font-medium mb-0.5 flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Approved (not sent)
                                </div>
                              )}
                            {decisionState[entry.id]?.status === 'rejected' &&
                              !isEmployerLocked && (
                                <div className="text-red-600 text-[10px] font-medium mb-0.5 flex items-center gap-1">
                                  <X className="h-3 w-3" /> Rejected (not sent)
                                </div>
                              )}

                            {(() => {
                              const s = (entry as any).entryStatus as string | undefined;
                              if (s === 'approved' || weekStatus === 'approved') {
                                return (
                                  <div className="text-green-600 text-[10px] font-medium flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Approved
                                    <Lock className="h-2 w-2 ml-1" />
                                  </div>
                                );
                              }
                              if (s === 'rejected' || weekStatus === 'rejected') {
                                return (
                                  <div className="text-orange-600 text-[10px] font-medium flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Waiting for freelancer fixes
                                  </div>
                                );
                              }
                              return (
                                <div className="text-blue-600 text-[10px] font-medium flex items-center gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Pending
                                </div>
                              );
                            })()}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-400 mt-6">
                        {isFuture ? 'Future day' : 'No entries'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Update Entries - Send for Revision - Approve Week buttons - Only show for submitted weeks and not approved */}
      {isCurrentWeekSubmitted && !isEmployerLocked && (
        <div className="bg-white p-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Timesheet Actions</h3>
            <p className="text-xs text-gray-600">
              Review and manage timesheet entries for this week
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {/* Fix Entries */}
            <Button
              onClick={() => {
                if (!weekId) return;
                if (!areAllDecided) {
                  toast({
                    title: 'Decisions required',
                    description: 'Accept or reject every time entry to notify the freelancer.',
                    variant: 'destructive',
                  });
                  return;
                }
                const form = new FormData();
                form.append('weekId', String(weekId));
                form.append('jobApplicationId', String(jobApplicationId));
                const decisions = Object.entries(decisionState)
                  .filter(([, v]) => v.status)
                  .map(([entryId, v]) => ({
                    entryId: Number(entryId),
                    status: v.status,
                    note: v.note,
                  }));
                form.append('decisions', JSON.stringify(decisions));
                reviewWeekFetcher.submit(form, {
                  method: 'POST',
                  action: '/api/timesheet/review-week',
                });
                setForceLocked(true);
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 h-9 text-xs shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-primaryColor/80 to-primaryColor text-white font-medium rounded-md',
                !areAllDecided && 'opacity-50 cursor-not-allowed'
              )}
            >
              <CheckCircle className="h-4 w-4" />
              Fix Entries
            </Button>

            {/* Send for Revision removed; Fix Entries handles return */}

            {/* Approve Week - visible from start; disabled only if any entry is rejected */}
            <Button
              disabled={!canApproveWeek}
              onClick={handleApproveWeek}
              className={cn(
                'flex items-center gap-2 px-4 py-2 h-9 text-xs bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-sm hover:shadow-md transition-all text-white font-medium rounded-md',
                !canApproveWeek && 'opacity-50 cursor-not-allowed'
              )}
            >
              <CheckCircle className="h-4 w-4" />
              Approve Week
            </Button>
          </div>
        </div>
      )}

      {/* Entry Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Review Timesheet Entry
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600">
              Decide whether to accept or reject this entry. Changes will be staged until you press{' '}
              <span className="font-medium">Update Entries</span>.
            </DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-6 mt-4">
              {/* Entry details card */}
              <div className="rounded-lg border bg-gray-50 p-4 shadow-sm">
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Date:</span> {selectedEntry.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Start:</span> {selectedEntry.startHour}:
                    {selectedEntry.startMeridiem}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">End:</span> {selectedEntry.endHour}:
                    {selectedEntry.endMeridiem}
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Hours:</span> {selectedEntry.hours}h
                  </div>
                  {selectedEntry.description && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Description:</span>{' '}
                        {selectedEntry.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Guidance text */}
              <p className="text-xs text-gray-500">
                ✅ Accept → note is optional. <br /> ❌ Reject → note is required so the freelancer
                knows what to fix.
              </p>

              {/* Note field (always visible, but hint changes color if rejected) */}
              <Textarea
                placeholder={
                  decisionState[selectedEntry.id]?.status === 'rejected'
                    ? 'Required note for rejection'
                    : 'Place a note for the freelancer'
                }
                value={decisionState[selectedEntry.id]?.note || (selectedEntry as any).note || ''}
                onChange={e => handleNoteChange(selectedEntry.id, e.target.value)}
                className={`w-full text-sm placeholder:text-gray-400 ${NO_FOCUS_BTN}`}
                rows={3}
              />

              {/* Actions */}
              <div className="flex items-center gap-3 justify-end">
                {/* Show warning if entry is already approved */}
                {(selectedEntry as any).entryStatus === 'approved' && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span>This entry is already approved and cannot be changed</span>
                  </div>
                )}

                <Button
                  size="sm"
                  onClick={() => setAccepted(selectedEntry.id)}
                  disabled={(selectedEntry as any).entryStatus === 'approved'}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all ' +
                      NO_FOCUS_BTN,
                    decisionState[selectedEntry.id]?.status === 'accepted'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'border border-gray-300 bg-primaryColor hover:bg-primaryColor/90',
                    (selectedEntry as any).entryStatus === 'approved' &&
                      'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Check className="h-4 w-4" />
                  Accept
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if ((decisionState[selectedEntry.id]?.note || '').trim().length === 0) {
                      toast({
                        title: 'Add a note',
                        description: 'Please provide a note explaining what needs to be fixed.',
                        variant: 'destructive',
                      });
                      return;
                    }
                    setRejected(selectedEntry.id);
                  }}
                  disabled={(selectedEntry as any).entryStatus === 'approved'}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all bg-red-600 hover:bg-red-700 text-white',
                    NO_FOCUS_BTN,
                    (selectedEntry as any).entryStatus === 'approved' &&
                      'opacity-50 cursor-not-allowed'
                  )}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Week Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Confirm Week Approval</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-2">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-[2px]" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-2">This will:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Approve all timesheet entries for {getCurrentWeekLabel()}</li>
                    <li>Lock the week so it cannot be edited</li>
                    <li>Notify {freelancerName} of approval</li>
                    <li>Mark the week as completed</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <p className="font-medium">Total hours to approve: {totalWeekHours.toFixed(2)}h</p>
                <p className="text-xs mt-1">All entries will be marked as approved and locked.</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
              className="flex items-center gap-2 px-4 py-2 h-9 text-xs shadow-sm hover:shadow-md transition-all border border-gray-300 hover:border-gray-400 text-gray-600 hover:bg-gray-50 font-medium rounded-md"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApproveWeek}
              className="flex items-center gap-2 px-4 py-2 h-9 text-xs bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-sm hover:shadow-md transition-all text-white font-medium rounded-md"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Week
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
