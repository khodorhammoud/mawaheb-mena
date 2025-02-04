import { useEffect, useRef, useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { Badge } from "../../../components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../../components/ui/popover";
import { FaStar } from "react-icons/fa";
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
            key={skill.name}
            className="bg-blue-500 text-white flex items-center p-1 px-2 gap-1 xl:px-3 py-2 hover:bg-blue-600"
          >
            {skill.name.length > 10
              ? skill.name.slice(0, 10) + "..."
              : skill.name}
            {skill.isStarred && <FaStar className="h-3 w-4 text-yellow-400" />}
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
        className="p-4 bg-white shadow-xl rounded-xl"
      >
        <h4 className="text-lg font-semibold mb-2">Popular skills</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills
            .filter(
              (skill) => !selectedSkills.some((s) => s.name === skill.name)
            )
            .map((skill) => (
              <Badge
                key={skill.name}
                onClick={() => toggleSkill(skill)}
                className={`cursor-pointer px-4 py-2 rounded-full border bg-white hover:bg-blue-100 ${
                  selectedSkills.some((s) => s.name === skill.name)
                    ? "bg-blue-100 text-blue-600 border-blue-600"
                    : "text-gray-600 border-gray-300"
                }`}
              >
                {skill.name}
              </Badge>
            ))}
        </div>
        <div className="border-t pt-4">
          <div className="flex flex-wrap">
            {selectedSkills.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center cursor-pointer rounded-xl p-2"
              >
                <Badge
                  className={`cursor-pointer px-2 gap-1 xl:px-3 py-2 ${
                    selectedSkills.some((s) => s.name === skill.name)
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-200"
                  }`}
                >
                  <FaStar
                    onClick={() => toggleStarredSkill(skill)}
                    className={`h-4 w-4 ${
                      skill.isStarred ? "text-yellow-400" : "text-gray-400"
                    } cursor-pointer hover:scale-110 transition-transform`}
                  />
                  <div onClick={() => toggleSkill(skill)}>{skill.name}</div>
                </Badge>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Add at least 5 skills, then star 3-4 of them you consider your top
          skill.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          You need to select at least {Math.max(0, 5 - selectedSkills.length)}{" "}
          more skills and star{" "}
          {/* {Math.max(
            0,
            3 - selectedSkills.filter((skill) => skill.isStarred).length
            )}{" "} */}
          3 more skills.
        </p>
      </PopoverContent>
    </Popover>
  );
}
