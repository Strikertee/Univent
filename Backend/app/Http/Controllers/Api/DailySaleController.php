<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailySale;
use Illuminate\Http\Request;

class DailySaleController extends Controller
{
    public function index(Request $request) {
        $q = DailySale::query()->orderByDesc('date');
        // Division admins see only their division's log
        if ($request->user()->role === 'division_admin') $q->where('division_id', $request->user()->division_id);
        elseif ($request->divisionId) $q->where('division_id', $request->divisionId);
        return response()->json(['success' => true, 'data' => $q->paginate(30)]);
    }
    public function store(Request $request) {
        $data = $request->validate(['date' => 'required|date', 'item' => 'required|string', 'amount' => 'required|numeric|min:1', 'division_id' => 'nullable|exists:divisions,id']);
        $data['division_id'] = $request->user()->role === 'division_admin'
            ? $request->user()->division_id
            : ($data['division_id'] ?? $request->user()->division_id);
        $data['division_name'] = $data['division_id'] ? optional(\App\Models\Division::find($data['division_id']))->name : null;
        $data['entered_by'] = trim(($request->user()->first_name ?? '') . ' ' . ($request->user()->last_name ?? ''));
        return response()->json(['success' => true, 'data' => DailySale::create($data)], 201);
    }
    public function destroy(Request $request, $id) {
        $s = DailySale::findOrFail($id);
        if ($request->user()->role === 'division_admin' && $s->division_id !== $request->user()->division_id) abort(403);
        $s->delete();
        return response()->json(['success' => true]);
    }
}
