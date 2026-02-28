<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Http\Request;

class SkillApiController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q', '');

        if (strlen(trim($query)) === 0) {
            return response()->json([]);
        }

        $skills = Skill::where('label', 'ilike', "%{$query}%")
            ->limit(10)
            ->get(['id', 'label']);

        return response()->json($skills);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:100',
        ]);

        $existing = Skill::whereRaw('LOWER(label) = ?', [strtolower($validated['label'])])->first();
        if ($existing) {
            return response()->json($existing);
        }

        $skill = Skill::create([
            'label' => $validated['label'],
            'created_at' => now(),
        ]);

        return response()->json($skill, 201);
    }

    public function index()
    {
        return response()->json(Skill::orderBy('label')->get(['id', 'label']));
    }
}
