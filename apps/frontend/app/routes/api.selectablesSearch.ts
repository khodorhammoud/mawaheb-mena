import { LoaderFunctionArgs } from '@remix-run/node';
import { requireUserVerified } from '~/auth/auth.server';

import {
  fetchIndustriesSearch,
  fetchLanguagesSearch,
  fetchSkillsSearch,
} from '~/servers/general.server';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserVerified(request);

  const url = new URL(request.url);
  const dataType = url.searchParams.get('dataType');
  const searchTerm = url.searchParams.get('searchTerm') || '';

  // console.log('📥 [selectablesSearch loader] Params:', { dataType, searchTerm });

  if (dataType === 'skill') {
    const skills = await fetchSkillsSearch(searchTerm);
    // console.log('🎯 [loader] Skills returned:', skills.length);
    return Response.json({ items: skills });
  }

  if (dataType === 'language') {
    const languages = await fetchLanguagesSearch(searchTerm);
    // console.log('🎯 [loader] Languages returned:', languages.length);
    return Response.json({ items: languages });
  }

  if (dataType === 'industry') {
    const industries = await fetchIndustriesSearch(searchTerm);
    // console.log('🎯 [loader] Industries returned:', industries.length);
    return Response.json({ items: industries });
  }

  console.warn('⚠️ [loader] Invalid dataType:', dataType);
  return Response.json({ error: 'Invalid data type' }, { status: 400 });
}
