import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { IoPencilSharp } from 'react-icons/io5';
import { useFetcher } from '@remix-run/react';
import SearcheableTagSelector from '~/common/SearcheableTagSelector';
import { Badge } from '~/components/ui/badge';
import { FreelancerSkill, Skill } from '~/routes/_templatedashboard.onboarding/types';
import AppFormField from '~/common/form-fields';
import { FaStar } from 'react-icons/fa';

// Suggested skills array
const SUGGESTED_SKILLS = [
  'Branding',
  'Responsive Web Design',
  'JavaScript',
  'HTML/CSS',
  'Social Media Marketing',
  'Accounting',
  'DevOps',
  'Technical Support',
  'Other',
];

interface SkillsProps {
  profile: { skills?: FreelancerSkill[] };
  canEdit?: boolean;
}

export default function Skills({ profile, canEdit = true }: SkillsProps) {
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [freelancerSkills, setFreelancerSkills] = useState<FreelancerSkill[]>([]);
  const [showAll, setShowAll] = useState(false);

  const skillsFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>();

  // ✅ Load skills from profile
  useEffect(() => {
    if (profile.skills) {
      // Ensure we're properly mapping the skills with all required fields
      const mappedSkills = profile.skills.map(skill => ({
        skillId: skill.skillId,
        label: skill.label,
        yearsOfExperience: skill.yearsOfExperience || 0,
        isStarred: skill.isStarred || false,
      }));

      setFreelancerSkills(mappedSkills);

      // Update selected skills with proper typing
      setSelectedSkills(
        mappedSkills.map(
          skill =>
            ({
              id: skill.skillId,
              label: skill.label,
              metaData: {},
              isHot: false,
            }) as Skill
        )
      );
    }
  }, [profile.skills]);

  // Update freelancerSkills when selectedSkills changes
  useEffect(() => {
    const newFreelancerSkills = selectedSkills.map(skill => {
      const existingSkill = freelancerSkills.find(fs => fs.skillId === skill.id);

      return {
        skillId: skill.id,
        label: skill.label,
        yearsOfExperience: existingSkill?.yearsOfExperience || 0,
        isStarred: existingSkill?.isStarred || false,
      };
    });
    setFreelancerSkills(newFreelancerSkills);
  }, [selectedSkills]);

  useEffect(() => {
    if (skillsFetcher.data?.success) {
      setSkillsDialogOpen(false); // CLOSE dialog on success
      setShowMessage(false); // Optionally reset message
    } else if (skillsFetcher.data?.error) {
      setShowMessage(true); // Show error if present
    }
  }, [skillsFetcher.data]);

  const handleSkillDialogChange = (isOpen: boolean) => {
    setSkillsDialogOpen(isOpen);
    if (!isOpen) setShowMessage(false);
  };

  const handleYearsChange = (skillId: number, years: number) => {
    if (years < 0 || years > 50) return;
    setFreelancerSkills(prev =>
      prev.map(skill =>
        skill.skillId === skillId ? { ...skill, yearsOfExperience: years } : skill
      )
    );
  };

  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkills(prev => prev.filter(skill => skill.id !== skillId));
    setFreelancerSkills(prev => prev.filter(skill => skill.skillId !== skillId));
  };

  const handleToggleTopSkill = (skillId: number) => {
    setFreelancerSkills(prev => {
      const newSkills = prev.map(skill =>
        skill.skillId === skillId ? { ...skill, isStarred: !skill.isStarred } : skill
      );
      return newSkills;
    });
  };

  const handleSubmit = () => {
    const skillsWithExperience = freelancerSkills.map(skill => ({
      skillId: skill.skillId,
      label: skill.label,
      yearsOfExperience: skill.yearsOfExperience,
      isStarred: skill.isStarred,
    }));

    skillsFetcher.submit(
      {
        skills: JSON.stringify(skillsWithExperience),
        'target-updated': 'freelancer-skills',
      },
      { method: 'post' }
    );
  };

  const handleSuggestedSkillClick = (skillLabel: string) => {
    // Find if the skill already exists in selectedSkills
    const existingSkill = selectedSkills.find(skill => skill.label === skillLabel);
    if (existingSkill) return;

    // Create a new skill with a temporary ID (you might want to handle this differently)
    const newSkill = {
      id: Math.random(), // Temporary ID
      label: skillLabel,
    } as Skill;

    setSelectedSkills(prev => [...prev, newSkill]);
  };

  // Add logging for the main view rendering
  // console.log(
  //   '🔥 SKILLS COMPONENT: Rendering main view with skills:',
  //   freelancerSkills.map(s => ({ label: s.label, isStarred: s.isStarred }))
  // );

  return (
    <>
      <div className="lg:ml-auto flex flex-col xl:mr-20 md:mr-10 mr-0 gap-2">
        <div className="flex items-center justify-between w-full">
          <span className="relative 2xl:text-lg lg:text-base text-sm font-medium">Skills</span>

          {canEdit && (
            <Dialog open={skillsDialogOpen} onOpenChange={handleSkillDialogChange}>
              <DialogTrigger asChild>
                <Button variant="link">
                  <IoPencilSharp className="lg:relative absolute lg:left-0 left-10 xl:h-7 h-6 xl:w-7 w-6 text-primaryColor hover:bg-gray-200 transition-all rounded-full p-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white lg:w-[500px] w-[300px] max-h-[90vh]">
                {/* <button
                  onClick={() => handleSkillDialogChange(false)}
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                > */}
                {/* <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg> */}
                {/* <span className="sr-only">Close</span> */}
                {/* </button> */}
                <DialogHeader>
                  <DialogTitle className="my-3">Skills</DialogTitle>
                  <DialogDescription className="w-2/3 text-base">
                    Add at least 5 skills, then star 3-4 of them you consider your top skill.
                  </DialogDescription>
                </DialogHeader>

                {showMessage && skillsFetcher.data?.error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 lg:px-4 px-2 lg:py-3 py-1 rounded relative mb-4">
                    <span className="block sm:inline">{skillsFetcher.data.error.message}</span>
                  </div>
                )}

                <div className="mb-4 mt-6 ml-1">
                  <SearcheableTagSelector<Skill>
                    dataType="skill"
                    selectedItems={selectedSkills}
                    setSelectedItems={setSelectedSkills}
                    itemLabel={(item: Skill) => item.label}
                    itemKey={(item: Skill) => item.id}
                    formName="freelancer-skills"
                    fieldName="freelancer-skills"
                    searchPlaceholder="Search or type skill"
                    autoSubmit={false}
                  />
                </div>

                <div className="border-t border-gray-300 my-6 ml-2 mr-6"></div>
                <p className="-mt-1 ml-1 mb-3 font-semibold text-sm">Choosed Skills:</p>

                <div className="flex flex-wrap gap-y-4 gap-x-4">
                  {freelancerSkills.map(skill => (
                    <div key={skill.skillId} className="flex gap-2 items-center">
                      <div className="relative inline-block group">
                        <Badge
                          className={`cursor-pointer xl:px-4 px-3 xl:py-2 py-1 max-w-fit ${
                            skill.isStarred ? 'bg-blue-200' : 'bg-blue-100'
                          } text-gray-900 rounded-2xl hover:bg-blue-200 transition flex items-center gap-2`}
                        >
                          <FaStar
                            className={`cursor-pointer ${
                              skill.isStarred ? 'text-primaryColor' : 'text-gray-400'
                            }`}
                            onClick={() => handleToggleTopSkill(skill.skillId)}
                          />
                          {skill.label}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-fit border border-gray-300 rounded">
                          <button
                            type="button"
                            className="p-1 px-3 rounded hover:bg-gray-100"
                            onClick={() =>
                              handleYearsChange(
                                skill.skillId,
                                Math.max(0, (skill.yearsOfExperience || 0) - 1)
                              )
                            }
                          >
                            -
                          </button>
                          <div className="text-xs">{skill.yearsOfExperience}</div>
                          <button
                            type="button"
                            className="p-1 px-3 rounded hover:bg-gray-100"
                            onClick={() =>
                              handleYearsChange(
                                skill.skillId,
                                Math.min(50, (skill.yearsOfExperience || 0) + 1)
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <DialogFooter className="mt-6">
                  <Button
                    onClick={handleSubmit}
                    disabled={skillsFetcher.state === 'submitting'}
                    className="text-white lg:py-4 py-3 lg:px-10 px-6 rounded-xl bg-primaryColor font-medium hover:bg-primaryColor"
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-wrap items-start gap-2 w-full">
          {freelancerSkills.length > 0 ? (
            <>
              {freelancerSkills.slice(0, 2).map(skill => (
                <Badge
                  key={skill.skillId}
                  className="xl:px-4 px-3 py-1 xl:text-sm text-xs bg-blue-100 text-gray-900 rounded-2xl shadow-sm flex items-center gap-2"
                >
                  {skill.isStarred && <FaStar className="text-yellow-500" />}
                  {skill.label}
                </Badge>
              ))}

              {freelancerSkills.length > 2 && (
                <Dialog open={showAll} onOpenChange={setShowAll}>
                  <DialogTrigger asChild>
                    <Badge
                      variant="outline"
                      className="xl:px-4 px-3 py-1 xl:text-sm text-xs bg-gray-200 text-gray-700 rounded-2xl shadow-sm hover:bg-gray-300"
                    >
                      +{freelancerSkills.length - 2} more
                    </Badge>
                  </DialogTrigger>
                  <DialogContent className="bg-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="xl:text-lg text-base">All Skills</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-wrap items-start gap-2 mt-4">
                      {freelancerSkills.map(skill => (
                        <Badge
                          key={skill.skillId}
                          className="px-3 py-1 xl:text-sm text-xs bg-blue-100 text-gray-900 rounded-2xl shadow-sm flex items-center gap-2"
                        >
                          {skill.isStarred && <FaStar className="text-yellow-500" />}
                          {skill.label}
                        </Badge>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </>
          ) : (
            <span className="text-gray-500 text-sm italic">No skills added</span>
          )}
        </div>
      </div>
    </>
  );
}
