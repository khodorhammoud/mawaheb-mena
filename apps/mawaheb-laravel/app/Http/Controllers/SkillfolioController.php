<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessSkillfolio;
use App\Services\SkillfolioService;
use App\Services\Neo4jService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SkillfolioController extends Controller
{
    public function __construct(
        private readonly SkillfolioService $skillfolioService,
        private readonly Neo4jService $neo4jService,
    ) {}

    public function show(Request $request)
    {
        $skillfolio = $this->skillfolioService->getStoredSkillfolio($request->user()->id);

        return Inertia::render('Dashboard/Skillfolio', [
            'skillfolio' => $skillfolio,
        ]);
    }

    public function trigger(Request $request)
    {
        $userId = $request->user()->id;

        ProcessSkillfolio::dispatch($userId);

        return back()->with('success', 'Skillfolio generation started.');
    }

    public function extract(Request $request)
    {
        $userId = $request->user()->id;
        $skillfolio = $this->skillfolioService->extractSkillfolio($userId);

        if (!$skillfolio) {
            return back()->with('error', 'Failed to generate skillfolio.');
        }

        return back()->with('success', 'Skillfolio generated successfully.');
    }

    public function seedKnowledgeGraph(Request $request)
    {
        $validated = $request->validate([
            'graph_data' => 'required|array',
            'graph_data.nodes' => 'required|array',
            'graph_data.edges' => 'required|array',
        ]);

        $this->neo4jService->seedKnowledgeGraph($validated['graph_data']);

        return response()->json(['success' => true, 'message' => 'Knowledge graph seeded.']);
    }
}
