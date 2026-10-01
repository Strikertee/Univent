<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /** Stores transfer-receipt photos; returns a public URL saved on the order/booking. */
    public function receipt(Request $request)
    {
        $request->validate(['receipt' => 'required|image|max:8192']);
        $path = $request->file('receipt')->storeAs(
            'receipts/' . now()->format('Y-m'),
            (string) Str::uuid() . '.' . $request->file('receipt')->extension(),
            'public'
        );
        return response()->json(['success' => true, 'data' => ['url' => asset('storage/' . $path)]]);
    }
}
