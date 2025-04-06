import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  requireUserAccountStatusPublished,
  requireUserIsFreelancerPublished,
} from '~/auth/auth.server';
import { verifyJobBelongsToEmployer } from '~/servers/employer.server';
import { getJobApplicationById } from '~/servers/job.server';
import {
  insetTimesheetEntryIntoDatabase,
  getTimesheetEntriesFromDatabase,
  updateTimesheetEntryInDatabase,
  deleteTimesheetEntryFromDatabase,
  getTimesheetSubmissions,
} from '~/servers/timesheet.server';
import {
  getEmployerIdFromUserId,
  getFreelancerIdFromUserId,
  getUserAccountType,
} from '~/servers/user.server';
import { AccountType, TimesheetStatus } from '@mawaheb/db/src/types/enums';
import { TimesheetEntry } from '@mawaheb/db/src/types/Timesheet';

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserAccountStatusPublished(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const accountType = await getUserAccountType(userId);
  let freelancerId: number | null = null;

  const url = new URL(request.url);
  const jobApplicationId: number = parseInt(url.searchParams.get('jobApplicationId') || '-1');
  const fromTime = url.searchParams.get('fromTime');
  const toTime = url.searchParams.get('toTime');

  if (accountType === AccountType.Freelancer) {
    freelancerId = await getFreelancerIdFromUserId(userId);
  } else if (accountType === AccountType.Employer) {
    console.log('url.searchParams.get("freelancerId")', url.searchParams.get('freelancerId'));
    freelancerId = parseInt(url.searchParams.get('freelancerId'));
  }

  // check if the from time and to time are in the correct format
  if (!fromTime || !toTime) {
    return Response.json({ error: 'fromTime and toTime are required' }, { status: 400 });
  }
  const fromTimeDate = new Date(fromTime);
  const toTimeDate = new Date(toTime);

  // check if the from time and to time are in the correct format
  if (isNaN(fromTimeDate.getTime()) || isNaN(toTimeDate.getTime())) {
    return Response.json({ error: 'Invalid date format' }, { status: 400 });
  }

  // check if the from time is before the to time
  if (fromTimeDate > toTimeDate) {
    return Response.json({ error: 'fromTime must be before toTime' }, { status: 400 });
  }

  // duration between fromTime and toTime must be no more than 1 week
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  if (toTimeDate.getTime() - fromTimeDate.getTime() > oneWeek) {
    return Response.json({ error: 'Duration must be no more than 1 week' }, { status: 400 });
  }

  const jobApplication = await getJobApplicationById(jobApplicationId);
  if (!jobApplication) {
    return Response.json({ error: 'Job application not found' }, { status: 404 });
  }

  if (accountType === AccountType.Employer) {
    // Verify employer owns the job
    const employerId = await getEmployerIdFromUserId(userId);
    const jobBelongsToEmployer = await verifyJobBelongsToEmployer(jobApplication.jobId, employerId);

    if (!jobBelongsToEmployer) {
      return Response.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // For employers, verify freelancerId matches the job application
    if (freelancerId !== jobApplication.freelancerId) {
      return Response.json(
        { error: 'Invalid freelancer for this job application' },
        { status: 400 }
      );
    }
  } else {
    // For freelancers, verify they own the timesheet
    if (jobApplication.freelancerId !== (await getFreelancerIdFromUserId(userId))) {
      return Response.json({ error: 'Unauthorized access' }, { status: 403 });
    }
  }

  // get the timesheet entries for the freelancer that are between fromTime and toTime
  const timesheetEntries = await getTimesheetEntriesFromDatabase(
    freelancerId,
    jobApplicationId,
    fromTimeDate,
    toTimeDate
  );

  let statuses: TimesheetStatus[] = [
    TimesheetStatus.Submitted,
    TimesheetStatus.Approved,
    TimesheetStatus.Rejected,
    TimesheetStatus.Draft,
  ];

  if (accountType === AccountType.Employer) {
    /* timesheetEntries = timesheetEntries.filter(
      (entry) => entry.status !== TimesheetStatus.Draft
    ); */
    statuses = [TimesheetStatus.Submitted, TimesheetStatus.Approved, TimesheetStatus.Rejected];
  }

  if (timesheetEntries.length === 0) {
    return Response.json([]);
  }

  const submissions = await getTimesheetSubmissions(
    freelancerId,
    jobApplicationId,
    fromTimeDate,
    toTimeDate,
    statuses
  );

  // Map submissions to dates for easy lookup
  const submissionsByDate = submissions.reduce((acc, submission) => {
    const dateKey = submission.submissionDate;
    acc[dateKey] = submission;
    return acc;
  }, {});

  // Include submission status in the response
  const timesheetEntriesWithSubmission = timesheetEntries.map(entry => ({
    ...entry,
    status: submissionsByDate[entry?.date?.toLocaleDateString('en-CA')]?.status,
    isSubmitted: !!submissionsByDate[entry?.date?.toLocaleDateString('en-CA')],
  }));

  return Response.json({
    timesheetEntries: timesheetEntriesWithSubmission,
    isSubmitted: timesheetEntriesWithSubmission.some(entry => entry.isSubmitted),
  });
}

async function addTimesheetEntry(
  formData: FormData,
  freelancerId: number,
  jobApplicationId: number
) {
  const date = formData.get('date');
  const startTime = Number(formData.get('startTime'));
  const endTime = Number(formData.get('endTime'));
  const description = formData.get('description') as string;

  const dateDate = new Date(date as string);

  // get the timesheet entry data from the form data
  const timesheetEntryData: TimesheetEntry = {
    date: dateDate,
    startTime: startTime,
    endTime: endTime,
    description: description,
  };

  // add the timesheet entry to the database
  const timesheetEntry = await insetTimesheetEntryIntoDatabase(
    timesheetEntryData,
    freelancerId,
    jobApplicationId
  );

  return Response.json({ timesheetEntry });
}

async function updateTimesheetEntry(
  formData: FormData,
  freelancerId: number,
  jobApplicationId: number
) {
  const timesheetEntryId = formData.get('timesheetEntryId');
  const timesheetEntryIdNumber = parseInt(timesheetEntryId as string);
  if (isNaN(timesheetEntryIdNumber)) {
    return Response.json({ error: 'Invalid timesheet entry id' }, { status: 400 });
  }

  const date = formData.get('date');
  const startTime = Number(formData.get('startTime'));
  const endTime = Number(formData.get('endTime'));
  const description = formData.get('description') as string;

  const dateDate = new Date(date as string);

  const timesheetEntryData: TimesheetEntry = {
    id: timesheetEntryIdNumber,
    date: dateDate,
    startTime: startTime,
    endTime: endTime,
    description: description,
  };

  const updatedTimesheetEntry = await updateTimesheetEntryInDatabase(
    timesheetEntryData,
    freelancerId,
    jobApplicationId
  );

  return Response.json({ updatedTimesheetEntry });
}

async function deleteTimesheetEntry(
  formData: FormData,
  freelancerId: number,
  jobApplicationId: number
) {
  const timesheetEntryId = formData.get('timesheetEntryId');

  const timesheetEntryIdNumber = parseInt(timesheetEntryId as string);
  if (isNaN(timesheetEntryIdNumber)) {
    return Response.json({ error: 'Invalid timesheet entry id' }, { status: 400 });
  }

  await deleteTimesheetEntryFromDatabase(timesheetEntryIdNumber, freelancerId, jobApplicationId);

  return Response.json({ message: 'Timesheet entry deleted' });
}

export async function action({ request }: ActionFunctionArgs) {
  // user must be a published freelancer
  const userId = await requireUserIsFreelancerPublished(request);
  const formData = await request.formData();
  const jobApplicationId = formData.get('jobApplicationId');
  const jobApplicationIdNumber = parseInt(jobApplicationId as string);
  const freelancerId = await getFreelancerIdFromUserId(userId);

  const method = request.method;

  switch (method) {
    case 'POST':
      return await addTimesheetEntry(formData, freelancerId, jobApplicationIdNumber);
    case 'DELETE':
      return await deleteTimesheetEntry(formData, freelancerId, jobApplicationIdNumber);
    case 'PUT':
      return await updateTimesheetEntry(formData, freelancerId, jobApplicationIdNumber);
  }
}
