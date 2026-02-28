import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Skillfolio as SkillfolioType } from '@/types';

interface Props { skillfolio: SkillfolioType | null }

export default function Skillfolio({ skillfolio }: Props) {
    return (
        <DashboardLayout>
            <Head title="Skillfolio" />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Skillfolio</h1>
                <button onClick={() => router.post('/skillfolio/trigger')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
                    {skillfolio ? 'Regenerate' : 'Generate Skillfolio'}
                </button>
            </div>

            {!skillfolio ? (
                <div className="bg-white rounded-xl border p-12 text-center">
                    <p className="text-gray-500 mb-4">Your skillfolio hasn't been generated yet.</p>
                    <p className="text-sm text-gray-400">Click "Generate Skillfolio" to get your AI-powered skill assessment.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Readiness Score</h2>
                            <span className="text-3xl font-bold text-indigo-600">{skillfolio.readiness_score}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-indigo-600 h-3 rounded-full transition-all" style={{ width: `${skillfolio.readiness_score}%` }} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border p-6">
                            <h3 className="font-semibold mb-3">Domain & Field</h3>
                            <p className="text-sm text-gray-600">Domain: <span className="font-medium text-gray-900">{skillfolio.domain || 'N/A'}</span></p>
                            <p className="text-sm text-gray-600">Field: <span className="font-medium text-gray-900">{skillfolio.field || 'N/A'}</span></p>
                            <p className="text-sm text-gray-600">Subfield: <span className="font-medium text-gray-900">{skillfolio.subfield || 'N/A'}</span></p>
                        </div>
                        <div className="bg-white rounded-xl border p-6">
                            <h3 className="font-semibold mb-3 text-green-700">Strengths</h3>
                            <div className="flex flex-wrap gap-2">
                                {skillfolio.strengths?.map((s) => (
                                    <span key={s} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">{s}</span>
                                ))}
                                {(!skillfolio.strengths || skillfolio.strengths.length === 0) && <p className="text-sm text-gray-400">None identified</p>}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border p-6">
                            <h3 className="font-semibold mb-3 text-yellow-700">Areas for Improvement</h3>
                            <div className="flex flex-wrap gap-2">
                                {skillfolio.weaknesses?.map((w) => (
                                    <span key={w} className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">{w}</span>
                                ))}
                                {(!skillfolio.weaknesses || skillfolio.weaknesses.length === 0) && <p className="text-sm text-gray-400">None identified</p>}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border p-6">
                            <h3 className="font-semibold mb-3 text-red-700">Skill Gaps</h3>
                            <div className="flex flex-wrap gap-2">
                                {skillfolio.gaps?.map((g) => (
                                    <span key={g} className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">{g}</span>
                                ))}
                                {(!skillfolio.gaps || skillfolio.gaps.length === 0) && <p className="text-sm text-gray-400">None identified</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
