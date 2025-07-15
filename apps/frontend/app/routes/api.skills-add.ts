import { json } from '@remix-run/node';
import { addSkillIfNotExists } from '~/servers/skill.server';

export const action = async ({ request }) => {
  const body = await request.json();
  const { name } = body;
  if (!name) return json({ error: 'Missing skill name' }, { status: 400 });

  try {
    const skill = await addSkillIfNotExists(name);
    return json({ skill });
  } catch (err: any) {
    return json({ error: err.message || 'Failed' }, { status: 500 });
  }
};
