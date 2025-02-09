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
import { useLoaderData, useFetcher } from "@remix-run/react";
import SearcheableTagSelector from "~/common/SearcheableTagSelector";
import { Badge } from "~/components/ui/badge";
import {
  FreelancerSkill,
  Skill,
} from "~/routes/_templatedashboard.onboarding/types";
// import { SlBadge } from "react-icons/sl";
import AppFormField from "~/common/form-fields";

export default function Skills() {
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [freelancerSkills, setFreelancerSkills] = useState<FreelancerSkill[]>(
    []
  );

  const { freelancerSkills: initialFreelancerSkills } = useLoaderData<{
    freelancerSkills: FreelancerSkill[];
  }>();

  const skillsFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>();

  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkills((prev) => prev.filter((skill) => skill.id !== skillId));
  };

  // Set initial skills
  useEffect(() => {
    setFreelancerSkills(initialFreelancerSkills);
    setTimeout(() => {
      setSelectedSkills(
        initialFreelancerSkills.map(
          (skill) =>
            ({
              id: skill.skillId,
              label: skill.label,
            }) as Skill
        )
      );
    }, 100);
  }, [initialFreelancerSkills]);

  // update freelancer skills when selected skills change
  useEffect(() => {
    let newSkills = freelancerSkills;
    // remove skills that are not in selectedSkills from newSkills
    newSkills = newSkills.filter((skill) =>
      selectedSkills.some((s) => s.id === skill.skillId)
    );
    // add skills that are in selectedSkills but not in newSkills
    newSkills = [
      ...newSkills,
      ...selectedSkills
        .filter((skill) => !newSkills.some((s) => s.skillId === skill.id))
        .map((skill) => {
          // Try to find the skill in initialFreelancerSkills
          const existingSkill = initialFreelancerSkills.find(
            (s) => s.skillId === skill.id
          );

          return {
            skillId: skill.id,
            label: skill.label,
            yearsOfExperience: existingSkill?.yearsOfExperience ?? 0,
          };
        }),
    ];
    setFreelancerSkills(newSkills);
  }, [selectedSkills]);

  // Handle showing submission message
  useEffect(() => {
    if (skillsFetcher.data?.success || skillsFetcher.data?.error) {
      setShowMessage(true);
    }
  }, [skillsFetcher.data]);

  const handleSkillDialogChange = (isOpen: boolean) => {
    setSkillsDialogOpen(isOpen);
    if (!isOpen) {
      setShowMessage(false);
    }
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

  /* const handleIncrement = (skillId: number, increment: number) => {
    setFreelancerSkills((prev) =>
      prev.map((skill) =>
        skill.skillId === skillId
          ? { ...skill, yearsOfExperience: skill.yearsOfExperience + increment }
          : skill
      )
    );
  }; */

  return (
    <>
      <div className="ml-auto flex items-center xl:mr-20 md:mr-10 mr-0">
        <span className="lg:text-lg sm:text-base text-sm">Skills</span>
        <Dialog open={skillsDialogOpen} onOpenChange={handleSkillDialogChange}>
          <DialogTrigger asChild>
            <Button variant="link">
              <IoPencilSharp className="h-7 w-7 text-small text-primaryColor hover:bg-[#E4E3E6] transition-all rounded-full p-1 xl:-ml-1 lg:-ml-2 -ml-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="mt-3">Skills</DialogTitle>
              <DialogDescription>
                Add at least 5 skills, then specify years of experience for each
              </DialogDescription>
            </DialogHeader>

            {showMessage && skillsFetcher.data?.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
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
                // maxSelections={5}
              />
            </div>

            <div className="space-y-4 mt-6">
              {freelancerSkills.map((skill) => (
                <div key={skill.skillId} className="mb-4">
                  <div className="relative inline-block group">
                    <Badge
                      className="cursor-pointer rounded-2xl px-4 py-2 mb-2 bg-blue-100 text-gray-900 hover:bg-blue-100"
                      onClick={() => handleRemoveSkill(skill.skillId)}
                    >
                      {skill.label}
                      <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                        ×
                      </span>
                    </Badge>
                  </div>

                  <div className="w-[200px]">
                    <AppFormField
                      type="increment"
                      id={skill.skillId.toString()}
                      name={skill.skillId.toString()}
                      defaultValue={skill.yearsOfExperience}
                      onChange={(e) => {
                        handleYearsChange(
                          skill.skillId,
                          parseInt(e.target.value)
                        );
                      }}
                    />

                    <span className="text-sm text-gray-500">years</span>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={skillsFetcher.state === "submitting"}
                className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
