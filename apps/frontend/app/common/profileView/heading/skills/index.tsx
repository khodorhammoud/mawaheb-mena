import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { IoPencilSharp } from "react-icons/io5";
import { useFetcher } from "@remix-run/react";
import SearcheableTagSelector from "~/common/SearcheableTagSelector";
import { Badge } from "~/components/ui/badge";
import {
  FreelancerSkill,
  Skill,
} from "~/routes/_templatedashboard.onboarding/types";
import AppFormField from "~/common/form-fields";

interface SkillsProps {
  profile: { skills?: FreelancerSkill[] };
  canEdit?: boolean;
}

export default function Skills({ profile, canEdit = true }: SkillsProps) {
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [freelancerSkills, setFreelancerSkills] = useState<FreelancerSkill[]>(
    []
  );
  const [showAll, setShowAll] = useState(false); // State for modal

  // console.log("🔥 SKILLS COMPONENT: Received Profile:", profile);

  const skillsFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>();

  // ✅ Load skills from profile
  useEffect(() => {
    // console.log("Profile Skills:", profile.skills);
    if (profile.skills) {
      setFreelancerSkills(profile.skills);
      setSelectedSkills(
        profile.skills.map(
          (skill) =>
            ({
              id: skill.skillId,
              label: skill.label,
            }) as Skill
        )
      );
    }
  }, [profile.skills]);

  useEffect(() => {
    if (skillsFetcher.data?.success || skillsFetcher.data?.error) {
      setShowMessage(true);
    }
  }, [skillsFetcher.data]);

  const handleSkillDialogChange = (isOpen: boolean) => {
    setSkillsDialogOpen(isOpen);
    if (!isOpen) setShowMessage(false);
  };

  const handleYearsChange = (skillId: number, years: number) => {
    if (years < 0 || years > 30) return;
    setFreelancerSkills((prev) =>
      prev.map((skill) =>
        skill.skillId === skillId
          ? { ...skill, yearsOfExperience: years }
          : skill
      )
    );
  };

  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkills((prev) => prev.filter((skill) => skill.id !== skillId));
  };

  const handleSubmit = () => {
    const skillsWithExperience = freelancerSkills.map((skill) => ({
      skillId: skill.skillId,
      yearsOfExperience: skill.yearsOfExperience,
    }));

    skillsFetcher.submit(
      {
        skills: JSON.stringify(skillsWithExperience),
        "target-updated": "freelancer-skills",
      },
      { method: "post" }
    );
  };

  const maxVisibleSkills = 2;
  const extraSkills = freelancerSkills.length - maxVisibleSkills;
  const visibleSkills = freelancerSkills.slice(0, maxVisibleSkills);
  const hiddenSkills = freelancerSkills.slice(maxVisibleSkills);

  return (
    <>
      <div className="lg:ml-auto flex flex-col xl:mr-20 md:mr-10 mr-0 gap-2">
        {/* HEADER - Skills Title & Edit Button */}
        <div className="flex items-center justify-between w-full">
          <span className="relative 2xl:text-lg lg:text-base text-sm font-medium">
            Skills
          </span>

          {canEdit && (
            <Dialog
              open={skillsDialogOpen}
              onOpenChange={handleSkillDialogChange}
            >
              <DialogTrigger asChild>
                <Button variant="link">
                  {/* ✏️ */}
                  <IoPencilSharp className="lg:relative absolute lg:left-0 left-10 xl:h-7 h-6 xl:w-7 w-6 text-primaryColor hover:bg-gray-200 transition-all rounded-full p-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white lg:w-[500px] w-[300px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="mt-3">Skills</DialogTitle>
                  <DialogDescription>
                    Add at least 5 skills, then specify years of experience for
                    each.
                  </DialogDescription>
                </DialogHeader>

                {showMessage && skillsFetcher.data?.error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 lg:px-4 px-2 lg:py-3 py-1 rounded relative mb-4">
                    <span className="block sm:inline">
                      {skillsFetcher.data.error.message}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <SearcheableTagSelector<Skill>
                    dataType="skill"
                    selectedItems={selectedSkills}
                    setSelectedItems={setSelectedSkills}
                    itemLabel={(item: Skill) => item.label}
                    itemKey={(item: Skill) => item.id}
                    formName="freelancer-skills"
                    fieldName="freelancer-skills"
                    searchPlaceholder="Search skills..."
                    autoSubmit={false}
                  />
                </div>

                <div className="space-y-4 mt-6">
                  {freelancerSkills.map((skill) => (
                    <div key={skill.skillId} className="mb-4">
                      <div className="relative inline-block group">
                        <Badge
                          className="cursor-pointer xl:px-4 px-3 xl:py-2 py-1 bg-blue-100 text-gray-900 rounded-2xl hover:bg-blue-200 transition"
                          onClick={() => handleRemoveSkill(skill.skillId)}
                        >
                          {skill.label}
                          <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 text-white rounded-full lg:w-4 w-3 lg:h-4 h-3 flex items-center justify-center text-xs">
                            ×
                          </span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleSubmit}
                    disabled={skillsFetcher.state === "submitting"}
                    className="text-white lg:py-4 py-3 lg:px-10 px-6 rounded-xl bg-primaryColor font-medium hover:bg-primaryColor"
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* SKILLS LIST - Independent Layout */}
        <div className="flex flex-wrap items-start gap-2 w-full">
          {freelancerSkills.length > 0 ? (
            <>
              {visibleSkills.map((skill) => (
                <Badge
                  key={skill.skillId}
                  className="xl:px-4 px-3 py-1 xl:text-sm text-xs bg-blue-100 text-gray-900 rounded-2xl shadow-sm"
                >
                  {skill.label}
                </Badge>
              ))}

              {extraSkills > 0 && (
                <Dialog open={showAll} onOpenChange={setShowAll}>
                  <DialogTrigger asChild>
                    <Badge
                      variant="outline"
                      className="xl:px-4 px-3 py-1 xl:text-sm text-xs bg-gray-200 text-gray-700 rounded-2xl shadow-sm hover:bg-gray-300"
                    >
                      +{extraSkills} more
                    </Badge>
                  </DialogTrigger>
                  <DialogContent className="bg-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="xl:text-lg text-base">
                        All Skills
                      </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-wrap items-start gap-2 mt-4">
                      {hiddenSkills.map((skill) => (
                        <Badge
                          key={skill.skillId}
                          className="px-3 py-1 xl:text-sm text-xs bg-blue-100 text-gray-900 rounded-2xl shadow-sm flex items-center justify-center w-fit"
                        >
                          {skill.label}
                        </Badge>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </>
          ) : (
            <span className="text-gray-500 text-sm italic">
              No skills added
            </span>
          )}
        </div>
      </div>
    </>
  );
}
