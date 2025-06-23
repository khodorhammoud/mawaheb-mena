// // this endpoint calls a function that filteres jobs that will appear in SingleJobView, according to matching skills, if any, and according to job level (senior/mid_level) + excluding jobs that the freelancer had applied to of course :)

// import { LoaderFunctionArgs } from '@remix-run/node';
// import { getSuggestedJobsForJob, getJobById } from '../servers/job.server';
// import { requireUserIsFreelancerPublished } from '~/auth/auth.server';
// import { getFreelancerIdByUserId } from '~/servers/freelancer.server';

// export async function loader({ request }: LoaderFunctionArgs) {
//   console.log('🔥 LOADER CALLED');
//   // Make sure user is a published freelancer
//   const userId = await requireUserIsFreelancerPublished(request);
//   if (!userId) {
//     return Response.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const freelancerId = await getFreelancerIdByUserId(userId);
//   if (!freelancerId) {
//     // No freelancer found for this userId
//     return Response.json({ jobs: [] }, { status: 200 });
//   }
//   console.log('freelancerId: ', freelancerId);

//   const url = new URL(request.url);
//   const jobId = url.searchParams.get('jobId');
//   let suggestedJobs = [];

//   if (jobId) {
//     // Get the current job by id
//     const currentJob = await getJobById(Number(jobId));
//     if (currentJob) {
//       // Fetch suggested jobs for this job
//       suggestedJobs = await getSuggestedJobsForJob(currentJob, freelancerId, 4); // 4 is the default, change if needed
//     }
//   }

//   return Response.json({ jobs: suggestedJobs });
// }
