import { LoaderFunctionArgs } from '@remix-run/node';
import { getCurrentProfileInfo } from '~/servers/user.server';
import { requireUserIsFreelancer } from '~/auth/auth.server';
import { useLoaderData } from '@remix-run/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import {
  FaStar,
  FaExclamationTriangle,
  FaTools,
  FaGraduationCap,
  FaBriefcase,
} from 'react-icons/fa';
import { FaCircleExclamation } from 'react-icons/fa6';

// Progress component - simple version without radix
function Progress({ value = 0, className = '' }) {
  return (
    <div className={`relative h-4 w-full bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div className="h-full bg-primaryColor transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

// Fetcher function to get the skillfolio data
async function getSkillfolio(userId: number) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002';
    const response = await fetch(`${backendUrl}/skillfolio/get/${userId}`);

    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error('Error fetching skillfolio:', error);
    return null;
  }
}

export async function action() {
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure user is a freelancer
  const userId = await requireUserIsFreelancer(request);

  // Get the current user's profile info
  const profile = await getCurrentProfileInfo(request);

  // Fetch skillfolio data
  const skillfolio = await getSkillfolio(userId);

  return Response.json({
    profile,
    skillfolio,
  });
}

export default function SkillfolioReports() {
  const { skillfolio, profile } = useLoaderData<typeof loader>();

  // If there is no skillfolio data, show a message
  if (!skillfolio) {
    return (
      <div className="container max-w-5xl p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Skillfolio Analysis</CardTitle>
            <CardDescription>
              Your professional skills analysis will be available soon
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="text-amber-500 text-6xl mb-4">
              <FaCircleExclamation />
            </div>
            <h3 className="text-xl font-medium">Your skillfolio is being processed</h3>
            <p className="text-gray-500 text-center max-w-md">
              Once your profile is approved and analyzed, your complete skills assessment will
              appear here. This process typically takes 24-48 hours after your account is published.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl p-4">
      <h1 className="text-3xl font-bold mb-8">Your Professional Skillfolio</h1>

      {/* Domain, Field, Subfield Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{skillfolio.domain}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Field</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{skillfolio.field}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Subfield</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{skillfolio.subfield}</p>
            {skillfolio.category && <p className="text-sm text-gray-500">{skillfolio.category}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Readiness Score */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaStar className="text-yellow-500" /> Professional Readiness Score
          </CardTitle>
          <CardDescription>
            Your overall rating based on skills, tools, certifications, and experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={skillfolio.readinessScore} className="h-4" />
            <span className="text-xl font-bold">{skillfolio.readinessScore}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaStar className="text-green-500" /> Strengths
            </CardTitle>
            <CardDescription>Skills you excel at</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skillfolio.strengths.length > 0 ? (
                skillfolio.strengths.map((strength, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200">
                    {strength}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">No strengths identified yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaExclamationTriangle className="text-amber-500" /> Areas for Improvement
            </CardTitle>
            <CardDescription>Skills to develop further</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skillfolio.weaknesses.length > 0 ? (
                skillfolio.weaknesses.map((weakness, index) => (
                  <Badge key={index} className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                    {weakness}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">No improvement areas identified</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tools and Gaps Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaTools className="text-blue-500" /> Tools & Technologies
            </CardTitle>
            <CardDescription>Tools you're proficient with</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skillfolio.profile.tools.length > 0 ? (
                skillfolio.profile.tools.map((tool, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {tool}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">No tools identified</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaCircleExclamation className="text-red-500" /> Skill Gaps
            </CardTitle>
            <CardDescription>Skills typically required in your field</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skillfolio.gaps.length > 0 ? (
                skillfolio.gaps.map((gap, index) => (
                  <Badge key={index} className="bg-red-100 text-red-800 hover:bg-red-200">
                    {gap}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">No significant skill gaps identified</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Skills List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Detailed Skills Assessment</CardTitle>
          <CardDescription>All your skills with proficiency levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillfolio.profile.skills.map((skill, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="font-medium mb-1">{skill.name}</div>
                <div className="flex justify-between text-sm">
                  <span
                    className={`${
                      skill.proficiency === 'Expert'
                        ? 'text-green-600'
                        : skill.proficiency === 'Advanced'
                          ? 'text-blue-600'
                          : skill.proficiency === 'Intermediate'
                            ? 'text-amber-600'
                            : 'text-gray-600'
                    }`}
                  >
                    {skill.proficiency}
                  </span>
                  {skill.yearsOfExperience && (
                    <span className="text-gray-500">{skill.yearsOfExperience} years</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education and Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaGraduationCap className="text-purple-500" /> Education
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skillfolio.profile.education.length > 0 ? (
              <div className="space-y-4">
                {skillfolio.profile.education.map((edu, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium">
                      {edu.degree} in {edu.field}
                    </div>
                    <div className="text-sm text-gray-500">{edu.institution}</div>
                    <div className="text-xs text-gray-400">Completed: {edu.completedOn}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No education history recorded</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaBriefcase className="text-indigo-500" /> Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skillfolio.profile.experience.length > 0 ? (
              <div className="space-y-4">
                {skillfolio.profile.experience.map((exp, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium">{exp.role}</div>
                    {exp.company && <div className="text-sm">{exp.company}</div>}
                    {exp.durationYears && (
                      <div className="text-xs text-gray-400">{exp.durationYears} years</div>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exp.technologies.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No work experience recorded</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
