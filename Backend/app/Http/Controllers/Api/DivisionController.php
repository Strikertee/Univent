<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Division;
use Illuminate\Http\Request;

class DivisionController extends Controller
{
    public function index() {
        return response()->json(['success' => true, 'data' => Division::where('is_active', true)->orderBy('sort_order')->get()]);
    }
    public function show($slug) {
        $division = Division::where('slug', $slug)->firstOrFail();
        return response()->json(['success' => true, 'data' => $division]);
    }
    public function store(Request $request) {
        $data = $request->validate(['name' => 'required', 'slug' => 'required|unique:divisions,slug', 'description' => 'nullable']);
        return response()->json(['success' => true, 'data' => Division::create($data)]);
    }
    public function update(Request $request, $id) {
        $division = Division::findOrFail($id);
        // Division admins may only edit their own division
        if ($request->user()->role === 'division_admin' && $request->user()->division_id !== $division->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }
        $division->update($request->all());
        return response()->json(['success' => true, 'data' => $division->fresh()]);
    }
}
