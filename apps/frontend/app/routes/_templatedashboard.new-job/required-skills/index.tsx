import { useEffect, useRef, useState } from "react";
import { Badge } from "../../../components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../../components/ui/popover";
import { FaStar } from "react-icons/fa";
import { Input } from "../../../components/ui/input";

export default function SkillsPopup() {
  // handle popup resizing when the screen size changes
  const triggerRef = useRef(null);
  const [popoverWidth, setPopoverWidth] = useState(350);
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

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [starredSkills, setStarredSkills] = useState([]);

  const popularSkills = [
    { id: 1, label: "Responsive Web Design" },
    { id: 2, label: "JavaScript" },
    { id: 3, label: "HTML/CSS" },
    { id: 4, label: "Social Media Marketing" },
    { id: 5, label: "Accounting" },
    { id: 6, label: "DevOps" },
    { id: 7, label: "Technical Support" },
    { id: 8, label: "other" },
  ];

  const toggleSkill = (skill) => {
    if (selectedSkills.some((s) => s.id === skill.id)) {
      setSelectedSkills(selectedSkills.filter((s) => s.id !== skill.id));
      setStarredSkills(starredSkills.filter((s) => s.id !== skill.id));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const toggleStarredSkill = (skill) => {
    if (starredSkills.some((s) => s.id === skill.id)) {
      setStarredSkills(starredSkills.filter((s) => s.id !== skill.id));
    } else {
      if (starredSkills.length < 4) {
        setStarredSkills([...starredSkills, skill]);
      }
    }
  };

  const renderSelectedSkillsInInput = () => {
    const maxVisibleBadges = 3;
    const visibleSkills = selectedSkills.slice(0, maxVisibleBadges);
    const moreSkillsCount = selectedSkills.length - maxVisibleBadges;

    return (
      <div className="flex items-center gap-2">
        <input
          type="hidden"
          name="jobSkills"
          value={selectedSkills.map((skill) => skill.id.toString()).join(",")}
        />
        {visibleSkills.map((skill) => (
          <Badge
            key={skill.id}
            className="bg-blue-500 text-white flex items-center gap-1"
          >
            {skill.label.length > 10
              ? skill.label.slice(0, 10) + "..."
              : skill.label}
            {starredSkills.some((s) => s.id === skill.id) && (
              <FaStar className="h-3 w-3 text-yellow-400" />
            )}
          </Badge>
        ))}
        {moreSkillsCount > 0 && (
          <Badge className="bg-gray-300 text-gray-700">
            +{moreSkillsCount} more
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div ref={triggerRef} className="cursor-pointer border rounded p-2">
          {selectedSkills.length > 0 ? (
            renderSelectedSkillsInInput()
          ) : (
            <Input
              placeholder="Required Skills"
              className="cursor-pointer"
              readOnly
            />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        style={{ width: `${popoverWidth}px` }}
        className="p-4 w-[350px] bg-white"
      >
        <h4 className="text-lg font-semibold mb-2">
          Popular skills for Design
        </h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {popularSkills
            .filter((skill) => !selectedSkills.some((s) => s.id === skill.id))
            .map((skill) => (
              <Badge
                key={skill.id}
                onClick={() => toggleSkill(skill)}
                className={`cursor-pointer ${selectedSkills.some((s) => s.id === skill.id) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                {skill.label}
              </Badge>
            ))}
        </div>
        <div className="border-t pt-4">
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-1 border p-2 rounded-lg cursor-pointer"
              >
                <Badge
                  onClick={() => toggleSkill(skill)}
                  className={`cursor-pointer ${selectedSkills.some((s) => s.id === skill.id) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                  {skill.label}
                </Badge>
                <FaStar
                  onClick={() => toggleStarredSkill(skill)}
                  className={`h-5 w-5 ${starredSkills.some((s) => s.id === skill.id) ? "text-yellow-400" : "text-gray-400"} cursor-pointer hover:scale-110 transition-transform`}
                />
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
          more skills and star {Math.max(0, 3 - starredSkills.length)} more
          skills.
        </p>
      </PopoverContent>
    </Popover>
  );
}
