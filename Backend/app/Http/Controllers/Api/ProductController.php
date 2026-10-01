<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request) {
        $q = Product::query()->where('is_active', true);
        if ($request->divisionId) $q->where('division_id', $request->divisionId);
        if ($request->search) $q->where('name', 'like', "%{$request->search}%");
        return response()->json(['success' => true, 'data' => $q->paginate($request->perPage ?? 24)]);
    }
    public function show($slug) {
        return response()->json(['success' => true, 'data' => Product::where('slug', $slug)->firstOrFail()]);
    }
    public function store(Request $request) {
        $data = $request->validate(['name' => 'required', 'slug' => 'required|unique:products,slug', 'price' => 'required|numeric', 'division_id' => 'required', 'category_id' => 'required']);
        if ($request->user()->role === 'division_admin' && $request->user()->division_id !== $data['division_id']) abort(403);
        return response()->json(['success' => true, 'data' => Product::create($data)]);
    }
    public function update(Request $request, $id) {
        $p = Product::findOrFail($id);
        if ($request->user()->role === 'division_admin' && $request->user()->division_id !== $p->division_id) abort(403);
        $p->update($request->all());
        return response()->json(['success' => true, 'data' => $p->fresh()]);
    }
    public function destroy(Request $request, $id) {
        $p = Product::findOrFail($id);
        if ($request->user()->role === 'division_admin' && $request->user()->division_id !== $p->division_id) abort(403);
        $p->delete();
        return response()->json(['success' => true]);
    }
}
