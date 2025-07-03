import { json } from '@remix-run/node';
import { getSkillsByQuery } from '~/servers/skill.server';

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim() || '';

  if (!q) return json({ skills: [] });

  const skills = await getSkillsByQuery(q);

  return json({ skills });
};
