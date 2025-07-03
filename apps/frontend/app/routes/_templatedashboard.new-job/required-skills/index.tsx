import { useEffect, useRef, useState } from 'react';
import { data, useLoaderData } from '@remix-run/react';
import { Badge } from '../../../components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '../../../components/ui/popover';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { Input } from '../../../components/ui/input';
import { Skill } from '@mawaheb/db/types';
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from '../../../components/ui/command';

interface RequiredSkillsProps {
  selectedSkills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export default function RequiredSkills({ selectedSkills, onChange }: RequiredSkillsProps) {
  const triggerRef = useRef(null);
  const [popoverWidth, setPopoverWidth] = useState(350);
  const { skills: loadedSkills = [] } = useLoaderData<{ skills?: Skill[] }>();
  const [skills, setSkills] = useState<Skill[]>(loadedSkills);

  // --- Added for async search ---
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Skill[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const updatePopoverWidth = () => {
      if (triggerRef.current) {
        setPopoverWidth(triggerRef.current.offsetWidth);
      }
    };
    updatePopoverWidth();
    window.addEventListener('resize', updatePopoverWidth);
    return () => {
      window.removeEventListener('resize', updatePopoverWidth);
    };
  }, []);

  // ---- async search effect ----
  useEffect(() => {
    if (!open) return;
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/skills-search?q=${encodeURIComponent(searchTerm)}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(Array.isArray(data.skills) ? data.skills : []);
          setSearchLoading(false);
        })
        .catch(() => setSearchLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [searchTerm, open]);

  const toggleSkill = (skill: Skill) => {
    const updatedSkills = selectedSkills.some(s => s.name === skill.name)
      ? selectedSkills.filter(s => s.name !== skill.name)
      : [...selectedSkills, skill];
    onChange(updatedSkills);
  };

  const toggleStarredSkill = (skill: Skill) => {
    const updatedSkills = selectedSkills.map(s =>
      s.name === skill.name ? { ...s, isStarred: !s.isStarred } : s
    );
    onChange(updatedSkills);
  };

  const handleSelectSkill = (skill: Skill) => {
    if (!selectedSkills.some(s => s.name === skill.name)) {
      onChange([...selectedSkills, skill]);
    }
    setSearchTerm('');
    setSearchResults([]);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [open]);

