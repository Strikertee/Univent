<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use Illuminate\Http\Request;

class FacilityController extends Controller
{
    public function index(Request $request) {
        $q = Facility::query()->where('is_active', true);
        if ($request->divisionId) $q->where('division_id', $request->divisionId);
        return response()->json(['success' => true, 'data' => $q->get()]);
    }
    public function store(Request $request) {
        $data = $request->validate(['name' => 'required', 'slug' => 'required', 'division_id' => 'required|exists:divisions,id']);
        if ($request->user()->role === 'division_admin' && $request->user()->division_id !== $data['division_id']) abort(403);
        return response()->json(['success' => true, 'data' => Facility::create($data)], 201);
    }
    public function update(Request $request, $id) {
        $f = Facility::findOrFail($id);
        if ($request->user()->role === 'division_admin' && $request->user()->division_id !== $f->division_id) abort(403);
        $f->update($request->all());
        return response()->json(['success' => true, 'data' => $f->fresh()]);
    }
    public function destroy(Request $request, $id) {
        $f = Facility::findOrFail($id);
        if ($request->user()->role === 'division_admin' && $request->user()->division_id !== $f->division_id) abort(403);
        $f->delete();
        return response()->json(['success' => true]);
    }
}
