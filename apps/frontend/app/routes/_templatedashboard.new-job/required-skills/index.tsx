import { useEffect, useRef, useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { Badge } from "../../../components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../../components/ui/popover";
import { FaStar, FaRegStar } from "react-icons/fa";
import { Input } from "../../../components/ui/input";
import { Skill } from "~/types/Skill";

interface RequiredSkillsProps {
  selectedSkills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export default function RequiredSkills({
  selectedSkills,
  onChange,
}: RequiredSkillsProps) {
  const triggerRef = useRef(null);
  const [popoverWidth, setPopoverWidth] = useState(350);
  const { skills = [] } = useLoaderData<{ skills?: Skill[] }>();

  useEffect(() => {
    const updatePopoverWidth = () => {
      if (triggerRef.current) {
        setPopoverWidth(triggerRef.current.offsetWidth);
      }
    };
    updatePopoverWidth();
    window.addEventListener("resize", updatePopoverWidth);
    return () => {
      window.removeEventListener("resize", updatePopoverWidth);
    };
  }, []);

  const toggleSkill = (skill: Skill) => {
    const updatedSkills = selectedSkills.some((s) => s.name === skill.name)
      ? selectedSkills.filter((s) => s.name !== skill.name)
      : [...selectedSkills, skill];
    onChange(updatedSkills);
  };

  const toggleStarredSkill = (skill: Skill) => {
    const updatedSkills = selectedSkills.map((s) =>
      s.name === skill.name ? { ...s, isStarred: !s.isStarred } : s
    );
    onChange(updatedSkills);
  };

  const renderSelectedSkillsInInput = () => {
    const maxVisibleBadges = 3;
    const visibleSkills = selectedSkills.slice(0, maxVisibleBadges);
    const moreSkillsCount = selectedSkills.length - maxVisibleBadges;

    return (
      <div className="grid grid-cols-2 w-fit lg:grid-cols-3 xl:flex xl:items-center gap-1 xl:gap-2 sm:p-2 p-1">
        <input
          type="hidden"
          name="jobSkills"
          value={selectedSkills.map((skill) => skill.name).join(",")}
        />
        {visibleSkills.map((skill) => (
          <Badge
            className={`cursor-pointer text-sm tracking-wide pl-3 pr-5 py-2 text-gray-700  ${skill.isStarred ? "bg-[rgb(202,230,255)] hover:bg-[hsl(208,95%,85%)] border-none" : "border bg-white text-gray-700 hover:bg-gray-200 hover:border-gray-400"}`}
          >
            <div onClick={() => toggleStarredSkill(skill)}>
              {skill.isStarred ? (
                <FaStar className="h-4 w-4 mr-2 text-primaryColor cursor-pointer hover:scale-110 transition-transform" />
              ) : (
                <FaRegStar className="h-4 w-4 mr-2 text-gray-400 cursor-pointer hover:scale-110 transition-transform" />
              )}
            </div>
            <div onClick={() => toggleSkill(skill)}>{skill.name}</div>
          </Badge>
        ))}
        {moreSkillsCount > 0 && (
          <Badge className="bg-gray-300 text-gray-700 flex justify-center px-4 py-2 hover:bg-gray-400">
            +{moreSkillsCount} more
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          ref={triggerRef}
          className="cursor-pointer border border-slate-300 rounded-xl p-1"
        >
          {selectedSkills.length > 0 ? (
            renderSelectedSkillsInInput()
          ) : (
            <Input
              placeholder="Required Skills"
              className="cursor-pointer border-none text-slate-500 text-base"
              readOnly
            />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        style={{
          width: `${popoverWidth}px`,
          zIndex: 1000,
        }}
        className="p-8 bg-white shadow-xl rounded-xl"
      >
        <p className="text-lg mb-6 font-semibold">Popular skills for Design</p>

        {/* skills to choose */}
        <div className="flex flex-wrap gap-y-3 gap-x-2 mb-6">
          {skills
            .filter(
              (skill) => !selectedSkills.some((s) => s.name === skill.name)
            )
            .map((skill) => (
              <Badge
                key={skill.name}
                onClick={() => toggleSkill(skill)}
                className="cursor-pointer tracking-wide text-sm px-4 py-2 rounded-full border bg-white text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400"
              >
                {skill.name}
              </Badge>
            ))}
        </div>

        {/* separator line -------------- */}
        <div className="border-t mb-6"></div>

        {/* selected skills */}
        <div className="flex flex-wrap gap-y-3 gap-x-2">
          {selectedSkills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-center font-medium cursor-pointer rounded-xl"
            >
              <Badge
                className={`cursor-pointer text-sm tracking-wide pl-3 pr-5 py-2 text-gray-700  ${skill.isStarred ? "bg-[rgb(202,230,255)] hover:bg-[hsl(208,95%,85%)] border-none" : "border bg-white text-gray-700 hover:bg-gray-200 hover:border-gray-400"}`}
              >
                <div onClick={() => toggleStarredSkill(skill)}>
                  {skill.isStarred ? (
                    <FaStar className="h-4 w-4 mr-2 text-primaryColor cursor-pointer hover:scale-110 transition-transform" />
                  ) : (
                    <FaRegStar className="h-4 w-4 mr-2 text-gray-400 cursor-pointer hover:scale-110 transition-transform" />
                  )}
                </div>
                <div onClick={() => toggleSkill(skill)}>{skill.name}</div>
              </Badge>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Add at least 5 skills, then star 3-4 of them you consider your top
          skill.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          You need to select at least {Math.max(0, 5 - selectedSkills.length)}{" "}
          more skills and star{" "}
          {Math.max(
            0,
            3 - selectedSkills.filter((skill) => skill.isStarred).length
          )}{" "}
          more skills.
        </p>
      </PopoverContent>
    </Popover>
  );
}