  const renderSelectedSkillsInInput = () => {
    const maxVisibleBadges = 3;
    const visibleSkills = selectedSkills.slice(0, maxVisibleBadges);
    const moreSkillsCount = selectedSkills.length - maxVisibleBadges;

    return (
      <div className="grid grid-cols-2 w-fit lg:grid-cols-3 xl:flex xl:items-center gap-1 xl:gap-2 sm:p-2 p-1">
        <input
          type="hidden"
          name="jobSkills"
          value={selectedSkills.map(skill => skill.name).join(',')}
        />
        {visibleSkills.map(skill => (
          <Badge
            key={skill.name}
            className={`cursor-pointer text-sm tracking-wide pl-3 pr-5 py-2 text-gray-700  ${
              skill.isStarred
                ? 'bg-[rgb(202,230,255)] hover:bg-[hsl(208,95%,85%)] border-none'
                : 'border bg-white text-gray-700 hover:bg-gray-200 hover:border-gray-400'
            }`}
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          ref={triggerRef}
          className="cursor-pointer border border-slate-300 rounded-xl p-1"
          onClick={() => setOpen(true)}
        >
          {selectedSkills.length > 0 ? (
            renderSelectedSkillsInInput()
          ) : (
            // --- Replace Input with nothing; typing is in combobox now
            <div className="w-full min-h-[38px] px-2 flex items-center text-slate-500 text-base">
              Required Skills
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        style={{
          width: `${popoverWidth}px`,
          zIndex: 1000,
          maxHeight: '500px',
          overflowY: 'auto',
        }}
        className="p-0 bg-white shadow-xl rounded-xl"
      >
        <div className="p-8 pt-6 pb-4">
          <p className="text-lg mb-6 font-semibold">Popular skills for Design</p>

          {/* selected skills */}
          <div className="flex flex-col flex-wrap gap-y-3 gap-x-2 mt-4">
            <div className="flex gap-2 ml-1">
              <div className="mt-3 text-sm text-gray-600">
                Choosed Skills: ( if you wana remove a skill, click on it )
              </div>
            </div>
            <div className="flex flex-wrap gap-y-3 gap-x-2">
              {selectedSkills.length === 0 ? (
                <div className="text-sm text-gray-600 ml-1 italic">No skills yet</div>
              ) : (
                selectedSkills.map(skill => (
                  <div
                    key={skill.name}
                    className="flex items-center font-medium cursor-pointer rounded-xl"
                  >
                    <Badge
                      className={`cursor-pointer text-sm tracking-wide pl-3 pr-5 py-2 text-gray-700  ${
                        skill.isStarred
                          ? 'bg-[rgb(202,230,255)] hover:bg-[hsl(208,95%,85%)] border-none'
                          : 'border bg-white text-gray-700 hover:bg-gray-200 hover:border-gray-400'
                      }`}
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
                ))
              )}
            </div>
          </div>

          {/* separator line -------------- */}
          <div className="border-t mt-4"></div>

          {/* ---- ComboBox Search ---- */}
          <Command className="border mt-6">
            <CommandInput
              placeholder="Search skills…"
              value={searchTerm}
              onValueChange={setSearchTerm}
              autoFocus
              className=""
            />
            <CommandList>
              {searchLoading && <div className="px-4 py-2 text-sm text-gray-400">Searching…</div>}
              {/* Show async search results */}
              {searchTerm && !searchLoading ? (
                searchResults.length > 0 ? (
                  searchResults
                    .filter(skill => !selectedSkills.some(s => s.name === skill.name))
                    .map(skill => (
                      <CommandItem
                        key={skill.name}
                        onSelect={() => handleSelectSkill(skill)}
                        className="cursor-pointer"
                      >
                        {skill.name}
                      </CommandItem>
                    ))
                ) : (
                  <CommandEmpty>
                    <button
                      className="px-4 py-2 bg-primary text-white rounded-md mt-2 hover:bg-primary/80 transition"
                      onMouseDown={async e => {
                        e.preventDefault();
                        if (!searchTerm.trim()) return;
                        setSearchLoading(true);
                        const res = await fetch('/api/skills-add', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: searchTerm.trim() }),
                        });
                        const data = await res.json();
                        setSearchLoading(false);

                        if (data.skill) {
                          onChange([...selectedSkills, data.skill]);
                          setSearchTerm('');
                          setSearchResults([]);
                          setOpen(false);

                          setSkills(prev => [...prev, data.skill]); // ✅ This is what keeps your skills list in sync!
                        } else {
                          alert(data.error || 'Failed to add skill');
                        }
                      }}
                    >
                      + Add “{searchTerm.trim()}” as a new skill
                    </button>
                  </CommandEmpty>
                )
              ) : null}
            </CommandList>
          </Command>
          {/* ---- End ComboBox Search ---- */}

          {/* separator line -------------- */}
          {searchTerm && <div className="border-t my-6"></div>}

          {/* skills to choose (from loader, only when not searching) */}
          {!searchTerm && (
            <div className="">
              <div className="flex gap-2 mt-2">
                <div className="mt-3 text-sm text-gray-600 underline">OR,</div>
                <div className="mt-3 text-sm text-gray-600">Choose your needed skills:</div>
              </div>
              <div className="flex flex-wrap gap-y-3 gap-x-2 mb-6 mt-5">
                {skills
                  .filter(skill => !selectedSkills.some(s => s.name === skill.name))
                  .map(skill => (
                    <Badge
                      key={skill.name}
                      onClick={() => toggleSkill(skill)}
                      className="cursor-pointer tracking-wide text-sm px-4 py-2 rounded-full border bg-white text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400"
                    >
                      {skill.name}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {!searchTerm && <div className="border-t my-6"></div>}

          <p className="mt-4 text-sm text-gray-600">
            Add at least 5 skills, then star 3-4 of them you consider your top skill.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            You need to select at least {Math.max(0, 5 - selectedSkills.length)} more skills and
            star {Math.max(0, 3 - selectedSkills.filter(skill => skill.isStarred).length)} more
            skills.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
