<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request) {
        $q = Category::query();
        if ($request->divisionId) $q->where('division_id', $request->divisionId);
        return response()->json(['success' => true, 'data' => $q->where('is_active', true)->orderBy('sort_order')->get()]);
    }
    public function store(Request $request) {
        $data = $request->validate(['name' => 'required', 'slug' => 'required', 'division_id' => 'required|exists:divisions,id']);
        if ($request->user()->role === 'division_admin' && $request->user()->division_id !== $data['division_id']) abort(403);
        return response()->json(['success' => true, 'data' => Category::create($data)], 201);
    }
    public function update(Request $request, $id) {
        $c = Category::findOrFail($id);
        if ($request->user()->role === 'division_admin' && $request->user()->division_id !== $c->division_id) abort(403);
        $c->update($request->all());
        return response()->json(['success' => true, 'data' => $c->fresh()]);
    }
    public function destroy(Request $request, $id) {
        $c = Category::findOrFail($id);
        if ($request->user()->role === 'division_admin' && $request->user()->division_id !== $c->division_id) abort(403);
        $c->delete();
        return response()->json(['success' => true]);
    }
}
